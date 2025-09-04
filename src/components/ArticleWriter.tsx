import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Copy, RefreshCw, PenTool, Pause, Play, Square } from 'lucide-react';
import { geminiService, type ArticleRequest } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from "jspdf";
import { notoNaskhArabic } from '@/lib/fonts';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { FormattingControls } from '@/components/ui/formatting-controls';

interface ArticleWriterProps {
  language: string;
}

export const ArticleWriter = ({ language }: ArticleWriterProps) => {
  const [article, setArticle] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [showFormatting, setShowFormatting] = useState(true);
  const [request, setRequest] = useState<ArticleRequest>({
    topic: '',
    length: 'medium',
    citationStyle: 'APA',
    includeReferences: true,
    language: 'en'
  });
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!request.topic.trim()) {
      toast({
        title: 'هەڵە',
        description: 'تکایە بابەتەکە بنووسە',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setArticle('');
    setDisplayText('');
    setIsStreaming(false);
    
    try {
      // Get the AI response
      const result = await geminiService.generateArticle({ ...request, language });
      
      // Start streaming the result
      setIsStreaming(true);
      const words = result.split(' ');
      let currentText = '';
      
      for (let i = 0; i < words.length; i++) {
        if (!loading) break; // User stopped
        
        currentText += (i === 0 ? '' : ' ') + words[i];
        setDisplayText(currentText);
        
        // Add delay for typing effect
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Complete
      setArticle(result);
      setIsStreaming(false);
      setLoading(false);
      
      toast({
        title: 'سەرکەوتوو',
        description: 'بابەتەکە بە سەرکەوتوویی دروست کرا'
      });
      
    } catch (error) {
      setLoading(false);
      setIsStreaming(false);
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا بابەتەکە دروست بکرێت',
        variant: 'destructive'
      });
    }
  };

  const handleStop = () => {
    setArticle(displayText);
    setIsStreaming(false);
    setLoading(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(article);
      toast({
        title: 'کۆپی کرا',
        description: 'بابەتەکە بۆ کلیپبۆرد کۆپی کرا'
      });
    } catch {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا کۆپی بکرێت',
        variant: 'destructive'
      });
    }
  };

  const handleDownload = async (format: 'text' | 'pdf' = 'text') => {
    try {
      if (format === 'pdf') {
        const doc = new jsPDF();
        
        // Add Arabic/Kurdish font support
        if (language === 'ku' || language === 'ar') {
          // Add font to VFS and register it
          doc.addFileToVFS('NotoNaskhArabic-Regular.ttf', notoNaskhArabic);
          doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
          doc.setFont('NotoNaskhArabic');
        }

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;
        
        // Add title
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        const titleLines = doc.splitTextToSize(request.topic || 'Article', pageWidth - 20);
        doc.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += (titleLines.length * 10) + 10;
        
        // Reset font
        doc.setFont(undefined, 'normal');
        doc.setFontSize(12);
        
        // Process article content with markdown formatting
        const lines = (article || '').split('\n');
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
                if (language === 'ku' || language === 'ar') {
                  doc.setFont('NotoNaskhArabic');
                }
                doc.setFontSize(12);
              }
              
              const bullet = currentListType === 'ol' ? `${index + 1}. ` : '• ';
              const itemText = `${bullet}${item}`;
              const itemLines = doc.splitTextToSize(itemText, pageWidth - 30);
              
              doc.text(itemLines, language === 'ku' || language === 'ar' ? pageWidth - 20 : 20, yPosition, {
                align: language === 'ku' || language === 'ar' ? 'right' : 'left'
              });
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
            if (language === 'ku' || language === 'ar') {
              doc.setFont('NotoNaskhArabic');
            }
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
                if (language === 'ku' || language === 'ar') {
                  doc.setFont('NotoNaskhArabic');
                }
                doc.setFontSize(10);
              }
              doc.text(codeLine, language === 'ku' || language === 'ar' ? pageWidth - 25 : 25, yPosition, {
                align: language === 'ku' || language === 'ar' ? 'right' : 'left'
              });
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
                if (language === 'ku' || language === 'ar') {
                  doc.setFont('NotoNaskhArabic');
                }
                doc.setFont(undefined, 'italic');
              }
              doc.text(quoteLine, language === 'ku' || language === 'ar' ? pageWidth - 30 : 30, yPosition, {
                align: language === 'ku' || language === 'ar' ? 'right' : 'left'
              });
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
          doc.text(splitText, language === 'ku' || language === 'ar' ? pageWidth - 10 : 10, yPosition, {
            align: language === 'ku' || language === 'ar' ? 'right' : 'left'
          });
          yPosition += splitText.length * 7 + 3;
        }
        
        // Flush any remaining list
        flushList();
        
        doc.save(`${(request.topic || 'article').substring(0, 50)}.pdf`);
        toast({
          title: 'دابەزاندن',
          description: 'PDF دابەزێنرا'
        });
        return;
      }
      
      const blob = new Blob([article], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(request.topic || 'article').substring(0, 50)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'دابەزاندن',
        description: 'بابەتەکە دابەزێنرا'
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
          <PenTool className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground sorani-text">نووسەری بابەت</h1>
          <p className="text-muted-foreground latin-text">Article Writer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <Card className="card-academic lg:col-span-1">
          <CardHeader>
            <CardTitle className="sorani-text flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              ڕێکخستنەکان
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="sorani-text font-medium">بابەتی بابەت</Label>
              <Input
                value={request.topic}
                onChange={(e) => setRequest(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="بابەتی بابەتەکەت بنووسە..."
                className="input-academic sorani-text"
              />
            </div>

            <div className="space-y-2">
              <Label className="sorani-text font-medium">درێژی بابەت</Label>
              <Select value={request.length} onValueChange={(value: any) => setRequest(prev => ({ ...prev, length: value }))}>
                <SelectTrigger className="input-academic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">کورت (500-800 وشە)</SelectItem>
                  <SelectItem value="medium">ناوەند (1000-1500 وشە)</SelectItem>
                  <SelectItem value="long">درێژ (2000-3000 وشە)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="sorani-text font-medium">ستایلی سەرچاوە</Label>
              <Select value={request.citationStyle} onValueChange={(value: any) => setRequest(prev => ({ ...prev, citationStyle: value }))}>
                <SelectTrigger className="input-academic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APA">APA</SelectItem>
                  <SelectItem value="MLA">MLA</SelectItem>
                  <SelectItem value="IEEE">IEEE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="references" className="sorani-text font-medium">زیادکردنی سەرچاوەکان</Label>
              <Switch
                id="references"
                checked={request.includeReferences}
                onCheckedChange={(checked) => setRequest(prev => ({ ...prev, includeReferences: checked }))}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-academic-primary w-full mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  دروستکردن...
                </>
              ) : (
                'دروستکردنی بابەت'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="card-academic lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="sorani-text flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              بابەتی دروستکراو
            </CardTitle>
            <div className="flex gap-2">
              {/* Streaming controls - show when AI is generating */}
              {loading && isStreaming && (
                <div className="flex gap-2 mr-4">
                  <Button size="sm" variant="outline" onClick={handleStop} className="gap-1">
                    <Square className="h-4 w-4" />
                    وەستان
                  </Button>
                </div>
              )}
              
              {/* Regular controls - show when article is complete */}
              {(article || displayText) && !loading && (
                <>
                  <Button
                    size="sm"
                    variant={previewMode === 'edit' ? 'default' : 'outline'}
                    onClick={() => setPreviewMode('edit')}
                    className="gap-1"
                  >
                    دەستکاری
                  </Button>
                  <Button
                    size="sm"
                    variant={previewMode === 'preview' ? 'default' : 'outline'}
                    onClick={() => setPreviewMode('preview')}
                    className="gap-1"
                  >
                    پێشبینین
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1">
                    <Copy className="h-4 w-4" />
                    کۆپی
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownload('text')} className="gap-1">
                    <Download className="h-4 w-4" />
                    دابەزاندن
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownload('pdf')} className="gap-1">
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {(article || displayText) ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {request.length === 'short' ? 'کورت' : request.length === 'medium' ? 'ناوەند' : 'درێژ'}
                    </Badge>
                    <Badge variant="secondary">
                      {request.citationStyle}
                    </Badge>
                    <Badge variant="secondary">
                      {request.includeReferences ? 'لەگەڵ سەرچاوە' : 'بەبێ سەرچاوە'}
                    </Badge>
                  </div>
                  {/* Show streaming indicator when AI is streaming */}
                  {isStreaming && (
                    <div className="flex items-center gap-2">
                      <TypingIndicator size="sm" className="mr-2" />
                      <span className="text-sm text-muted-foreground sorani-text">دەنووسرێت...</span>
                    </div>
                  )}
                </div>
                {previewMode === 'edit' ? (
                  <Textarea
                    value={isStreaming ? displayText : article}
                    onChange={(e) => !isStreaming && setArticle(e.target.value)}
                    className="min-h-[600px] sorani-text text-base leading-relaxed resize-none"
                    placeholder="بابەتەکە لێرە دەردەکەوێت..."
                    disabled={isStreaming}
                  />
                ) : (
                  <div className="space-y-4">
                    <FormattingControls 
                      showFormatting={showFormatting}
                      onToggleFormatting={setShowFormatting}
                    />
                    <div className="min-h-[600px] p-4 border border-border rounded-lg bg-background overflow-y-auto">
                      {showFormatting ? (
                        <RichTextRenderer 
                          content={isStreaming ? displayText : article}
                          isStreaming={isStreaming}
                          showCopyButton={false}
                          className="sorani-text"
                        />
                      ) : (
                        <div 
                          className="sorani-text text-base leading-relaxed whitespace-pre-wrap relative"
                          style={{ fontFamily: 'inherit' }}
                        >
                          {isStreaming ? displayText : article}
                          {isStreaming && (
                            <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-pulse" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground">
                {loading ? (
                  <div className="text-center">
                    <RefreshCw className="h-16 w-16 mx-auto mb-4 opacity-50 animate-spin" />
                    <h3 className="text-xl font-semibold mb-2 sorani-text">AI کاردەکات...</h3>
                    <p className="sorani-text">تکایە چاوەڕێ بە...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <PenTool className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2 sorani-text">بابەتەکەت لێرە دەردەکەوێت</h3>
                    <p className="sorani-text">ڕێکخستنەکان پڕبکەوە و کلیک لە "دروستکردنی بابەت" بکە</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
