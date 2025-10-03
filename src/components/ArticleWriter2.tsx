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
import html2pdf from 'html2pdf.js';
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

  // Function to convert Markdown to HTML
  const convertMarkdownToHtml = (markdown: string): string => {
    let html = markdown;
    
    // Convert headers
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    
    // Convert bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Convert code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert blockquotes
    html = html.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Convert horizontal rules
    html = html.replace(/^[-*_]{3,}$/gm, '<hr>');
    
    // Convert unordered lists
    html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
      if (!match.includes('<ul>') && !match.includes('<ol>')) {
        return `<ul>${match}</ul>`;
      }
      return match;
    });
    
    // Convert ordered lists
    html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
    // Note: This is simplified - a more robust solution would handle nested lists properly
    
    // Convert line breaks to paragraphs
    html = html.split('\n\n').map(paragraph => {
      if (paragraph.trim() && !paragraph.includes('<h') && !paragraph.includes('<ul>') && !paragraph.includes('<ol>') && !paragraph.includes('<blockquote>') && !paragraph.includes('<pre>') && !paragraph.includes('<hr>')) {
        return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
      }
      return paragraph.replace(/\n/g, '<br>');
    }).join('\n');
    
    return html;
  };

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
        // Create HTML content with proper styling for Kurdish/Arabic text
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="${language === 'ku' ? 'ku' : language === 'ar' ? 'ar' : 'en'}" dir="${language === 'ku' || language === 'ar' ? 'rtl' : 'ltr'}">
          <head>
            <meta charset="UTF-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap');
              
              body {
                font-family: 'Noto Naskh Arabic', 'Arial Unicode MS', Arial, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                direction: ${language === 'ku' || language === 'ar' ? 'rtl' : 'ltr'};
                text-align: ${language === 'ku' || language === 'ar' ? 'right' : 'left'};
              }
              
              h1 {
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 30px;
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
              }
              
              h2 {
                font-size: 20px;
                font-weight: bold;
                margin-top: 25px;
                margin-bottom: 15px;
                color: #34495e;
              }
              
              h3 {
                font-size: 18px;
                font-weight: bold;
                margin-top: 20px;
                margin-bottom: 12px;
                color: #34495e;
              }
              
              h4, h5, h6 {
                font-size: 16px;
                font-weight: bold;
                margin-top: 15px;
                margin-bottom: 10px;
                color: #34495e;
              }
              
              p {
                margin-bottom: 12px;
                text-align: justify;
              }
              
              ul, ol {
                margin-bottom: 15px;
                padding-${language === 'ku' || language === 'ar' ? 'right' : 'left'}: 25px;
              }
              
              li {
                margin-bottom: 8px;
              }
              
              blockquote {
                border-${language === 'ku' || language === 'ar' ? 'right' : 'left'}: 4px solid #3498db;
                padding-${language === 'ku' || language === 'ar' ? 'right' : 'left'}: 15px;
                margin: 15px 0;
                background-color: #f8f9fa;
                font-style: italic;
              }
              
              code {
                background-color: #f4f4f4;
                padding: 2px 4px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: 13px;
              }
              
              pre {
                background-color: #f4f4f4;
                padding: 15px;
                border-radius: 5px;
                overflow-x: auto;
                margin: 15px 0;
              }
              
              pre code {
                background: none;
                padding: 0;
              }
              
              strong {
                font-weight: bold;
              }
              
              em {
                font-style: italic;
              }
              
              hr {
                border: none;
                height: 1px;
                background-color: #ddd;
                margin: 20px 0;
              }
              
              .header-info {
                text-align: center;
                font-size: 12px;
                color: #666;
                margin-bottom: 20px;
                border-bottom: 1px solid #eee;
                padding-bottom: 15px;
              }
              
              .article-meta {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 25px;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header-info">
              <strong>AI Academic Hub</strong><br>
              Generated on: ${new Date().toLocaleDateString(language === 'ku' ? 'ku-Arab-IQ' : language === 'ar' ? 'ar-IQ' : 'en-US')}
            </div>
            
            <div class="article-meta">
              <strong>${language === 'ku' ? 'زانیاری بابەت:' : language === 'ar' ? 'معلومات المقال:' : 'Article Information:'}</strong><br>
              ${language === 'ku' ? 'بابەت:' : language === 'ar' ? 'الموضوع:' : 'Topic:'} ${request.topic}<br>
              ${language === 'ku' ? 'درێژی:' : language === 'ar' ? 'الطول:' : 'Length:'} ${request.length}<br>
              ${language === 'ku' ? 'شێوازی سەرچاوە:' : language === 'ar' ? 'نمط الاستشهاد:' : 'Citation Style:'} ${request.citationStyle}<br>
              ${language === 'ku' ? 'زمان:' : language === 'ar' ? 'اللغة:' : 'Language:'} ${language === 'ku' ? 'کوردی' : language === 'ar' ? 'العربية' : 'English'}
            </div>
            
            <h1>${request.topic || 'Article'}</h1>
            
            <div class="content">
              ${convertMarkdownToHtml(article || '')}
            </div>
          </body>
          </html>
        `;

        // Configure html2pdf options for better Unicode support
        const options = {
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `${(request.topic || 'article').substring(0, 50)}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            allowTaint: true
          },
          jsPDF: { 
            unit: 'in', 
            format: 'a4', 
            orientation: 'portrait'
          }
        };

        // Generate PDF using html2pdf
        await html2pdf().set(options).from(htmlContent).save();
        
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
          <h1 className="text-3xl font-bold">
            {language === 'ku' ? 'نووسەری بابەت' : language === 'ar' ? 'كاتب المقال' : 'Article Writer'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ku' ? 'بابەتی ئەکادیمی دروست بکە' : language === 'ar' ? 'إنشاء مقالات أكاديمية' : 'Create academic articles'}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              {language === 'ku' ? 'زانیاری بابەت' : language === 'ar' ? 'معلومات المقال' : 'Article Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">
                {language === 'ku' ? 'بابەت' : language === 'ar' ? 'الموضوع' : 'Topic'}
              </Label>
              <Input
                id="topic"
                placeholder={language === 'ku' ? 'بابەتەکەت بنووسە...' : language === 'ar' ? 'اكتب موضوعك...' : 'Enter your topic...'}
                value={request.topic}
                onChange={(e) => setRequest(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {language === 'ku' ? 'درێژی' : language === 'ar' ? 'الطول' : 'Length'}
              </Label>
              <Select value={request.length} onValueChange={(value: string) => setRequest(prev => ({ ...prev, length: value as 'short' | 'medium' | 'long' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">{language === 'ku' ? 'کورت' : language === 'ar' ? 'قصير' : 'Short'}</SelectItem>
                  <SelectItem value="medium">{language === 'ku' ? 'مامناوەند' : language === 'ar' ? 'متوسط' : 'Medium'}</SelectItem>
                  <SelectItem value="long">{language === 'ku' ? 'درێژ' : language === 'ar' ? 'طويل' : 'Long'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {language === 'ku' ? 'شێوازی سەرچاوە' : language === 'ar' ? 'نمط الاستشهاد' : 'Citation Style'}
              </Label>
              <Select value={request.citationStyle} onValueChange={(value: string) => setRequest(prev => ({ ...prev, citationStyle: value as 'APA' | 'MLA' | 'Chicago' | 'Harvard' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APA">APA</SelectItem>
                  <SelectItem value="MLA">MLA</SelectItem>
                  <SelectItem value="Chicago">Chicago</SelectItem>
                  <SelectItem value="Harvard">Harvard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="references"
                checked={request.includeReferences}
                onCheckedChange={(checked) => setRequest(prev => ({ ...prev, includeReferences: checked }))}
              />
              <Label htmlFor="references">
                {language === 'ku' ? 'سەرچاوەکان لەخۆ بگرێت' : language === 'ar' ? 'تضمين المراجع' : 'Include References'}
              </Label>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !request.topic.trim()}
              className="w-full btn-3d-primary"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {language === 'ku' ? 'دروستکردن...' : language === 'ar' ? 'إنشاء...' : 'Generating...'}
                </>
              ) : (
                <>
                  <PenTool className="mr-2 h-4 w-4" />
                  {language === 'ku' ? 'دروستکردنی بابەت' : language === 'ar' ? 'إنشاء المقال' : 'Generate Article'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                {language === 'ku' ? 'بابەت' : language === 'ar' ? 'المقال' : 'Article'}
                {article && (
                  <Badge variant="secondary" className="ml-2">
                    {article.split(' ').length} {language === 'ku' ? 'وشە' : language === 'ar' ? 'كلمة' : 'words'}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {loading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStop}
                  >
                    {isStreaming ? <Pause className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  </Button>
                )}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(previewMode === 'edit' ? 'preview' : 'edit')}
                    disabled={!article}
                  >
                    {previewMode === 'edit' ? 'Preview' : 'Edit'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFormatting(!showFormatting)}
                  >
                    Fmt
                  </Button>
                </div>
              </div>
            </div>
            {showFormatting && <FormattingControls showFormatting={showFormatting} onToggleFormatting={setShowFormatting} />}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 relative">
              {previewMode === 'preview' ? (
                <div className="h-full overflow-auto border rounded-md p-4">
                  <RichTextRenderer content={article || displayText} />
                </div>
              ) : (
                <>
                  <Textarea
                    placeholder={language === 'ku' ? 'بابەتەکەت لێرە دەردەکەوێت...' : language === 'ar' ? 'سيظهر مقالك هنا...' : 'Your article will appear here...'}
                    value={article || displayText}
                    onChange={(e) => setArticle(e.target.value)}
                    className="h-full resize-none"
                    dir={language === 'ku' || language === 'ar' ? 'rtl' : 'ltr'}
                  />
                  {isStreaming && <TypingIndicator />}
                </>
              )}
            </div>
            
            {(article || displayText) && (
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {language === 'ku' ? 'کۆپی' : language === 'ar' ? 'نسخ' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload('text')}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {language === 'ku' ? 'دابەزاندن TXT' : language === 'ar' ? 'تحميل TXT' : 'Download TXT'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload('pdf')}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {language === 'ku' ? 'دابەزاندن PDF' : language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
