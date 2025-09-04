import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, ChevronRight, Check, Download, RefreshCw, Pause, Play, Square } from 'lucide-react';
import { geminiService, type ReportOutline, type ReportSection } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import html2pdf from 'html2pdf.js';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { FormattingControls } from '@/components/ui/formatting-controls';

interface ReportGeneratorProps {
  language: string;
}

const convertMarkdownToHtml = (markdown: string): string => {
  let html = markdown;
  
  // Convert headers (must be done before other formatting)
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  
  // Convert bold and italic (handle bold+italic first)
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

export const ReportGenerator = ({ language }: ReportGeneratorProps) => {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState<ReportOutline | null>(null);
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const [currentSectionContent, setCurrentSectionContent] = useState('');
  const [streamedSectionText, setStreamedSectionText] = useState('');
  const [isSectionStreaming, setIsSectionStreaming] = useState(false);
  const [showFormatting, setShowFormatting] = useState(true);
  const { toast } = useToast();

  const handleGenerateOutline = async () => {
    if (!topic.trim()) {
      toast({
        title: 'هەڵە',
        description: 'تکایە بابەتەکە بنووسە',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await geminiService.generateReportOutline(topic, language);
      setOutline(result);
      setSections([]);
      setCurrentStep(1);
      toast({
        title: 'پلان دروست کرا',
        description: 'پلانی ڕاپۆرتەکە ئامادە کرا'
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا پلانەکە دروست بکرێت',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSection = async (sectionName: string) => {
    if (!outline) return;

    setGeneratingSection(sectionName);
    setCurrentSectionContent('');
    setStreamedSectionText('');
    setIsSectionStreaming(false);
    
    try {
      // Get the AI response first
      const content = await geminiService.generateReportSection(outline, sectionName, sections, language);
      
      // Start streaming the result
      setIsSectionStreaming(true);
      const words = content.split(' ');
      let currentText = '';
      
      for (let i = 0; i < words.length; i++) {
        // Check if section generation was stopped
        if (generatingSection !== sectionName) break;
        
        currentText += (i === 0 ? '' : ' ') + words[i];
        setStreamedSectionText(currentText);
        
        // Add delay between words for realistic typing effect
        await new Promise(resolve => setTimeout(resolve, 40));
      }
      
      // Complete the section
      const newSection: ReportSection = {
        title: sectionName,
        content
      };
      setSections(prev => [...prev, newSection]);
      setCurrentSectionContent(content);
      setIsSectionStreaming(false);
      setGeneratingSection(null);
      
      toast({
        title: 'بەش دروست کرا',
        description: `بەشی "${sectionName}" تەواو کرا`
      });
      
    } catch (error) {
      setIsSectionStreaming(false);
      setGeneratingSection(null);
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا بەشەکە دروست بکرێت',
        variant: 'destructive'
      });
    }
  };
  
  const handleStopSectionStreaming = () => {
    if (generatingSection) {
      const newSection: ReportSection = {
        title: generatingSection,
        content: streamedSectionText
      };
      setSections(prev => [...prev, newSection]);
      setCurrentSectionContent(streamedSectionText);
      setIsSectionStreaming(false);
      setGeneratingSection(null);
    }
  };

  const handleDownloadReport = async (format: 'text' | 'pdf' = 'text', singleSection: ReportSection | null = null) => {
    try {
      const sectionsToExport = singleSection ? [singleSection] : sections;
      const titleToUse = singleSection ? singleSection.title : outline?.title || 'Report';
      
      if (sectionsToExport.length === 0) {
        toast({
          title: 'هەڵە',
          description: 'ڕاپۆرتەکە بەتاڵە',
          variant: 'destructive'
        });
        return;
      }
      
      if (format === 'pdf') {
        // Show loading toast
        toast({
          title: 'دروستکردنی PDF',
          description: 'تکایە چاوەڕوان بە...',
        });

        const isRTL = language === 'ku' || language === 'ar';
        
        try {
          // Create complete HTML document like ArticleWriter does
          const htmlContent = `
            <!DOCTYPE html>
            <html lang="${language === 'ku' ? 'ku' : language === 'ar' ? 'ar' : 'en'}" dir="${isRTL ? 'rtl' : 'ltr'}">
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
                  direction: ${isRTL ? 'rtl' : 'ltr'};
                  text-align: ${isRTL ? 'right' : 'left'};
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
                  border-${isRTL ? 'right' : 'left'}: 4px solid #3498db;
                  padding-${isRTL ? 'right' : 'left'}: 15px;
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
                  padding-${isRTL ? 'right' : 'left'}: 25px;
                }
                
                li {
                  margin-bottom: 8px;
                }
                
                blockquote {
                  border-${isRTL ? 'right' : 'left'}: 4px solid #3498db;
                  padding-${isRTL ? 'right' : 'left'}: 15px;
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
                
                .section {
                  margin-bottom: 30px;
                  page-break-inside: avoid;
                }
              </style>
            </head>
            <body>
              <div class="header-info">
                <strong>AI Academic Hub</strong><br>
                Generated on: ${new Date().toLocaleDateString(language === 'ku' ? 'ku-Arab-IQ' : language === 'ar' ? 'ar-IQ' : 'en-US')}
              </div>
              
              <h1>${titleToUse}</h1>
              
              ${sectionsToExport.map((section, index) => {
                const cleanContent = (section.content || '').trim();
                if (!cleanContent) return '';
                
                // Use the proper markdown conversion function
                const processedContent = convertMarkdownToHtml(cleanContent);
                
                return `
                  <div class="section">
                    <h2>${section.title}</h2>
                    <div>${processedContent}</div>
                  </div>
                `;
              }).join('')}
            </body>
            </html>
          `;

          // Use the exact same configuration as ArticleWriter
          const options = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `${titleToUse.substring(0, 50)}.pdf`,
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

          console.log('PDF Generation - Using ArticleWriter approach');
          console.log('HTML length:', htmlContent.length);
          console.log('Title:', titleToUse);
          console.log('Sections:', sectionsToExport.length);

          // Generate PDF using the exact same method as ArticleWriter
          await html2pdf().set(options).from(htmlContent).save();
          
          toast({ 
            title: 'سەرکەوتوو', 
            description: singleSection ? `بەشی "${singleSection.title}" وەک PDF دابەزێنرا` : 'ڕاپۆرتی تەواو وەک PDF دابەزێنرا'
          });
          
        } catch (error) {
          console.error('PDF Generation Error:', error);
          toast({
            title: 'هەڵە',
            description: 'نەتوانرا PDF دروست بکرێت: ' + error.message,
            variant: 'destructive'
          });
        }
        return;
      }
      
      // Text format download
      const reportText = singleSection 
        ? `${singleSection.title}\n\n${singleSection.content}`
        : `${outline?.title}\n\n${sectionsToExport.map(section => `${section.title}\n\n${section.content}\n\n`).join('')}`;
      
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${titleToUse.substring(0, 50).replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'دابەزاندن',
        description: singleSection ? `بەشی "${singleSection.title}" دابەزێنرا` : 'ڕاپۆرتی تەواو دابەزێنرا'
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

  const progressPercentage = outline ? (sections.length / outline.sections.length) * 100 : 0;
  const isCompleted = outline && sections.length === outline.sections.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl" ref={reportRef}>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-primary rounded-xl text-primary-foreground">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground sorani-text">دروستکەری ڕاپۆرت</h1>
          <p className="text-muted-foreground latin-text">Report Generator</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Step 1: Topic Input */}
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span className="sorani-text">بابەتی ڕاپۆرت</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="بابەتی ڕاپۆرتەکەت بنووسە..."
              className="input-academic sorani-text"
            />
            <Button 
              onClick={handleGenerateOutline}
              disabled={loading || !topic.trim()}
              className="btn-academic-primary"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  دروستکردنی پلان...
                </>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4 mr-2" />
                  دروستکردنی پلان
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Step 2: Outline */}
        {outline && (
          <Card className="card-academic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span className="sorani-text">پلانی ڕاپۆرت</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h3 className="font-bold text-lg mb-3 sorani-text">{outline.title}</h3>
                <div className="space-y-2">
                  {outline.sections.map((section, index) => {
                    const isGenerated = sections.some(s => s.title === section);
                    const isGenerating = generatingSection === section;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div className="flex items-center gap-3">
                          {isGenerated ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <span className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                          )}
                          <span className="sorani-text">{section}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isGenerating && isSectionStreaming && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={handleStopSectionStreaming} className="gap-1">
                                <Square className="h-3 w-3" />
                                وەستان
                              </Button>
                            </div>
                          )}
                          
                          {!isGenerated && !isGenerating && (
                            <Button 
                              size="sm" 
                              onClick={() => handleGenerateSection(section)}
                              className="btn-academic-secondary"
                            >
                              دروستکردن
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground sorani-text">پێشکەوتن</span>
                    <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Generated Sections */}
        {sections.length > 0 && (
          <Card className="card-academic">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span className="sorani-text">ڕاپۆرتی دروستکراو</span>
              </CardTitle>
              {isCompleted && (
                <div className="flex gap-2">
                  <Button onClick={() => handleDownloadReport('text')} className="btn-academic-primary">
                    <Download className="h-4 w-4 mr-2" />
                    دابەزاندنی دەق
                  </Button>
                  <Button onClick={() => handleDownloadReport('pdf')} className="btn-academic-primary">
                    <Download className="h-4 w-4 mr-2" />
                    دابەزاندنی PDF
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <FormattingControls 
                showFormatting={showFormatting}
                onToggleFormatting={setShowFormatting}
                className="mb-6"
              />
              <div className="space-y-6">
                {sections.map((section, index) => (
                  <div key={index} className="border-l-4 border-primary/30 pl-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg sorani-text">{section.title}</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport('text', section)}
                          className="text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          دەق
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport('pdf', section)}
                          className="text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                    {showFormatting ? (
                      <RichTextRenderer 
                        content={section.content}
                        showCopyButton={true}
                        className="sorani-text"
                      />
                    ) : (
                      <div className="sorani-text text-base leading-relaxed whitespace-pre-wrap">
                        {section.content}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Show currently generating section with streaming */}
                {generatingSection && (
                  <div className="border-l-4 border-primary/30 pl-4 bg-secondary/20 rounded-r-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-bold text-lg sorani-text">{generatingSection}</h3>
                      {isSectionStreaming && (
                        <div className="flex items-center gap-2">
                          <TypingIndicator size="sm" />
                          <span className="text-sm text-muted-foreground sorani-text">دەنووسرێت...</span>
                        </div>
                      )}
                    </div>
                    {showFormatting ? (
                      <RichTextRenderer 
                        content={streamedSectionText}
                        isStreaming={isSectionStreaming}
                        showCopyButton={false}
                        className="sorani-text"
                      />
                    ) : (
                      <div className="sorani-text text-base leading-relaxed whitespace-pre-wrap relative">
                        {streamedSectionText}
                        {isSectionStreaming && (
                          <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-pulse" />
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {isCompleted && (
                  <div className="text-center py-6">
                    <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 px-4 py-2">
                      <Check className="h-4 w-4 mr-2" />
                      ڕاپۆرت تەواو بوو
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
