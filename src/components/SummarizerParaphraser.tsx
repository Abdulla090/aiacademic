import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Copy, RefreshCw, FileText, RotateCcw, Download } from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from "jspdf";
import { notoNaskhArabic } from '@/lib/fonts';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { LanguageSelection } from './LanguageSelection';

export const SummarizerParaphraser = () => {
  const [text, setText] = useState('');
  const [summarizedText, setSummarizedText] = useState('');
  const [responseLanguage, setResponseLanguage] = useState('en');
  const [paraphrasedText, setParaphrasedText] = useState('');
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summarize');
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast({
        title: 'هەڵە',
        description: 'تکایە نووسینەکەت بنووسە',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await geminiService.summarizeText(text, summaryLength);
      setSummarizedText(result);
      toast({
        title: 'کورتکردنەوە تەواو بوو',
        description: 'نووسینەکە کورت کرایەوە'
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا نووسینەکە کورت بکرێتەوە',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleParaphrase = async () => {
    if (!text.trim()) {
      toast({
        title: 'هەڵە',
        description: 'تکایە نووسینەکەت بنووسە',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await geminiService.paraphraseText(text);
      setParaphrasedText(result);
      toast({
        title: 'نووسینەوە تەواو بوو',
        description: 'نووسینەکە نووسرایەوە'
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا نووسینەکە بنووسرێتەوە',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: 'کۆپی کرا',
        description: 'نووسینەکە بۆ کلیپبۆرد کۆپی کرا'
      });
    } catch {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا کۆپی بکرێت',
        variant: 'destructive'
      });
    }
  };
  
  const handleDownload = async (text: string, title: string, format: 'text' | 'pdf' = 'text') => {
    try {
      if (format === 'pdf') {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;
        
        // Add Arabic/Kurdish font support
        doc.addFileToVFS('NotoNaskhArabic-Regular.ttf', notoNaskhArabic);
        doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
        doc.setFont('NotoNaskhArabic');

        // Add title
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        const titleLines = doc.splitTextToSize(title, pageWidth - 20);
        doc.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += (titleLines.length * 10) + 10;
        
        // Reset font
        doc.setFont(undefined, 'normal');
        doc.setFontSize(12);
        
        // Process content with markdown formatting
        const lines = (text || '').split('\n');
        let currentListItems: string[] = [];
        let currentListType: 'ul' | 'ol' | null = null;
        let inCodeBlock = false;
        
        const flushList = () => {
          if (currentListItems.length > 0) {
            currentListItems.forEach((item, index) => {
              // Check if we need a new page
              if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
                // Reset font for new page
                doc.setFont('NotoNaskhArabic');
                doc.setFontSize(12);
              }
              
              const bullet = currentListType === 'ol' ? `${index + 1}. ` : '• ';
              const itemText = `${bullet}${item}`;
              const itemLines = doc.splitTextToSize(itemText, pageWidth - 30);
              
              doc.text(itemLines, 20, yPosition);
              yPosition += itemLines.length * 7 + 3;
            });
            currentListItems = [];
            currentListType = null;
          }
        };
        
        for (const line of lines) {
          // Check if we need a new page
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
            // Reset font for new page
            doc.setFont('NotoNaskhArabic');
            doc.setFontSize(12);
          }
          
          // Handle code blocks
          if (line.trim().startsWith('```')) {
            flushList();
            inCodeBlock = !inCodeBlock;
            continue;
          }
          
          if (inCodeBlock) {
            const codeLines = doc.splitTextToSize(line, pageWidth - 30);
            doc.setFontSize(10);
            codeLines.forEach(codeLine => {
              // Check if we need a new page
              if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
                // Reset font for new page
                doc.setFont('NotoNaskhArabic');
                doc.setFontSize(10);
              }
              doc.text(codeLine, 25, yPosition);
              yPosition += 7;
            });
            doc.setFontSize(12);
            continue;
          }
          
          // Handle headers
          const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
          if (headerMatch) {
            flushList();
            const level = headerMatch[1].length;
            const text = headerMatch[2];
            const headerSize = 24 - (level * 2);
            doc.setFontSize(headerSize);
            doc.setFont(undefined, 'bold');
            const headerLines = doc.splitTextToSize(text, pageWidth - 20);
            doc.text(headerLines, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += (headerLines.length * (headerSize * 0.7)) + 10;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(12);
            continue;
          }
          
          // Handle unordered lists
          const ulMatch = line.match(/^\s*[-*+]\s+(.+)$/);
          if (ulMatch) {
            if (currentListType !== 'ul') {
              flushList();
              currentListType = 'ul';
            }
            currentListItems.push(ulMatch[1]);
            continue;
          }
          
          // Handle ordered lists
          const olMatch = line.match(/^\s*\d+\.\s+(.+)$/);
          if (olMatch) {
            if (currentListType !== 'ol') {
              flushList();
              currentListType = 'ol';
            }
            currentListItems.push(olMatch[1]);
            continue;
          }
          
          // Handle blockquotes
          if (line.trim().startsWith('>')) {
            flushList();
            const quoteText = line.replace(/^\s*>\s*/, '');
            doc.setFont(undefined, 'italic');
            const quoteLines = doc.splitTextToSize(quoteText, pageWidth - 40);
            quoteLines.forEach((quoteLine, index) => {
              // Check if we need a new page
              if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
                // Reset font for new page
                doc.setFont('NotoNaskhArabic');
                doc.setFont(undefined, 'italic');
              }
              doc.text(quoteLine, 30, yPosition);
              yPosition += 7;
            });
            doc.setFont(undefined, 'normal');
            yPosition += 5;
            continue;
          }
          
          // Handle horizontal rules
          if (line.trim().match(/^[-*_]{3,}$/)) {
            flushList();
            doc.line(20, yPosition, pageWidth - 20, yPosition);
            yPosition += 10;
            continue;
          }
          
          // Handle empty lines
          if (line.trim() === '') {
            flushList();
            yPosition += 7;
            continue;
          }
          
          // Handle regular paragraphs with inline formatting
          flushList();
          let formattedLine = line;
          
          // Handle bold text (**text**)
          const boldMatches = [...formattedLine.matchAll(/\*\*(.*?)\*\*/g)];
          if (boldMatches.length > 0) {
            // For simplicity, we'll just remove the bold markers and add a note
            formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '$1');
          }
          
          // Handle italic text (*text*)
          const italicMatches = [...formattedLine.matchAll(/\*(.*?)\*/g)];
          if (italicMatches.length > 0) {
            // For simplicity, we'll just remove the italic markers and add a note
            formattedLine = formattedLine.replace(/\*(.*?)\*/g, '$1');
          }
          
          const splitText = doc.splitTextToSize(formattedLine, pageWidth - 20);
          doc.text(splitText, 10, yPosition);
          yPosition += splitText.length * 7 + 3;
        }
        
        // Flush any remaining list
        flushList();
        
        // Save the PDF
        doc.save(`${title || 'document'}.pdf`);
        toast({
          title: 'دابەزاندن',
          description: 'فایل PDF دابەزێنرا'
        });
        return;
      }
      
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'document'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'دابەزاندن',
        description: 'فایل دابەزێنرا'
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا فایلەکە دابەزێنرێت',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-primary rounded-xl text-primary-foreground">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground sorani-text">کورتکەرەوە و نووسینەوە</h1>
          <p className="text-muted-foreground latin-text">Summarizer & Paraphraser</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
        {/* Input Panel */}
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="sorani-text text-lg sm:text-xl">نووسینی سەرەتایی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="نووسینەکەت لێرە بنووسە بۆ کورتکردنەوە یان نووسینەوە..."
              className="min-h-[250px] sm:min-h-[400px] sorani-text text-sm sm:text-base leading-relaxed"
            />
             <LanguageSelection
               selectedLanguage={responseLanguage}
               onLanguageChange={setResponseLanguage}
             />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 gap-1">
                <TabsTrigger value="summarize" className="sorani-text">کورتکردنەوە</TabsTrigger>
                <TabsTrigger value="paraphrase" className="sorani-text">نووسینەوە</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summarize" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium sorani-text">درێژی کورتکردنەوە</label>
                  <Select value={summaryLength} onValueChange={(value: string) => setSummaryLength(value as 'short' | 'medium' | 'detailed')}>
                    <SelectTrigger className="input-academic">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">کورت (2-3 ڕستە)</SelectItem>
                      <SelectItem value="medium">ناوەند (1 پەرەگراف)</SelectItem>
                      <SelectItem value="detailed">ورد (2-3 پەرەگراف)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleSummarize}
                  disabled={loading || !text.trim()}
                  className="btn-academic-primary w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      کورتکردنەوە...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      کورتکردنەوە
                    </>
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="paraphrase" className="space-y-4">
                <Button 
                  onClick={handleParaphrase}
                  disabled={loading || !text.trim()}
                  className="btn-academic-primary w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      نووسینەوە...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      نووسینەوە
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="card-academic">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="sorani-text">
              {activeTab === 'summarize' ? 'کورتکردنەوە' : 'نووسینەوە'}
            </CardTitle>
            {((activeTab === 'summarize' && summarizedText) || (activeTab === 'paraphrase' && paraphrasedText)) && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(activeTab === 'summarize' ? summarizedText : paraphrasedText)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(
                    activeTab === 'summarize' ? summarizedText : paraphrasedText,
                    activeTab === 'summarize' ? 'کورتکردنەوە' : 'نووسینەوە',
                    'pdf'
                  )}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {activeTab === 'summarize' ? (
              summarizedText ? (
                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-4 text-xs sm:text-sm">
                    کورتکردنەوە - {summaryLength === 'short' ? 'کورت' : summaryLength === 'medium' ? 'ناوەند' : 'ورد'}
                  </Badge>
                  <div className="min-h-[250px] sm:min-h-[400px] p-3 sm:p-4 border border-border rounded-lg bg-background overflow-y-auto">
                    <RichTextRenderer
                      content={summarizedText}
                      showCopyButton={true}
                      className="report-content sorani-text text-sm sm:text-base"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[250px] sm:h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="sorani-text text-sm sm:text-base">کورتکردنەوەکە لێرە دەردەکەوێت</p>
                  </div>
                </div>
              )
            ) : (
              paraphrasedText ? (
                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-4 text-xs sm:text-sm">
                    نووسینەوە
                  </Badge>
                  <div className="min-h-[250px] sm:min-h-[400px] p-3 sm:p-4 border border-border rounded-lg bg-background overflow-y-auto">
                    <RichTextRenderer
                      content={paraphrasedText}
                      showCopyButton={true}
                      className="report-content sorani-text text-sm sm:text-base"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[250px] sm:h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <RotateCcw className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="sorani-text text-sm sm:text-base">نووسینەوەکە لێرە دەردەکەوێت</p>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
