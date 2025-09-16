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
import { ResponsiveLayout, ResponsiveButtonGroup } from '@/components/ui/responsive-layout';
import { useResponsive } from '@/hooks/useResponsive';

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
          // Import jsPDF only - no text shaping libraries
          const { jsPDF } = await import('jspdf');
          
          // Create new PDF document
          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          let kurdishFontLoaded = false;
          let loadedFontName = '';

          // Try to add Kurdish font support if RTL
          if (isRTL) {
            const fontOptions = [
              { url: '/kurdish-font/DejaVuSans.ttf', name: 'DejaVuSans' },
              { url: '/kurdish-font/Amiri-Regular.ttf', name: 'AmiriRegular' },
              { url: '/kurdish-font/amiri-regular.ttf', name: 'AmiriLocal' },
              { url: '/kurdish-font/UniSalar_F_095.otf', name: 'UniSalar095' },
              { url: '/kurdish-font/UniSalar_F_112.otf', name: 'UniSalar112' },
              { url: '/kurdish-font/UniSalar_F_113.otf', name: 'UniSalar113' },
              { url: '/kurdish-font/ku-font.ttf', name: 'KurdishFont' }
            ];
            
            for (const fontOption of fontOptions) {
              try {
                console.log(`Trying to load font: ${fontOption.name} from ${fontOption.url}`);
                const fontResponse = await fetch(fontOption.url);
                
                if (fontResponse.ok) {
                  const fontArrayBuffer = await fontResponse.arrayBuffer();
                  const fontUint8Array = new Uint8Array(fontArrayBuffer);
                  let fontBase64 = '';
                  
                  // Convert to base64 in chunks
                  const chunkSize = 0x8000;
                  for (let i = 0; i < fontUint8Array.length; i += chunkSize) {
                    const chunk = fontUint8Array.subarray(i, i + chunkSize);
                    fontBase64 += String.fromCharCode.apply(null, Array.from(chunk));
                  }
                  fontBase64 = btoa(fontBase64);
                  
                  // Add the font to jsPDF
                  doc.addFileToVFS(`${fontOption.name}.ttf`, fontBase64);
                  doc.addFont(`${fontOption.name}.ttf`, fontOption.name, 'normal');
                  kurdishFontLoaded = true;
                  loadedFontName = fontOption.name;
                  console.log(`Successfully loaded font: ${fontOption.name}`);
                  break; // Exit loop on successful load
                }
              } catch (fontError) {
                console.warn(`Failed to load font ${fontOption.name}:`, fontError);
                continue; // Try next font
              }
            }
            
            if (!kurdishFontLoaded) {
              console.warn('No Kurdish fonts could be loaded, will use system font');
            }
          }

          // Simple text processing - no Arabic logic, preserve original structure
          const processText = (text: string): string => {
            // Just clean the text without any reshaping or Arabic processing
            return text.trim();
          };

          // Helper function to handle mixed LTR/RTL content properly
          const processMixedContent = (text: string): string => {
            // Replace bullet points with Kurdish/Arabic equivalents if RTL
            if (isRTL) {
              // Convert numbered lists to Kurdish numerals or simple bullets
              text = text.replace(/^\s*\d+\.\s+/gm, '• '); // Convert numbered lists to bullets
              text = text.replace(/^\s*[-*+]\s+/gm, '• '); // Normalize bullet points
            }
            return text.trim();
          };

          // Test if current font supports Kurdish characters
          const testKurdishSupport = (): boolean => {
            try {
              const testChars = 'ێزژچپگڤیۆۇەڵڕڵینئ';
              const width = doc.getTextWidth(testChars);
              // If width is 0 or too small, font doesn't support these characters
              return width > 10;
            } catch {
              return false;
            }
          };

          let yPosition = 20;
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const margin = 20;
          const maxWidth = pageWidth - (margin * 2);
          
          // Set font - prioritize fonts that support Kurdish characters
          if (isRTL && kurdishFontLoaded) {
            doc.setFont(loadedFontName);
            console.log(`Using loaded Kurdish font: ${loadedFontName}`);
            
            // Test if the font actually supports Kurdish characters
            if (!testKurdishSupport()) {
              console.warn(`Font ${loadedFontName} doesn't support Kurdish characters properly, switching to courier`);
              doc.setFont('courier');
            }
          } else if (isRTL) {
            // Use courier as fallback - it has better Unicode support than times/helvetica
            doc.setFont('courier');
            console.log('Using Courier font for Kurdish (better Unicode support)');
          } else {
            doc.setFont('helvetica');
          }
          
          // Add header
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          const headerText = isRTL ? 
            `ڕێکەوت: ${new Date().toLocaleDateString('ku-Arab-IQ')} - ناوەندی ئەکادیمی زیرەکی دەستکرد` :
            `AI Academic Hub - Generated on: ${new Date().toLocaleDateString()}`;
          const headerX = isRTL ? pageWidth - margin : pageWidth / 2;
          doc.text(headerText, headerX, yPosition, { align: isRTL ? 'right' : 'center' });
          yPosition += 15;
          
          // Add a line under header
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 15;
          
          // Add main title (if not single section)
          if (!singleSection) {
            doc.setFontSize(20);
            doc.setTextColor(44, 62, 80);
            
            const cleanTitle = processText(titleToUse);
            const titleLines = doc.splitTextToSize(cleanTitle, maxWidth);
            titleLines.forEach((line: string) => {
              if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
              }
              const titleX = isRTL ? pageWidth - margin : pageWidth / 2;
              doc.text(line, titleX, yPosition, { align: isRTL ? 'right' : 'center' });
              yPosition += 10;
            });
            yPosition += 20;
          }
          
          // Process each section
          sectionsToExport.forEach((section, index) => {
            const cleanContent = (section.content || '').trim();
            if (!cleanContent) return;
            
            // Check if we need a new page for section title
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 20;
            }
            
            // Add section title
            doc.setFontSize(16);
            doc.setTextColor(52, 73, 94);
            
            const cleanSectionTitle = processText(section.title);
            const sectionTitleLines = doc.splitTextToSize(cleanSectionTitle, maxWidth);
            sectionTitleLines.forEach((line: string) => {
              if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
              }
              const titleX = isRTL ? pageWidth - margin : margin;
              doc.text(line, titleX, yPosition, { align: isRTL ? 'right' : 'left' });
              yPosition += 8;
            });
            yPosition += 10;
            
            // Process section content
            doc.setFontSize(12);
            doc.setTextColor(51, 51, 51);
            
            // Clean content - remove markdown and handle mixed LTR/RTL properly
            let processedContent = cleanContent
              .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold markdown
              .replace(/\*(.+?)\*/g, '$1') // Remove italic markdown
              .replace(/###\s+(.+)/g, '$1') // Remove h3 markdown
              .replace(/##\s+(.+)/g, '$1') // Remove h2 markdown
              .replace(/^#\s+(.+)/gm, '$1') // Remove h1 markdown
              .replace(/\n{3,}/g, '\n\n'); // Normalize line breaks
            
            // Process mixed content to handle LTR/RTL issues
            processedContent = processMixedContent(processedContent);
            
            // Split content into paragraphs
            const paragraphs = processedContent.split('\n\n').filter(p => p.trim());
            
            paragraphs.forEach((paragraph, pIndex) => {
              if (paragraph.trim()) {
                // Process text without Arabic logic - just clean
                const cleanParagraph = processText(paragraph.trim());
                
                // Split text manually to avoid jsPDF's text direction issues
                const words = cleanParagraph.split(' ');
                let currentLine = '';
                const maxLineWidth = maxWidth;
                
                words.forEach((word, wordIndex) => {
                  const testLine = currentLine ? `${currentLine} ${word}` : word;
                  const lineWidth = doc.getTextWidth(testLine);
                  
                  if (lineWidth > maxLineWidth && currentLine) {
                    // Print current line
                    if (yPosition > pageHeight - 20) {
                      doc.addPage();
                      yPosition = 20;
                    }
                    const textX = isRTL ? pageWidth - margin : margin;
                    doc.text(currentLine, textX, yPosition, { align: isRTL ? 'right' : 'left' });
                    yPosition += 6;
                    currentLine = word;
                  } else {
                    currentLine = testLine;
                  }
                });
                
                // Print remaining text
                if (currentLine) {
                  if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = 20;
                  }
                  const textX = isRTL ? pageWidth - margin : margin;
                  doc.text(currentLine, textX, yPosition, { align: isRTL ? 'right' : 'left' });
                  yPosition += 6;
                }
                
                yPosition += 5; // Extra space between paragraphs
              }
            });
            
            yPosition += 15; // Space between sections
          });

          // Save the PDF
          const filename = `${titleToUse.substring(0, 50).replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '')}.pdf`;
          doc.save(filename);
          
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
