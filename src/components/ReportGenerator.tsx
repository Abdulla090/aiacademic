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

  const handleGenerateTitles = async () => {
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
        title: 'دروستکردنی PDF',
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
          // Use html2pdf for Kurdish to properly handle RTL and character connections
          const htmlContent = `
            <!DOCTYPE html>
            <html lang="ku" dir="rtl">
            <head>
              <meta charset="UTF-8">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap');
                
                * {
                  font-family: 'Noto Naskh Arabic', 'Arial Unicode MS', Arial, sans-serif;
                }
                
                body {
                  font-size: 14px;
                  line-height: 1.8;
                  color: #333;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                  direction: rtl;
                  text-align: right;
                }
                
                h1 {
                  font-size: 24px;
                  font-weight: bold;
                  text-align: center;
                  margin-bottom: 30px;
                  color: #2c3e50;
                  border-bottom: 3px solid #3498db;
                  padding-bottom: 15px;
                }
                
                h2 {
                  font-size: 20px;
                  font-weight: bold;
                  margin-top: 30px;
                  margin-bottom: 15px;
                  color: #34495e;
                  border-right: 4px solid #3498db;
                  padding-right: 10px;
                }
                
                h3 {
                  font-size: 18px;
                  font-weight: bold;
                  margin-top: 25px;
                  margin-bottom: 12px;
                  color: #34495e;
                }
                
                h4, h5, h6 {
                  font-size: 16px;
                  font-weight: bold;
                  margin-top: 20px;
                  margin-bottom: 10px;
                  color: #34495e;
                }
                
                p {
                  margin-bottom: 15px;
                  text-align: justify;
                  line-height: 2;
                }
                
                ul, ol {
                  margin-bottom: 20px;
                  padding-right: 30px;
                  line-height: 2;
                }
                
                li {
                  margin-bottom: 10px;
                }
                
                blockquote {
                  border-right: 4px solid #3498db;
                  padding-right: 20px;
                  margin: 20px 0;
                  background-color: #f8f9fa;
                  padding: 15px 20px;
                  font-style: italic;
                }
                
                code {
                  background-color: #f4f4f4;
                  padding: 2px 6px;
                  border-radius: 3px;
                  font-family: 'Courier New', monospace;
                  font-size: 13px;
                }
                
                pre {
                  background-color: #f4f4f4;
                  padding: 15px;
                  border-radius: 5px;
                  overflow-x: auto;
                  margin: 20px 0;
                  direction: ltr;
                  text-align: left;
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
                  height: 2px;
                  background-color: #ddd;
                  margin: 25px 0;
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
                  margin-bottom: 40px;
                  page-break-inside: avoid;
                }
                
                .section-title {
                  background-color: #f8f9fa;
                  padding: 10px 15px;
                  border-radius: 5px;
                  margin-bottom: 15px;
                }
              </style>
            </head>
            <body>
              <div class="header-info">
                <strong>AI Academic Hub - Kurdish Report Generator</strong><br>
                ${new Date().toLocaleDateString('ku-Arab-IQ')}
              </div>
              
              <h1>${titleToUse}</h1>
              
              ${sectionsToExport.map(section => `
                <div class="section">
                  <div class="section-title">
                    <h2>${section.title}</h2>
                  </div>
                  <div class="content">
                    ${convertMarkdownToHtml(section.content || '')}
                  </div>
                </div>
              `).join('')}
            </body>
            </html>
          `;

          // Configure html2pdf options for better Kurdish/Arabic support
          const options = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `${titleToUse.substring(0, 50)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
              scale: 2,
              useCORS: true,
              letterRendering: true,
              allowTaint: true,
              scrollY: 0,
              scrollX: 0
            },
            jsPDF: { 
              unit: 'in', 
              format: 'a4', 
              orientation: 'portrait'
            }
          };

          // Generate PDF using html2pdf
          const html2pdf = (await import('html2pdf.js')).default;
          await html2pdf().set(options).from(htmlContent).save();
        }
        
        toast({
          title: 'سەرکەوتوو',
          description: singleSection ? `بەشی "${singleSection.title}" وەک PDF دابەزێنرا` : 'ڕاپۆرتی تەواو وەک PDF دابەزێنرا',
        });
      } catch (error) {
        console.error('PDF Generation Error:', error);
        toast({
          title: 'هەڵە',
          description: 'نەتوانرا PDF دروست بکرێت: ' + (error as Error).message,
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
              <div className="space-y-2">
                {generatedTitles.map((title, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectTitle(title)}
                    disabled={currentStep > 1}
                    className={`w-full p-4 text-right rounded-lg border-2 transition-all ${
                      selectedTitle === title
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 bg-background'
                    } ${currentStep > 1 ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedTitle === title ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {selectedTitle === title ? <Check className="h-4 w-4" /> : index + 1}
                      </span>
                      <span className={`flex-1 ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>{title}</span>
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
          <Card className="card-academic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={`${isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'} ${currentStep > 2 ? 'bg-green-600' : 'bg-gradient-primary'} text-primary-foreground rounded-full flex items-center justify-center font-bold`}>
                  {currentStep > 2 ? <Check className="h-4 w-4" /> : '3'}
                </span>
                <span className={language === 'ku' ? 'sorani-text' : 'latin-text'}>دەستکاریکردنی پلان</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h3 className={`font-bold text-lg mb-4 ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>{outline.title}</h3>
                
                {currentStep === 2 ? (
                  <>
                    <p className={`text-sm text-muted-foreground mb-4 ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>
                      دەتوانیت پلانەکە دەستکاری بکەیت، بەش زیاد بکەیت یان بسڕیتەوە
                    </p>
                    <div className="space-y-2">
                      {editableOutline.map((section, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                          <Input
                            value={section}
                            onChange={(e) => handleUpdateOutlineSection(index, e.target.value)}
                            className={`flex-1 ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}
                            placeholder={language === 'ku' ? 'ناونیشانی بەش...' : 'Section title...'}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveOutlineSection(index)}
                            disabled={editableOutline.length <= 1}
                          >
                            <X className="h-4 w-4" />
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
                    <div className="space-y-2 mb-4">
                      {outline.sections.map((section, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-background rounded">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className={language === 'ku' ? 'sorani-text' : 'latin-text'}>{section}</span>
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
          <Card className="card-academic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span className={language === 'ku' ? 'sorani-text' : 'latin-text'}>دروستکردنی ناوەڕۆک</span>
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

                {/* Auto Generate Agent Button */}
                {!isCompleted && sections.length < outline.sections.length && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-1 ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>
                          ئاژانسی دروستکردنی خۆکار
                        </h4>
                        <p className={`text-sm text-muted-foreground mb-3 ${language === 'ku' ? 'sorani-text' : 'latin-text'}`}>
                          ئاژانس هەموو بەشە ماوەکان بە شێوەیەکی خۆکار دروست دەکات بە 5 چرکە پشوو لە نێوان هەر بەشێک
                        </p>
                        <div className="flex gap-2">
                          {!isAutoGenerating ? (
                            <Button
                              onClick={handleAutoGenerate}
                              disabled={generatingSection !== null}
                              className="btn-academic-primary gap-2"
                              size="sm"
                            >
                              <Zap className="h-4 w-4" />
                              <span className={language === 'ku' ? 'sorani-text' : 'latin-text'}>
                                دەستکردنی ئاژانس
                              </span>
                            </Button>
                          ) : (
                            <Button
                              onClick={handleStopAutoGenerate}
                              variant="destructive"
                              className="gap-2"
                              size="sm"
                            >
                              <Square className="h-4 w-4" />
                              <span className={language === 'ku' ? 'sorani-text' : 'latin-text'}>
                                وەستاندنی ئاژانس
                              </span>
                            </Button>
                          )}
                          {isAutoGenerating && (
                            <Badge variant="secondary" className="animate-pulse">
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
          <Card className="card-academic">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <span className={language === 'ku' ? 'sorani-text' : 'latin-text'}>ڕاپۆرتی دروستکراو</span>
                {!isCompleted && (
                  <Badge variant="secondary" className="ml-2">
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
              </ResponsiveButtonGroup>
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
