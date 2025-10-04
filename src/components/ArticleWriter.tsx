import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Copy, RefreshCw, PenTool, Pause, Play, Square, Clock } from 'lucide-react';
import { geminiService, type ArticleRequest } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { EnglishPDFService } from '@/services/englishPdfService';
import html2pdf from 'html2pdf.js';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { FormattingControls } from '@/components/ui/formatting-controls';
import { ResponsiveLayout, ResponsiveCard, ResponsiveButtonGroup, ResponsiveText } from '@/components/ui/responsive-layout';
import { useResponsive } from '@/hooks/useResponsive';
import { useRateLimitStatus, formatRetryMessage } from '@/utils/rateLimitUtils';
import { LanguageSelection } from './LanguageSelection';
import { ToolHeader } from '@/components/ToolHeader';
import { useAuth } from '@/contexts/AuthContext';
import { CREDIT_COSTS } from '@/config/credits';

type ArticleWriterProps = object;

export const ArticleWriter = () => {
  const [article, setArticle] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [language, setLanguage] = useState('en');
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
  const { isMobile, isTablet } = useResponsive();
  const rateLimitStatus = useRateLimitStatus();
  const { deductCredits } = useAuth();

  // Function to convert Markdown to HTML with proper formatting
  const convertMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Convert headers (h6 to h1 order matters - largest first to avoid conflicts)
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    
    // Convert code blocks BEFORE inline code (to avoid conflicts)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert bold and italic (bold+italic first, then bold, then italic)
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Convert blockquotes
    html = html.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Convert horizontal rules
    html = html.replace(/^[-*_]{3,}$/gm, '<hr>');
    
    // Convert lists - need to group consecutive list items
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const unorderedMatch = line.match(/^\s*[-*+]\s+(.+)$/);
      const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);
      
      if (unorderedMatch) {
        if (!inUnorderedList) {
          processedLines.push('<ul>');
          inUnorderedList = true;
        }
        processedLines.push(`<li>${unorderedMatch[1]}</li>`);
      } else {
        if (inUnorderedList) {
          processedLines.push('</ul>');
          inUnorderedList = false;
        }
        
        if (orderedMatch) {
          if (!inOrderedList) {
            processedLines.push('<ol>');
            inOrderedList = true;
          }
          processedLines.push(`<li>${orderedMatch[1]}</li>`);
        } else {
          if (inOrderedList) {
            processedLines.push('</ol>');
            inOrderedList = false;
          }
          processedLines.push(line);
        }
      }
    }
    
    // Close any open lists
    if (inUnorderedList) processedLines.push('</ul>');
    if (inOrderedList) processedLines.push('</ol>');
    
    html = processedLines.join('\n');
    
    // Convert line breaks to paragraphs (only for text that's not already in a tag)
    html = html.split('\n\n').map(paragraph => {
      const trimmed = paragraph.trim();
      if (trimmed && 
          !trimmed.startsWith('<h') && 
          !trimmed.startsWith('<ul>') && 
          !trimmed.startsWith('<ol>') && 
          !trimmed.startsWith('<blockquote>') && 
          !trimmed.startsWith('<pre>') && 
          !trimmed.startsWith('<hr>') &&
          !trimmed.startsWith('</ul>') &&
          !trimmed.startsWith('</ol>') &&
          !trimmed.includes('<li>')) {
        return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
      }
      return trimmed;
    }).join('\n\n');
    
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

    // Check and deduct credits
    const success = await deductCredits(
      CREDIT_COSTS.ARTICLE_WRITER,
      'Article Writer',
      `Generated article: ${request.topic}`
    );
    if (!success) return;

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
      
    } catch (error: any) {
      setLoading(false);
      setIsStreaming(false);
      
      // Provide specific error messages based on the error type
      let errorTitle = 'هەڵە';
      let errorDescription = 'نەتوانرا بابەتەکە دروست بکرێت';
      
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        errorTitle = 'زۆر داواکاری';
        errorDescription = 'زۆر داواکاری کردووە. تکایە چەند خولەکێک چاوەڕوان بە و دووبارە هەوڵ بدەوە';
      } else if (error.message?.includes('Failed to communicate')) {
        errorTitle = 'هەڵەی پەیوەندی';
        errorDescription = 'نەتوانرا پەیوەندی بە خزمەتگوزاری AI وە بکرێت. تکایە هەوڵ بدەوە';
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
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
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="${language === 'ku' ? 'ku' : language === 'ar' ? 'ar' : 'en'}" dir="${language === 'ku' || language === 'ar' ? 'rtl' : 'ltr'}">
          <head>
            <meta charset="UTF-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap');
              
              body {
                font-family: ${language === 'en' ? "'Times New Roman', Times, serif" : "'Noto Naskh Arabic', 'Arial Unicode MS', Arial, sans-serif"};
                font-size: 14px;
                line-height: 1.6;
                color: #000;
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
                margin-top: 0;
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
                page-break-after: avoid;
                page-break-inside: avoid;
              }
              
              h2, h3, h4, h5, h6 {
                color: #34495e;
                margin-top: 1.5em;
                margin-bottom: 0.6em;
                font-weight: bold;
                page-break-after: avoid;
                page-break-inside: avoid;
                orphans: 3;
                widows: 3;
              }
              h2 { 
                font-size: 20px; 
                border-bottom: 1px solid #ddd; 
                padding-bottom: 5px;
                page-break-before: auto;
              }
              h3 { font-size: 18px; }
              h4 { font-size: 16px; }
              h5 { font-size: 15px; }
              h6 { font-size: 14px; }

              p {
                margin-bottom: 12px;
                margin-top: 8px;
                text-align: justify;
                line-height: 1.8;
                orphans: 3;
                widows: 3;
              }
              
              strong {
                font-weight: bold;
                color: #2c3e50;
              }
              
              em {
                font-style: italic;
                color: #555;
              }
              
              strong em, em strong {
                font-weight: bold;
                font-style: italic;
              }
              
              ul, ol {
                margin-bottom: 15px;
                margin-top: 10px;
                padding-${language === 'ku' || language === 'ar' ? 'right' : 'left'}: 25px;
                page-break-inside: auto;
              }
              
              li { 
                margin-bottom: 8px;
                orphans: 2;
                widows: 2;
              }
              
              blockquote {
                border-${language === 'ku' || language === 'ar' ? 'right' : 'left'}: 4px solid #3498db;
                padding-${language === 'ku' || language === 'ar' ? 'right' : 'left'}: 15px;
                margin: 15px 0;
                background-color: #f8f9fa;
                font-style: italic;
                page-break-inside: avoid;
                orphans: 3;
                widows: 3;
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
                page-break-inside: avoid;
              }
              
              /* Ensure content after headings stays with heading */
              h1 + p, h1 + ul, h1 + ol, h1 + blockquote,
              h2 + p, h2 + ul, h2 + ol, h2 + blockquote,
              h3 + p, h3 + ul, h3 + ol, h3 + blockquote,
              h4 + p, h4 + ul, h4 + ol, h4 + blockquote,
              h5 + p, h5 + ul, h5 + ol, h5 + blockquote,
              h6 + p, h6 + ul, h6 + ol, h6 + blockquote {
                page-break-before: avoid;
              }
            </style>
          </head>
          <body>
            <div class="article-meta" style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 25px; margin-top: 0; font-size: 12px; color: #666; page-break-after: avoid;">
              <strong>${language === 'ku' ? 'زانیاری بابەت:' : language === 'ar' ? 'معلومات المقال:' : 'Article Information:'}</strong><br>
              ${language === 'ku' ? 'بابەت:' : language === 'ar' ? 'الموضوع:' : 'Topic:'} ${request.topic}<br>
              ${language === 'ku' ? 'درێژی:' : language === 'ar' ? 'الطول:' : 'Length:'} ${request.length}<br>
              ${language === 'ku' ? 'شێوازی سەرچاوە:' : language === 'ar' ? 'نمط الاستشهاد:' : 'Citation Style:'} ${request.citationStyle}<br>
              ${language === 'ku' ? 'زمان:' : language === 'ar' ? 'اللغة:' : 'Language:'} ${language === 'ku' ? 'کوردی' : language === 'ar' ? 'العربية' : 'English'}<br>
              <span style="font-size: 10px; color: #999;">Generated: ${new Date().toLocaleDateString(language === 'ku' ? 'ku-Arab-IQ' : language === 'ar' ? 'ar-IQ' : 'en-US')}</span>
            </div>
            
            <h1>${request.topic || 'Article'}</h1>
            
            <div class="content">
              ${convertMarkdownToHtml(article || '')}
            </div>
          </body>
          </html>
        `;

        if (language === 'en') {
          const pdfService = new EnglishPDFService();
          pdfService.addTitle(request.topic || 'Article');
          article.split('\n').forEach(paragraph => {
            if (paragraph.trim()) {
              pdfService.addParagraph(paragraph);
            }
          });
          pdfService.save(`${(request.topic || 'article').substring(0, 50)}.pdf`);
        } else {
          // Fallback to html2pdf for Kurdish and other languages
          const options = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `${(request.topic || 'article').substring(0, 50)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
              scale: 2, 
              useCORS: true,
              letterRendering: true,
              logging: false
            },
            jsPDF: { 
              unit: 'in', 
              format: 'a4', 
              orientation: 'portrait',
              compress: true
            },
            pagebreak: { 
              mode: ['avoid-all', 'css', 'legacy'],
              before: ['h1', 'h2'],
              after: [],
              avoid: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre']
            }
          };
          await html2pdf().set(options).from(htmlContent).save();
        }
        
        toast({
          title: 'Download Complete',
          description: 'PDF has been downloaded.'
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
    <ResponsiveLayout maxWidth="6xl">
      <ToolHeader 
        toolName={language === 'ku' ? 'نووسەری بابەت' : language === 'ar' ? 'كاتب المقال' : 'Article Writer'}
        creditCost={CREDIT_COSTS.ARTICLE_WRITER}
        icon={
          <div className="p-3 bg-gradient-primary rounded-xl text-primary-foreground">
            <PenTool className="h-6 w-6" />
          </div>
        }
      />

      <ResponsiveLayout 
        variant="grid" 
        gridCols={{ mobile: 1, tablet: 1, desktop: 2 }}
        className={isMobile ? "gap-6" : "gap-8"}
      >
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
              <Select value={request.length} onValueChange={(value) => setRequest(prev => ({ ...prev, length: value as typeof request.length }))}>
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
              <Select value={request.citationStyle} onValueChange={(value) => setRequest(prev => ({ ...prev, citationStyle: value as typeof request.citationStyle }))}>
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

            <div className="space-y-2">
               <LanguageSelection
                 selectedLanguage={language}
                 onLanguageChange={setLanguage}
               />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !request.topic.trim()}
              className="w-full btn-3d-primary"
              size={isMobile ? "lg" : "default"}
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
            
            {/* Rate limit status indicator */}
            {rateLimitStatus && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700">
                  <Clock className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">
                    {formatRetryMessage(rateLimitStatus, language as 'ku' | 'en')}
                  </span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${((rateLimitStatus.maxRetries - rateLimitStatus.retryAttempt + 1) / rateLimitStatus.maxRetries) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <PenTool className="h-5 w-5" />
                <span className="break-words">{language === 'ku' ? 'بابەت' : language === 'ar' ? 'المقال' : 'Article'}</span>
                {article && (
                  <Badge variant="secondary" className={isMobile ? "" : "ml-2"}>
                    {article.split(' ').length} {language === 'ku' ? 'وشە' : language === 'ar' ? 'كلمة' : 'words'}
                  </Badge>
                )}
              </CardTitle>
              <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}>
                {loading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStop}
                    className={isMobile ? "flex-1" : ""}
                  >
                    {isStreaming ? <Pause className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  </Button>
                )}
                <div className={`flex items-center gap-1 ${isMobile ? 'flex-1' : ''}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(previewMode === 'edit' ? 'preview' : 'edit')}
                    disabled={!article}
                    className={isMobile ? "flex-1 text-xs" : ""}
                  >
                    {previewMode === 'edit' ? 'Preview' : 'Edit'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFormatting(!showFormatting)}
                    className={isMobile ? "flex-1 text-xs" : ""}
                  >
                    Fmt
                  </Button>
                </div>
              </div>
            </div>
            {showFormatting && !isMobile && (
              <FormattingControls 
                showFormatting={showFormatting} 
                onToggleFormatting={setShowFormatting} 
              />
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 relative">
              {previewMode === 'preview' ? (
                <div className={`overflow-auto border rounded-md p-3 md:p-4 bg-white dark:bg-gray-900 ${isMobile ? 'h-64' : 'h-full'}`}>
                  <RichTextRenderer 
                    content={article || displayText} 
                    className="report-content prose prose-sm md:prose-base max-w-none dark:prose-invert"
                  />
                </div>
              ) : (
                <>
                  <Textarea
                    placeholder={language === 'ku' ? 'بابەتەکەت لێرە دەردەکەوێت...' : language === 'ar' ? 'سيظهر مقالك هنا...' : 'Your article will appear here...'}
                    value={article || displayText}
                    onChange={(e) => setArticle(e.target.value)}
                    className={`resize-none ${isMobile ? 'h-64 text-sm' : 'h-full'}`}
                    dir={language === 'ku' || language === 'ar' ? 'rtl' : 'ltr'}
                  />
                  {isStreaming && <TypingIndicator />}
                </>
              )}
            </div>
            
            {(article || displayText) && (
              <div className={`mt-4 ${isMobile ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2'}`}>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={handleCopy}
                  className={isMobile ? "w-full" : ""}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  <span className="text-xs sm:text-sm">{language === 'ku' ? 'کۆپی' : language === 'ar' ? 'نسخ' : 'Copy'}</span>
                </Button>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => handleDownload('text')}
                  className={isMobile ? "w-full" : ""}
                >
                  <Download className="mr-2 h-4 w-4" />
                  <span className="text-xs sm:text-sm">{language === 'ku' ? 'دابەزاندن TXT' : language === 'ar' ? 'تحميل TXT' : 'Download TXT'}</span>
                </Button>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => handleDownload('pdf')}
                  className={isMobile ? "w-full" : ""}
                >
                  <Download className="mr-2 h-4 w-4" />
                  <span className="text-xs sm:text-sm">{language === 'ku' ? 'دابەزاندن PDF' : language === 'ar' ? 'تحميل PDF' : 'Download PDF'}</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </ResponsiveLayout>
    </ResponsiveLayout>
  );
};
