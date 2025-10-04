import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, ChevronRight, Check, Download, RefreshCw, Pause, Play, Square, Edit, Plus, X, CheckCircle, Bot, Zap } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { CREDIT_COSTS } from '@/config/credits';
import { ToolHeader } from '@/components/ToolHeader';

type ReportGeneratorProps = object;

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

export const ReportGenerator = () => {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('en');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [outline, setOutline] = useState<ReportOutline | null>(null);
  const [editableOutline, setEditableOutline] = useState<string[]>([]);
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [currentStep, setCurrentStep] = useState(0); // 0: topic, 1: titles, 2: outline, 3: content
  const [loading, setLoading] = useState(false);
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const [currentSectionContent, setCurrentSectionContent] = useState('');
  const [streamedSectionText, setStreamedSectionText] = useState('');
  const [isSectionStreaming, setIsSectionStreaming] = useState(false);
  const [showFormatting, setShowFormatting] = useState(true);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [autoGenCancelled, setAutoGenCancelled] = useState(false);
  const autoGenRef = useRef(false);
  const { toast } = useToast();
  const { isMobile, isTablet } = useResponsive();
  const { deductCredits, credits } = useAuth();

  const handleGenerateTitles = async () => {
    if (!topic.trim()) {
      toast({
        title: 'هەڵە',
        description: 'تکایە بابەتەکە بنووسە',
        variant: 'destructive'
      });
      return;
    }

    // Check and deduct credits before starting
    const success = await deductCredits(
      CREDIT_COSTS.REPORT_GENERATOR,
      'Report Generator',
      `دروستکردنی ڕاپۆرت بۆ: ${topic}`
    );

    if (!success) return;

    setLoading(true);
    try {
      const titles = await geminiService.generateReportTitles(topic, language);
      setGeneratedTitles(titles);
      setCurrentStep(1);
      toast({
        title: 'ناونیشانەکان دروست کران',
        description: '5 ناونیشانی ئەکادیمی ئامادە کران'
      });
    } catch (error: any) {
      // Provide specific error messages based on the error type
      let errorTitle = 'هەڵە';
      let errorDescription = 'نەتوانرا ناونیشانەکان دروست بکرێت';
      
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

  const handleSelectTitle = (title: string) => {
    setSelectedTitle(title);
  };

  const handleGenerateOutline = async () => {
    if (!selectedTitle.trim()) {
      toast({
        title: 'هەڵە',
        description: 'تکایە ناونیشانێک هەڵبژێرە',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await geminiService.generateReportOutline(selectedTitle, language);
      setOutline(result);
      setEditableOutline([...result.sections]);
      setSections([]);
      setCurrentStep(2);
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

  const handleUpdateOutlineSection = (index: number, newValue: string) => {
    const updated = [...editableOutline];
    updated[index] = newValue;
    setEditableOutline(updated);
  };

  const handleAddOutlineSection = () => {
    setEditableOutline([...editableOutline, '']);
  };

  const handleRemoveOutlineSection = (index: number) => {
    const updated = editableOutline.filter((_, i) => i !== index);
    setEditableOutline(updated);
  };

  const handleConfirmOutline = () => {
    if (editableOutline.some(s => !s.trim())) {
      toast({
        title: 'هەڵە',
        description: 'تکایە هەموو بەشەکان پڕ بکەوە',
        variant: 'destructive'
      });
      return;
    }
    
    if (outline) {
      setOutline({ ...outline, sections: editableOutline });
    }
    setCurrentStep(3);
    toast({
      title: 'پلان پەسەند کرا',
      description: 'دەتوانیت دەستبکەیت بە دروستکردنی بەشەکان'
    });
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

  const handleAutoGenerate = async () => {
    if (!outline) return;
    
    setIsAutoGenerating(true);
    setAutoGenCancelled(false);
    autoGenRef.current = true;
    
    toast({
      title: 'دەستکردنی ئاژانس',
      description: 'ئاژانسەکە دەستی بە دروستکردنی بەشەکان دەکات...'
    });

    // Get sections that haven't been generated yet
    const remainingSections = outline.sections.filter(
      section => !sections.some(s => s.title === section)
    );

    for (let i = 0; i < remainingSections.length; i++) {
      // Check if auto-generation was cancelled
      if (!autoGenRef.current || autoGenCancelled) {
        toast({
          title: 'وەستاندن',
          description: 'دروستکردنی خۆکار وەستێنرا'
        });
        break;
      }

      const sectionName = remainingSections[i];
      
      try {
        // Generate the section
        await handleGenerateSection(sectionName);
        
        // Wait 5 seconds before next section (unless it's the last one)
        if (i < remainingSections.length - 1 && autoGenRef.current) {
          toast({
            title: 'چاوەڕوانبوون',
            description: `${5} چرکە چاوەڕوانی پێش بەشی دواتر...`
          });
          
          // Wait 5 seconds with cancellation check
          for (let second = 0; second < 5; second++) {
            if (!autoGenRef.current || autoGenCancelled) break;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.error('Auto-generation error:', error);
        toast({
          title: 'هەڵە',
          description: `کێشە لە دروستکردنی بەشی "${sectionName}"`,
          variant: 'destructive'
        });
        // Continue with next section instead of stopping completely
      }
    }

    setIsAutoGenerating(false);
    autoGenRef.current = false;
    
    if (!autoGenCancelled) {
      toast({
        title: 'تەواو بوو',
        description: 'هەموو بەشەکان بە سەرکەوتوویی دروست کران'
      });
    }
  };

  const handleStopAutoGenerate = () => {
    setAutoGenCancelled(true);
    autoGenRef.current = false;
    setIsAutoGenerating(false);
    
    toast({
      title: 'وەستاندن',
      description: 'دروستکردنی خۆکار وەستێنرا'
    });
  };

  // Function to convert Markdown to HTML for Kurdish PDF
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
    
    // Convert line breaks to paragraphs
    html = html.split('\n\n').map(paragraph => {
      if (paragraph.trim() && !paragraph.includes('<h') && !paragraph.includes('<ul>') && !paragraph.includes('<ol>') && !paragraph.includes('<blockquote>') && !paragraph.includes('<pre>') && !paragraph.includes('<hr>')) {
        return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
      }
      return paragraph.replace(/\n/g, '<br>');
    }).join('\n');
    
    return html;
  };

  const handleDownloadReport = async (format: 'text' | 'pdf' | 'docx' = 'text', singleSection: ReportSection | null = null) => {
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

    if (format === 'pdf' || format === 'docx') {
      toast({
        title: format === 'pdf' ? 'دروستکردنی PDF' : 'دروستکردنی DOCX',
        description: 'تکایە چاوەڕێ بە...',
      });

      try {
        if (language === 'en') {
          const pdfService = new EnglishPDFService();
          pdfService.addTitle(titleToUse);
          sectionsToExport.forEach(section => {
            pdfService.addSectionTitle(section.title);
            if (section.content) {
              pdfService.addParagraph(section.content);
            }
          });
          pdfService.save(`${titleToUse.substring(0, 50).replace(/[^a-zA-Z0-9\s]/g, '')}.pdf`);
        } else {
          // Kurdish export
          if (format === 'docx') {
            // Export as DOCX
            const { exportKurdishDOCXBrowser } = await import('@/utils/kurdishExportBrowser');
            await exportKurdishDOCXBrowser({
              title: titleToUse,
              sections: sectionsToExport.map(section => ({
                title: section.title,
                content: section.content || '',
              })),
              fileName: titleToUse.substring(0, 50).replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, ''),
            });
          } else {
            // Export as PDF with enhanced html2pdf
            const { exportKurdishPDFBrowser } = await import('@/utils/kurdishExportBrowser');
            await exportKurdishPDFBrowser({
              title: titleToUse,
              sections: sectionsToExport.map(section => ({
                title: section.title,
                content: section.content || '',
              })),
              fileName: titleToUse.substring(0, 50).replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, ''),
            });
          }
        }
        
        const formatName = format === 'docx' ? 'DOCX' : 'PDF';
        toast({
          title: 'سەرکەوتوو',
          description: singleSection 
            ? `بەشی "${singleSection.title}" وەک ${formatName} دابەزێنرا` 
            : `ڕاپۆرتی تەواو وەک ${formatName} دابەزێنرا`,
        });
      } catch (error) {
        console.error(`${format.toUpperCase()} Generation Error:`, error);
        toast({
          title: 'هەڵە',
          description: `نەتوانرا ${format === 'docx' ? 'DOCX' : 'PDF'} دروست بکرێت: ` + (error as Error).message,
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
    <div ref={reportRef} className="w-full max-w-full overflow-x-hidden" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      <ResponsiveLayout className="w-full max-w-full overflow-x-hidden">
        <ToolHeader 
          toolName="دروستکەری ڕاپۆرت"
          creditCost={CREDIT_COSTS.REPORT_GENERATOR}
          icon={
            <div className="p-3 bg-gradient-primary rounded-xl text-primary-foreground">
              <FileText className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
            </div>
          }
        />

      <div className="space-y-8">
        {/* Step 1: Topic Input */}
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className={`${isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'} ${currentStep > 0 ? 'bg-green-600' : 'bg-gradient-primary'} text-primary-foreground rounded-full flex items-center justify-center font-bold`}>
                {currentStep > 0 ? <Check className="h-4 w-4" /> : '1'}
              </span>
              <span className={language === 'ku' ? 'sorani-text' : 'latin-text'}>بابەتی ڕاپۆرت</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="بابەتی ڕاپۆرتەکەت بنووسە..."
              className={`input-academic ${language === 'ku' ? 'sorani-text' : 'latin-text'} ${isMobile ? 'text-sm' : ''}`}
              disabled={currentStep > 0}
            />
            <div className="space-y-2">
               <LanguageSelection
                 selectedLanguage={language}
                 onLanguageChange={setLanguage}
               />
            </div>
            {currentStep === 0 && (
              <Button
                onClick={handleGenerateTitles}
                disabled={loading || !topic.trim()}
                className={`btn-academic-primary ${isMobile ? 'w-full text-sm py-2' : ''}`}
              >
                {loading ? (
                  <>
                    <RefreshCw className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} animate-spin mr-2`} />
                    دروستکردنی ناونیشانەکان...
                  </>
                ) : (
                  <>
                    <ChevronRight className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                    دروستکردنی ناونیشان
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Title Selection */}
        {generatedTitles.length > 0 && (
          <Card className="card-academic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={`${isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'} ${currentStep > 1 ? 'bg-green-600' : 'bg-gradient-primary'} text-primary-foreground rounded-full flex items-center justify-center font-bold`}>
                  {currentStep > 1 ? <Check className="h-4 w-4" /> : '2'}
                </span>
                <span className={language === 'ku' ? 'sorani-text' : 'latin-text'}>هەڵبژاردنی ناونیشان</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={`text-sm text-muted-foreground ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>
                یەکێک لەم ناونیشانانە هەڵبژێرە:
              </p>
              <div className="space-y-2 w-full max-w-full overflow-hidden">
                {generatedTitles.map((title, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectTitle(title)}
                    disabled={currentStep > 1}
                    className={`w-full max-w-full p-2 md:p-4 text-right rounded-lg border-2 transition-all overflow-hidden ${
                      selectedTitle === title
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 bg-background'
                    } ${currentStep > 1 ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ maxWidth: '100%', overflow: 'hidden' }}
                  >
                    <div className="flex items-start gap-2 md:gap-3 w-full max-w-full overflow-hidden">
                      <span className={`flex-shrink-0 w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold ${
                        selectedTitle === title ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {selectedTitle === title ? <Check className="h-3 w-3 md:h-4 md:w-4" /> : index + 1}
                      </span>
                      <span className={`flex-1 min-w-0 text-xs md:text-base break-words overflow-wrap-anywhere ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>{title}</span>
                    </div>
                  </button>
                ))}
              </div>
              {currentStep === 1 && selectedTitle && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateOutline}
                    disabled={loading}
                    className={`btn-academic-primary flex-1 ${isMobile ? 'text-sm py-2' : ''}`}
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
                </div>
              )}
              {selectedTitle && (
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([selectedTitle], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedTitle.substring(0, 50)}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast({ title: 'دابەزاندن', description: 'ناونیشانەکە دابەزێنرا' });
                    }}
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    دابەزاندنی ناونیشان
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Outline Editing */}
        {outline && currentStep >= 2 && (
          <Card className="card-academic w-full max-w-full overflow-hidden">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
                <span className={`${isMobile ? 'w-5 h-5 text-[10px]' : 'w-8 h-8 text-sm'} ${currentStep > 2 ? 'bg-green-600' : 'bg-gradient-primary'} text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
                  {currentStep > 2 ? <Check className="h-3 w-3" /> : '3'}
                </span>
                <span className={`${isMobile ? 'text-xs' : 'text-base'} truncate ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>دەستکاریکردنی پلان</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-4 overflow-hidden p-3 md:p-6">
              <div className="p-2 md:p-4 bg-secondary/30 rounded-lg overflow-hidden w-full max-w-full">
                <h3 className={`font-bold text-xs md:text-lg mb-2 md:mb-4 break-words overflow-wrap-anywhere w-full leading-tight ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>{outline.title}</h3>
                
                {currentStep === 2 ? (
                  <>
                    <p className={`text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>
                      دەتوانیت پلانەکە دەستکاری بکەیت، بەش زیاد بکەیت یان بسڕیتەوە
                    </p>
                    <div className="space-y-2 w-full max-w-full overflow-hidden">
                      {editableOutline.map((section, index) => (
                        <div key={index} className="flex items-center gap-1 md:gap-2 w-full max-w-full overflow-hidden">
                          <span className="text-xs md:text-sm font-medium text-muted-foreground flex-shrink-0">{index + 1}.</span>
                          <Input
                            value={section}
                            onChange={(e) => handleUpdateOutlineSection(index, e.target.value)}
                            className={`flex-1 min-w-0 max-w-full text-xs md:text-base ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}
                            placeholder={language === 'ku' ? 'ناونیشانی بەش...' : 'Section title...'}
                            style={{ maxWidth: '100%' }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveOutlineSection(index)}
                            disabled={editableOutline.length <= 1}
                            className="flex-shrink-0 p-1 md:p-2"
                          >
                            <X className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={handleAddOutlineSection}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        زیادکردنی بەش
                      </Button>
                      <Button
                        onClick={handleConfirmOutline}
                        className="btn-academic-primary flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        پەسەندکردنی پلان
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4 w-full max-w-full overflow-hidden">
                      {outline.sections.map((section, index) => (
                        <div key={index} className="flex items-start gap-1.5 md:gap-2 p-1.5 md:p-2 bg-background rounded w-full max-w-full overflow-hidden">
                          <Check className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-green-600 flex-shrink-0 mt-0.5`} />
                          <span className={`${isMobile ? 'text-[11px] leading-tight' : 'text-sm md:text-base'} break-words overflow-wrap-anywhere flex-1 min-w-0 ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>{section}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const outlineText = `${outline.title}\n\n${outline.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
                          const blob = new Blob([outlineText], { type: 'text/plain;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${outline.title.substring(0, 50)}-outline.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          toast({ title: 'دابەزاندن', description: 'پلانەکە دابەزێنرا' });
                        }}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        دابەزاندنی پلان (دەق)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const outlineText = `${outline.title}\n\n${outline.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
                          try {
                            if (language === 'en') {
                              const pdfService = new EnglishPDFService();
                              pdfService.addTitle(outline.title);
                              outline.sections.forEach((section, i) => {
                                pdfService.addParagraph(`${i + 1}. ${section}`);
                              });
                              pdfService.save(`${outline.title.substring(0, 50)}-outline.pdf`);
                            } else {
                              const pdfService = new KurdishPDFService();
                              await pdfService.createKurdishReport(
                                outline.title,
                                outline.sections.map((s, i) => ({ title: `${i + 1}`, content: s })),
                                language as 'ku'
                              );
                              pdfService.save(`${outline.title.substring(0, 50)}-outline.pdf`);
                            }
                            toast({ title: 'دابەزاندن', description: 'پلانەکە دابەزێنرا وەک PDF' });
                          } catch (error) {
                            toast({ title: 'هەڵە', description: 'نەتوانرا PDF دروست بکرێت', variant: 'destructive' });
                          }
                        }}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        دابەزاندنی پلان (PDF)
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Content Generation */}
        {outline && currentStep >= 3 && (
          <Card className="card-academic w-full max-w-full overflow-hidden">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
                <span className={`${isMobile ? 'w-5 h-5 text-[10px]' : 'w-8 h-8 text-sm'} bg-gradient-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0`}>4</span>
                <span className={`${isMobile ? 'text-xs' : 'text-base'} truncate ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>دروستکردنی ناوەڕۆک</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-4 overflow-hidden p-3 md:p-6">
              <div className="p-2 md:p-4 bg-secondary/30 rounded-lg overflow-hidden w-full max-w-full">
                <h3 className={`font-bold text-xs md:text-lg mb-2 md:mb-3 break-words overflow-wrap-anywhere w-full leading-tight ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>{outline.title}</h3>
                <div className="space-y-1.5 md:space-y-2 w-full max-w-full overflow-hidden">
                  {outline.sections.map((section, index) => {
                    const isGenerated = sections.some(s => s.title === section);
                    const isGenerating = generatingSection === section;
                    
                    return (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 md:gap-2 p-1.5 md:p-3 bg-background rounded-lg w-full max-w-full overflow-hidden">
                        <div className="flex items-start gap-1.5 md:gap-3 flex-1 min-w-0 overflow-hidden w-full max-w-full">
                          {isGenerated ? (
                            <Check className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4 md:h-5 md:w-5'} text-green-600 flex-shrink-0 mt-0.5`} />
                          ) : (
                            <span className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4 md:w-5 md:h-5'} border-2 border-muted-foreground rounded-full flex-shrink-0 mt-0.5`} />
                          )}
                          <span className={`${isMobile ? 'text-[11px] leading-tight' : 'text-sm md:text-base'} break-words overflow-wrap-anywhere flex-1 min-w-0 ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>{section}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          {isGenerating && isSectionStreaming && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={handleStopSectionStreaming} className="gap-1 text-xs md:text-sm">
                                <Square className="h-3 w-3" />
                                <span className="hidden sm:inline">وەستان</span>
                              </Button>
                            </div>
                          )}
                          
                          {!isGenerated && !isGenerating && (
                            <Button 
                              size="sm" 
                              onClick={() => handleGenerateSection(section)}
                              className="btn-academic-secondary text-xs md:text-sm"
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

                {/* Auto Generate Agent Button */}
                {!isCompleted && sections.length < outline.sections.length && (
                  <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
                    <div className="flex flex-col sm:flex-row items-start gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
                        <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 w-full overflow-hidden">
                        <h4 className={`font-semibold text-sm md:text-base mb-1 break-words overflow-wrap-anywhere ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>
                          ئاژانسی دروستکردنی خۆکار
                        </h4>
                        <p className={`text-xs md:text-sm text-muted-foreground mb-3 break-words overflow-wrap-anywhere ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>
                          ئاژانس هەموو بەشە ماوەکان بە شێوەیەکی خۆکار دروست دەکات بە 5 چرکە پشوو لە نێوان هەر بەشێک
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {!isAutoGenerating ? (
                            <Button
                              onClick={handleAutoGenerate}
                              disabled={generatingSection !== null}
                              className="btn-academic-primary gap-2 text-xs md:text-sm"
                              size="sm"
                            >
                              <Zap className="h-3 w-3 md:h-4 md:w-4" />
                              <span className={language === 'ku' ? 'sorani-text' : 'latin-text'}>
                                دەستکردنی ئاژانس
                              </span>
                            </Button>
                          ) : (
                            <Button
                              onClick={handleStopAutoGenerate}
                              variant="destructive"
                              className="gap-2 text-xs md:text-sm"
                              size="sm"
                            >
                              <Square className="h-3 w-3 md:h-4 md:w-4" />
                              <span className={language === 'ku' ? 'sorani-text' : 'latin-text'}>
                                وەستاندنی ئاژانس
                              </span>
                            </Button>
                          )}
                          {isAutoGenerating && (
                            <Badge variant="secondary" className="animate-pulse text-xs">
                              <Bot className="h-3 w-3 mr-1" />
                              کاردەکات...
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Generated Sections */}
        {sections.length > 0 && (
          <Card className="card-academic w-full max-w-full overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 md:p-6">
              <CardTitle className="flex items-center gap-1.5 md:gap-2 text-sm md:text-lg">
                <span className={`${isMobile ? 'w-5 h-5 text-[10px]' : 'w-8 h-8 text-sm'} bg-gradient-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0`}>5</span>
                <span className={`${isMobile ? 'text-xs' : 'text-base'} ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>ڕاپۆرتی دروستکراو</span>
                {!isCompleted && (
                  <Badge variant="secondary" className={`${isMobile ? 'text-[10px] px-1.5 py-0.5' : 'ml-2'}`}>
                    {sections.length} / {outline?.sections.length}
                  </Badge>
                )}
              </CardTitle>
              <ResponsiveButtonGroup orientation={isMobile ? "vertical" : "horizontal"}>
                <Button 
                  onClick={() => handleDownloadReport('text')} 
                  className={`btn-academic-primary ${isMobile ? 'text-xs px-3 py-2' : ''}`}
                  size={isMobile ? "sm" : "default"}
                  title={isCompleted ? 'دابەزاندنی تەواوی ڕاپۆرت' : 'دابەزاندنی بەشە تەواوکراوەکان'}
                >
                  <Download className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                  {isCompleted ? 'دابەزاندنی تەواو' : 'دابەزاندن'} (دەق)
                </Button>
                <Button 
                  onClick={() => handleDownloadReport('pdf')} 
                  className={`btn-academic-primary ${isMobile ? 'text-xs px-3 py-2' : ''}`}
                  size={isMobile ? "sm" : "default"}
                  title={isCompleted ? 'دابەزاندنی تەواوی ڕاپۆرت' : 'دابەزاندنی بەشە تەواوکراوەکان'}
                >
                  <Download className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                  {isCompleted ? 'دابەزاندنی تەواو' : 'دابەزاندن'} (PDF)
                </Button>
                {language === 'ku' && (
                  <Button 
                    onClick={() => handleDownloadReport('docx')} 
                    className={`btn-academic-secondary ${isMobile ? 'text-xs px-3 py-2' : ''}`}
                    size={isMobile ? "sm" : "default"}
                    title="دابەزاندن وەک فایلی Word"
                  >
                    <FileText className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                    {isCompleted ? 'دابەزاندنی تەواو' : 'دابەزاندن'} (DOCX)
                  </Button>
                )}
              </ResponsiveButtonGroup>
            </CardHeader>
            <CardContent className="overflow-hidden">
              {/* <FormattingControls 
                showFormatting={showFormatting}
                onToggleFormatting={setShowFormatting}
                className="mb-6"
              /> */}
              <div className="space-y-2 md:space-y-4 w-full max-w-full overflow-hidden">
                {sections.map((section, index) => (
                  <div key={index} className="border-l-2 md:border-l-4 border-primary/30 pl-2 md:pl-4 w-full max-w-full overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 md:gap-2 mb-2 md:mb-3 w-full max-w-full overflow-hidden">
                      <h3 className={`font-bold ${isMobile ? 'text-xs leading-tight' : 'text-base md:text-lg'} break-words overflow-wrap-anywhere flex-1 ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>{section.title}</h3>
                      <div className="flex gap-1 md:gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport('text', section)}
                          className={`${isMobile ? 'text-[10px] px-2 py-1' : 'text-xs'}`}
                        >
                          <Download className="h-3 w-3 mr-0.5" />
                          <span className="hidden sm:inline">دەق</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport('pdf', section)}
                          className={`${isMobile ? 'text-[10px] px-2 py-1' : 'text-xs'}`}
                        >
                          <Download className="h-3 w-3 mr-0.5" />
                          PDF
                        </Button>
                        {language === 'ku' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport('docx', section)}
                            className={`${isMobile ? 'text-[10px] px-2 py-1' : 'text-xs'}`}
                          >
                            <FileText className="h-3 w-3 mr-0.5" />
                            <span className="hidden sm:inline">DOCX</span>
                          </Button>
                        )}
                      </div>
                    </div>
                    {showFormatting ? (
                      <RichTextRenderer 
                        content={section.content}
                        showCopyButton={true}
                        className={`report-content overflow-wrap-anywhere ${isMobile ? 'text-[11px] leading-relaxed' : 'text-sm md:text-base'} ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}
                      />
                    ) : (
                      <div className={`report-content ${isMobile ? 'text-[11px]' : 'text-sm md:text-base'} leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>
                        {section.content}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Show currently generating section with streaming */}
                {generatingSection && (
                  <div className="border-l-2 md:border-l-4 border-primary/30 pl-2 md:pl-4 bg-secondary/20 rounded-r-lg p-2 md:p-4 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                      <h3 className={`font-bold ${isMobile ? 'text-xs leading-tight' : 'text-base md:text-lg'} break-words overflow-wrap-anywhere flex-1 ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>{generatingSection}</h3>
                      {isSectionStreaming && (
                        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                          <TypingIndicator size="sm" />
                          <span className={`${isMobile ? 'text-[10px]' : 'text-xs md:text-sm'} text-muted-foreground ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>دەنووسرێت...</span>
                        </div>
                      )}
                    </div>
                    {showFormatting ? (
                      <RichTextRenderer 
                        content={streamedSectionText}
                        isStreaming={isSectionStreaming}
                        showCopyButton={false}
                        className={`report-content overflow-wrap-anywhere ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}
                      />
                    ) : (
                      <div className={`report-content text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere relative ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>
                        {streamedSectionText}
                        {isSectionStreaming && (
                          <span className="inline-block w-0.5 h-4 md:h-5 bg-primary ml-1 animate-pulse" />
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
