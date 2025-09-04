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
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    
    // Convert ordered lists
    html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
      if (!match.includes('<ul>')) {
        return `<ol>${match}</ol>`;
      }
      return match;
    });
    
    // Convert line breaks to paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    html = `<p>${html}</p>`;
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');
    
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
        // Create PDF with basic font support to avoid encoding issues
        const doc = new jsPDF();
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;
        
        // Function to detect if text contains Arabic/Kurdish characters
        const hasArabicText = (text: string) => {
          return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
        };
        
        // Function to transliterate Arabic/Kurdish text to Latin for PDF compatibility
        const transliterateText = (text: string) => {
          if (!hasArabicText(text)) {
            return text;
          }
          
          // Basic Kurdish/Arabic to Latin transliteration mapping
          const transliterationMap: Record<string, string> = {
            'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh',
            'د': 'd', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ع': 'e', 'غ': 'gh',
            'ف': 'f', 'ق': 'q', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'ڵ': 'll', 'م': 'm', 'ن': 'n',
            'ه': 'h', 'ھ': 'h', 'و': 'w', 'ۆ': 'o', 'ء': "'", 'ی': 'y', 'ێ': 'e', 'ە': 'e',
            'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ث': 'th', 'ذ': 'dh',
            // Add more mappings as needed
            ' ': ' ', '.': '.', ',': ',', '!': '!', '?': '?', ':': ':', ';': ';',
            '(': '(', ')': ')', '[': '[', ']': ']', '{': '{', '}': '}',
            '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
          };
          
          let result = '';
          for (const char of text) {
            result += transliterationMap[char] || char;
          }
          return result;
        };
        
        // Function to set font with fallback
        const setFont = (size: number = 12, style: 'normal' | 'bold' = 'normal') => {
          doc.setFontSize(size);
          doc.setFont('helvetica', style);
        };
        
        // Simple and safe text splitting function with transliteration support
        const safeSplitTextToSize = (text: string, maxWidth: number) => {
          // Use transliterated text for width calculations and rendering
          const processedText = transliterateText(text);
          
          // Manual word wrapping
          const words = processedText.split(' ');
          const lines = [];
          let currentLine = '';
          
          // Estimate characters per line based on font size and page width
          const fontSize = doc.getFontSize() || 12;
          const avgCharWidth = fontSize * 0.6;
          const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
          
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (testLine.length <= maxCharsPerLine) {
              currentLine = testLine;
            } else {
              if (currentLine) {
                lines.push(currentLine);
                currentLine = word;
              } else {
                // Handle very long words by splitting them
                if (word.length > maxCharsPerLine) {
                  let remainingWord = word;
                  while (remainingWord.length > maxCharsPerLine) {
                    lines.push(remainingWord.substring(0, maxCharsPerLine));
                    remainingWord = remainingWord.substring(maxCharsPerLine);
                  }
                  if (remainingWord) {
                    currentLine = remainingWord;
                  }
                } else {
                  currentLine = word;
                }
              }
            }
          }
          if (currentLine) {
            lines.push(currentLine);
          }
          return lines.length > 0 ? lines : [processedText];
        };
        
        // Add title with appropriate font
        const titleText = request.topic || 'Article';
        setFont(18, 'bold');
        const titleLines = safeSplitTextToSize(titleText, pageWidth - 20);
        
        // Add note about transliteration if Arabic/Kurdish text is detected
        const articleHasArabicText = hasArabicText(article || '') || hasArabicText(titleText);
        if (articleHasArabicText) {
          setFont(10, 'normal');
          doc.text('Note: Kurdish/Arabic text has been transliterated to Latin script for PDF compatibility.', pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 15;
          setFont(18, 'bold');
        }
        
        doc.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += (titleLines.length * 10) + 10;
        
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
              }
              
              const bullet = currentListType === 'ol' ? `${index + 1}. ` : '• ';
              const itemText = `${bullet}${item}`;
              setFont(12, 'normal');
              const itemLines = safeSplitTextToSize(itemText, pageWidth - 30);
              
              doc.text(itemLines, 20, yPosition, { align: 'left' });
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
          }
          
          // Handle code blocks
          if (line.trim().startsWith('```')) {
            flushList();
            inCodeBlock = !inCodeBlock;
            continue;
          }
          
          if (inCodeBlock) {
            setFont(10, 'normal');
            const codeLines = safeSplitTextToSize(line, pageWidth - 30);
            codeLines.forEach(codeLine => {
              // Check if we need a new page
              if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
                setFont(10, 'normal');
              }
              doc.text(codeLine, 25, yPosition, { align: 'left' });
              yPosition += 7;
            });
            continue;
          }
          
          // Handle headers
          const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
          if (headerMatch) {
            flushList();
            const level = headerMatch[1].length;
            const text = headerMatch[2];
            const headerSize = 24 - (level * 2);
            setFont(headerSize, 'bold');
            const headerLines = safeSplitTextToSize(text, pageWidth - 20);
            doc.text(headerLines, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += (headerLines.length * (headerSize * 0.7)) + 10;
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
            setFont(12, 'normal');
            const quoteLines = safeSplitTextToSize(quoteText, pageWidth - 40);
            quoteLines.forEach((quoteLine, index) => {
              // Check if we need a new page
              if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
                setFont(12, 'normal');
              }
              doc.text(quoteLine, 30, yPosition, { align: 'left' });
              yPosition += 7;
            });
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
          
          setFont(12, 'normal');
          const splitText = safeSplitTextToSize(formattedLine, pageWidth - 20);
          doc.text(splitText, 10, yPosition, { align: 'left' });
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
