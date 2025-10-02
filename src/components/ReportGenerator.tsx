import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, ChevronRight, Check, Download, RefreshCw, Pause, Play, Square } from 'lucide-react';
import { geminiService, type ReportOutline, type ReportSection } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { KurdishPDFService } from '@/services/kurdishPdfService';
import { EnglishPDFService } from '@/services/englishPdfService';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { FormattingControls } from '@/components/ui/formatting-controls';
import { ResponsiveLayout, ResponsiveButtonGroup } from '@/components/ui/responsive-layout';
import { useResponsive } from '@/hooks/useResponsive';
import { LanguageSelection } from './LanguageSelection';

interface ReportGeneratorProps {
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
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
  
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

export const ReportGenerator = ({}: ReportGeneratorProps) => {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('en');
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
  const { isMobile, isTablet } = useResponsive();

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
    } catch (error: any) {
      // Provide specific error messages based on the error type
      let errorTitle = 'هەڵە';
      let errorDescription = 'نەتوانرا پلانەکە دروست بکرێت';
      
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
      
    } catch (error: any) {
      setIsSectionStreaming(false);
      setGeneratingSection(null);
      
      // Provide specific error messages based on the error type
      let errorTitle = 'هەڵە';
      let errorDescription = 'نەتوانرا بەشەکە دروست بکرێت';
      
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
    const sectionsToExport = singleSection ? [singleSection] : sections;
    const titleToUse = singleSection ? singleSection.title : outline?.title || 'Report';

    if (sectionsToExport.length === 0) {
      toast({
        title: 'هەڵە',
        description: 'ڕاپۆرتەکە بەتاڵە',
        variant: 'destructive',
      });
      return;
    }

    if (format === 'pdf') {
      toast({
        title: 'Creating PDF',
        description: 'Please wait...',
      });

      try {
        if (language === 'en') {
          const pdfService = new EnglishPDFService();
          pdfService.addTitle(titleToUse);
          sectionsToExport.forEach(section => {
            pdfService.addSectionTitle(section.title);
            if (section.content) {
              section.content.split('\n').forEach(paragraph => {
                if (paragraph.trim()) {
                  pdfService.addParagraph(paragraph);
                }
              });
            }
          });
          pdfService.save(`${titleToUse.substring(0, 50).replace(/[^a-zA-Z0-9\s]/g, '')}.pdf`);
        } else {
          const pdfService = new KurdishPDFService();
          await pdfService.createKurdishReport(
            titleToUse,
            sectionsToExport.map(s => ({ title: s.title, content: s.content || '' })),
            language as 'ku'
          );
          pdfService.save(`${titleToUse.substring(0, 50).replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '')}.pdf`);
        }
        
        toast({
          title: 'Success',
          description: singleSection ? `Section "${singleSection.title}" has been downloaded as a PDF.` : 'The full report has been downloaded as a PDF.',
        });
      } catch (error) {
        console.error('PDF Generation Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate PDF: ' + (error as Error).message,
          variant: 'destructive',
        });
      }
    } else {
      const reportText = singleSection
        ? `${singleSection.title}\n\n${singleSection.content}`
        : `${outline?.title}\n\n${sections.map(section => `${section.title}\n\n${section.content}\n\n`).join('')}`;
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
        description: singleSection ? `بەشی "${singleSection.title}" دابەزێنرا` : 'ڕاپۆرتی تەواو دابەزێنرا',
      });
    }
  };

  const progressPercentage = outline ? (sections.length / outline.sections.length) * 100 : 0;
  const isCompleted = outline && sections.length === outline.sections.length;

  return (
    <div ref={reportRef}>
      <ResponsiveLayout>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-primary rounded-xl text-primary-foreground">
            <FileText className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
          </div>
          <div>
            <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-foreground ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>دروستکەری ڕاپۆرت</h1>
            <p className="text-muted-foreground latin-text">Report Generator</p>
          </div>
        </div>

      <div className="space-y-8">
        {/* Step 1: Topic Input */}
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className={`${isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'} bg-gradient-primary text-primary-foreground rounded-full flex items-center justify-center font-bold`}>1</span>
              <span className={language === 'ku' ? 'sorani-text' : 'latin-text'}>بابەتی ڕاپۆرت</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="بابەتی ڕاپۆرتەکەت بنووسە..."
              className={`input-academic ${language === 'ku' ? 'sorani-text' : 'latin-text'} ${isMobile ? 'text-sm' : ''}`}
            />
            <div className="space-y-2">
               <LanguageSelection
                 selectedLanguage={language}
                 onLanguageChange={setLanguage}
               />
            </div>
            <Button
              onClick={handleGenerateOutline}
              disabled={loading || !topic.trim()}
              className={`btn-academic-primary ${isMobile ? 'w-full text-sm py-2' : ''}`}
            >
              {loading ? (
                <>
                  <RefreshCw className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} animate-spin mr-2`} />
                  دروستکردنی پلان...
                </>
              ) : (
                <>
                  <ChevronRight className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
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
                <span className={language === 'ku' ? 'sorani-text' : 'latin-text'}>پلانی ڕاپۆرت</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h3 className={`font-bold text-lg mb-3 ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>{outline.title}</h3>
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
                          <span className={language === 'ku' ? 'sorani-text' : 'latin-text'}>{section}</span>
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
                    <span className={`text-sm text-muted-foreground ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>پێشکەوتن</span>
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
                <span className={language === 'ku' ? 'sorani-text' : 'latin-text'}>ڕاپۆرتی دروستکراو</span>
              </CardTitle>
              {isCompleted && (
                <ResponsiveButtonGroup orientation={isMobile ? "vertical" : "horizontal"}>
                  <Button 
                    onClick={() => handleDownloadReport('text')} 
                    className={`btn-academic-primary ${isMobile ? 'text-xs px-3 py-2' : ''}`}
                    size={isMobile ? "sm" : "default"}
                  >
                    <Download className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                    دابەزاندنی دەق
                  </Button>
                  <Button 
                    onClick={() => handleDownloadReport('pdf')} 
                    className={`btn-academic-primary ${isMobile ? 'text-xs px-3 py-2' : ''}`}
                    size={isMobile ? "sm" : "default"}
                  >
                    <Download className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                    دابەزاندنی PDF
                  </Button>
                </ResponsiveButtonGroup>
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
                      <h3 className={`font-bold text-lg ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>{section.title}</h3>
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
                        className={language === 'ku' ? 'sorani-text' : 'latin-text'}
                      />
                    ) : (
                      <div className={`text-base leading-relaxed whitespace-pre-wrap ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>
                        {section.content}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Show currently generating section with streaming */}
                {generatingSection && (
                  <div className="border-l-4 border-primary/30 pl-4 bg-secondary/20 rounded-r-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className={`font-bold text-lg ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>{generatingSection}</h3>
                      {isSectionStreaming && (
                        <div className="flex items-center gap-2">
                          <TypingIndicator size="sm" />
                          <span className={`text-sm text-muted-foreground ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>دەنووسرێت...</span>
                        </div>
                      )}
                    </div>
                    {showFormatting ? (
                      <RichTextRenderer 
                        content={streamedSectionText}
                        isStreaming={isSectionStreaming}
                        showCopyButton={false}
                        className={language === 'ku' ? 'sorani-text' : 'latin-text'}
                      />
                    ) : (
                      <div className={`text-base leading-relaxed whitespace-pre-wrap relative ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>
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
      </ResponsiveLayout>
    </div>
  );
};
