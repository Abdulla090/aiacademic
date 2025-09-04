import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, ChevronRight, Check, Download, RefreshCw, Pause, Play, Square } from 'lucide-react';
import { geminiService, type ReportOutline, type ReportSection } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from "jspdf";
import { notoNaskhArabic } from '@/lib/fonts';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { FormattingControls } from '@/components/ui/formatting-controls';

interface ReportGeneratorProps {
  language: string;
}

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

  const handleDownloadReport = async (format: 'text' | 'pdf' = 'text') => {
    try {
      if (!outline || sections.length === 0) {
        toast({
          title: 'هەڵە',
          description: 'ڕاپۆرتەکە بەتاڵە',
          variant: 'destructive'
        });
        return;
      }
      
      if (format === 'pdf') {
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 40;
        
        // Add Arabic/Kurdish font support
        if (language === 'ku' || language === 'ar') {
          // Add font to VFS and register it
          pdf.addFileToVFS('NotoNaskhArabic-Regular.ttf', notoNaskhArabic);
          pdf.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
          pdf.setFont('NotoNaskhArabic');
        }

        // Add title
        pdf.setFontSize(20);
        pdf.setFont(undefined, 'bold');
        const titleLines = pdf.splitTextToSize(outline.title || 'Report', pageWidth - 40);
        pdf.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += (titleLines.length * 25) + 20;
        
        // Reset font
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(12);
        
        // Process each section with markdown formatting
        for (const section of sections) {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 40;
            // Reset font for new page
            if (language === 'ku' || language === 'ar') {
              pdf.setFont('NotoNaskhArabic');
            }
            pdf.setFontSize(12);
          }
          
          // Add section title with formatting
          pdf.setFontSize(16);
          pdf.setFont(undefined, 'bold');
          const sectionTitleLines = pdf.splitTextToSize(section.title, pageWidth - 40);
          pdf.text(sectionTitleLines, language === 'ku' || language === 'ar' ? pageWidth - 20 : 20, yPosition, {
            align: language === 'ku' || language === 'ar' ? 'right' : 'left'
          });
          yPosition += (sectionTitleLines.length * 20) + 15;
          
          // Reset font for content
          pdf.setFont(undefined, 'normal');
          pdf.setFontSize(12);
          
          // Process section content with markdown formatting
          const lines = (section.content || '').split('\n');
          let currentListItems: string[] = [];
          let currentListType: 'ul' | 'ol' | null = null;
          let inCodeBlock = false;
          
          const flushList = () => {
            if (currentListItems.length > 0) {
              currentListItems.forEach((item, index) => {
                // Check if we need a new page
                if (yPosition > pageHeight - 30) {
                  pdf.addPage();
                  yPosition = 40;
                  // Reset font for new page
                  if (language === 'ku' || language === 'ar') {
                    pdf.setFont('NotoNaskhArabic');
                  }
                  pdf.setFontSize(12);
                }
                
                const bullet = currentListType === 'ol' ? `${index + 1}. ` : '• ';
                const itemText = `${bullet}${item}`;
                const itemLines = pdf.splitTextToSize(itemText, pageWidth - 50);
                
                pdf.text(itemLines, language === 'ku' || language === 'ar' ? pageWidth - 30 : 30, yPosition, {
                  align: language === 'ku' || language === 'ar' ? 'right' : 'left'
                });
                yPosition += itemLines.length * 15 + 3;
              });
              currentListItems = [];
              currentListType = null;
            }
          };
          
          for (const line of lines) {
            // Check if we need a new page
            if (yPosition > pageHeight - 40) {
              pdf.addPage();
              yPosition = 40;
              // Reset font for new page
              if (language === 'ku' || language === 'ar') {
                pdf.setFont('NotoNaskhArabic');
              }
              pdf.setFontSize(12);
            }
            
            // Handle code blocks
            if (line.trim().startsWith('```')) {
              flushList();
              inCodeBlock = !inCodeBlock;
              continue;
            }
            
            if (inCodeBlock) {
              const codeLines = pdf.splitTextToSize(line, pageWidth - 50);
              pdf.setFontSize(10);
              codeLines.forEach(codeLine => {
                // Check if we need a new page
                if (yPosition > pageHeight - 40) {
                  pdf.addPage();
                  yPosition = 40;
                  // Reset font for new page
                  if (language === 'ku' || language === 'ar') {
                    pdf.setFont('NotoNaskhArabic');
                  }
                  pdf.setFontSize(10);
                }
                pdf.text(codeLine, language === 'ku' || language === 'ar' ? pageWidth - 35 : 35, yPosition, {
                  align: language === 'ku' || language === 'ar' ? 'right' : 'left'
                });
                yPosition += 15;
              });
              pdf.setFontSize(12);
              continue;
            }
            
            // Handle headers
            const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headerMatch) {
              flushList();
              const level = headerMatch[1].length;
              const text = headerMatch[2];
              const headerSize = 20 - (level * 2);
              pdf.setFontSize(headerSize);
              pdf.setFont(undefined, 'bold');
              const headerLines = pdf.splitTextToSize(text, pageWidth - 40);
              pdf.text(headerLines, language === 'ku' || language === 'ar' ? pageWidth - 20 : 20, yPosition, {
                align: language === 'ku' || language === 'ar' ? 'right' : 'left'
              });
              yPosition += (headerLines.length * (headerSize * 0.7)) + 15;
              pdf.setFont(undefined, 'normal');
              pdf.setFontSize(12);
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
              pdf.setFont(undefined, 'italic');
              const quoteLines = pdf.splitTextToSize(quoteText, pageWidth - 60);
              quoteLines.forEach((quoteLine, index) => {
                // Check if we need a new page
                if (yPosition > pageHeight - 40) {
                  pdf.addPage();
                  yPosition = 40;
                  // Reset font for new page
                  if (language === 'ku' || language === 'ar') {
                    pdf.setFont('NotoNaskhArabic');
                  }
                  pdf.setFont(undefined, 'italic');
                }
                pdf.text(quoteLine, language === 'ku' || language === 'ar' ? pageWidth - 40 : 40, yPosition, {
                  align: language === 'ku' || language === 'ar' ? 'right' : 'left'
                });
                yPosition += 15;
              });
              pdf.setFont(undefined, 'normal');
              yPosition += 5;
              continue;
            }
            
            // Handle horizontal rules
            if (line.trim().match(/^[-*_]{3,}$/)) {
              flushList();
              pdf.line(20, yPosition, pageWidth - 20, yPosition);
              yPosition += 15;
              continue;
            }
            
            // Handle empty lines
            if (line.trim() === '') {
              flushList();
              yPosition += 15;
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
            
            const splitText = pdf.splitTextToSize(formattedLine, pageWidth - 40);
            pdf.text(splitText, language === 'ku' || language === 'ar' ? pageWidth - 20 : 20, yPosition, {
              align: language === 'ku' || language === 'ar' ? 'right' : 'left'
            });
            yPosition += splitText.length * 15 + 3;
          }
          
          // Flush any remaining list
          flushList();
          
          yPosition += 20; // Space between sections
        }
        
        pdf.save(`${(outline.title || 'report').substring(0, 50)}.pdf`);
        toast({ title: 'دابەزاندن', description: 'PDF دابەزێنرا' });
        return;
      }
      
      const reportText = `${outline.title}\n\n${sections.map(section => `${section.title}\n\n${section.content}\n\n`).join('')}`;
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(outline.title || 'report').substring(0, 50)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'دابەزاندن',
        description: 'ڕاپۆرتەکە دابەزێنرا'
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
                    <h3 className="font-bold text-lg mb-3 sorani-text">{section.title}</h3>
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
