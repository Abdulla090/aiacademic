import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Copy, RefreshCw, PenTool } from 'lucide-react';
import { geminiService, type ArticleRequest } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from "jspdf";
import { notoNaskhArabic } from '@/lib/fonts';

interface ArticleWriterProps {
  language: string;
}

export const ArticleWriter = ({ language }: ArticleWriterProps) => {
  const [article, setArticle] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
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
    try {
      const result = await geminiService.generateArticle({ ...request, language });
      setArticle(result);
      toast({
        title: 'سەرکەوتوو',
        description: 'بابەتەکە بە سەرکەوتوویی دروست کرا'
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا بابەتەکە دروست بکرێت',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
        
        doc.setFontSize(18);
        const titleLines = doc.splitTextToSize(request.topic || 'Article', pageWidth - 20);
        doc.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += (titleLines.length * 10) + 10;
        
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(article || '', pageWidth - 20);
        
        for (let i = 0; i < splitText.length; i++) {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
            // Reset font for new page
            if (language === 'ku' || language === 'ar') {
              doc.setFont('NotoNaskhArabic');
            }
          }
          
          // Handle RTL alignment for Kurdish/Arabic
          if (language === 'ku' || language === 'ar') {
            doc.text(splitText[i], pageWidth - 10, yPosition, { align: 'right' });
          } else {
            doc.text(splitText[i], 10, yPosition);
          }
          yPosition += 7;
        }
        
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
            {article && (
              <div className="flex gap-2">
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
              </div>
            )}
          </CardHeader>
          <CardContent>
            {article ? (
              <div className="space-y-4">
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
                {previewMode === 'edit' ? (
                  <Textarea
                    value={article}
                    onChange={(e) => setArticle(e.target.value)}
                    className="min-h-[600px] sorani-text text-base leading-relaxed resize-none"
                    placeholder="بابەتەکە لێرە دەردەکەوێت..."
                  />
                ) : (
                  <div
                    className="min-h-[600px] sorani-text text-base leading-relaxed p-4 border border-border rounded-lg bg-background overflow-y-auto"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {article}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground">
                <div className="text-center">
                  <PenTool className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2 sorani-text">بابەتەکەت لێرە دەردەکەوێت</h3>
                  <p className="sorani-text">ڕێکخستنەکان پڕبکەوە و کلیک لە "دروستکردنی بابەت" بکە</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
