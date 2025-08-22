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

export const SummarizerParaphraser = () => {
  const [text, setText] = useState('');
  const [summarizedText, setSummarizedText] = useState('');
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
  
  const handleDownload = (text: string, title: string, format: 'text' | 'pdf' = 'text') => {
    if (format === 'pdf') {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(16);
      doc.text(title, pageWidth / 2, 20, { align: 'center' });
      
      // Add content
      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(text, pageWidth - 20);
      doc.text(splitText, 10, 40);
      
      // Save the PDF
      doc.save(`${title}.pdf`);
      return;
    }
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="sorani-text">نووسینی سەرەتایی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="نووسینەکەت لێرە بنووسە بۆ کورتکردنەوە یان نووسینەوە..."
              className="min-h-[400px] sorani-text text-base leading-relaxed"
            />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summarize" className="sorani-text">کورتکردنەوە</TabsTrigger>
                <TabsTrigger value="paraphrase" className="sorani-text">نووسینەوە</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summarize" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium sorani-text">درێژی کورتکردنەوە</label>
                  <Select value={summaryLength} onValueChange={(value: any) => setSummaryLength(value)}>
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
                  <Badge variant="secondary" className="mb-4">
                    کورتکردنەوە - {summaryLength === 'short' ? 'کورت' : summaryLength === 'medium' ? 'ناوەند' : 'ورد'}
                  </Badge>
                  <Textarea
                    value={summarizedText}
                    onChange={(e) => setSummarizedText(e.target.value)}
                    className="min-h-[400px] sorani-text text-base leading-relaxed"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="sorani-text">کورتکردنەوەکە لێرە دەردەکەوێت</p>
                  </div>
                </div>
              )
            ) : (
              paraphrasedText ? (
                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-4">
                    نووسینەوە
                  </Badge>
                  <Textarea
                    value={paraphrasedText}
                    onChange={(e) => setParaphrasedText(e.target.value)}
                    className="min-h-[400px] sorani-text text-base leading-relaxed"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="sorani-text">نووسینەوەکە لێرە دەردەکەوێت</p>
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