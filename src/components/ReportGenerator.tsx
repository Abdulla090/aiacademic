import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, ChevronRight, Check, Download, RefreshCw } from 'lucide-react';
import { geminiService, type ReportOutline, type ReportSection } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from "jspdf";
import { notoNaskhArabic } from '@/lib/fonts';

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
    try {
      const content = await geminiService.generateReportSection(outline, sectionName, sections, language);
      const newSection: ReportSection = {
        title: sectionName,
        content
      };
      setSections(prev => [...prev, newSection]);
      toast({
        title: 'بەش دروست کرا',
        description: `بەشی "${sectionName}" ئامادە کرا`
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا بەشەکە دروست بکرێت',
        variant: 'destructive'
      });
    } finally {
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
        const titleLines = pdf.splitTextToSize(outline.title || 'Report', pageWidth - 40);
        pdf.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += (titleLines.length * 25) + 20;
        
        // Add sections
        pdf.setFontSize(12);
        for (const section of sections) {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 40;
            // Reset font for new page
            if (language === 'ku' || language === 'ar') {
              pdf.setFont('NotoNaskhArabic');
            }
          }
          
          // Add section title
          pdf.setFontSize(16);
          const sectionTitleLines = pdf.splitTextToSize(section.title, pageWidth - 40);
          pdf.text(sectionTitleLines, language === 'ku' || language === 'ar' ? pageWidth - 20 : 20, yPosition, { 
            align: language === 'ku' || language === 'ar' ? 'right' : 'left' 
          });
          yPosition += (sectionTitleLines.length * 20) + 15;
          
          // Reset font size for content
          pdf.setFontSize(12);
          
          // Add section content
          const contentLines = pdf.splitTextToSize(section.content || '', pageWidth - 40);
          for (let i = 0; i < contentLines.length; i++) {
            if (yPosition > pageHeight - 40) {
              pdf.addPage();
              yPosition = 40;
              // Reset font for new page
              if (language === 'ku' || language === 'ar') {
                pdf.setFont('NotoNaskhArabic');
                pdf.setFontSize(12);
              }
            }
            
            // Handle RTL alignment for Kurdish/Arabic
            if (language === 'ku' || language === 'ar') {
              pdf.text(contentLines[i], pageWidth - 20, yPosition, { align: 'right' });
            } else {
              pdf.text(contentLines[i], 20, yPosition);
            }
            yPosition += 15;
          }
          
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
                        
                        {!isGenerated && (
                          <Button 
                            size="sm" 
                            onClick={() => handleGenerateSection(section)}
                            disabled={isGenerating}
                            className="btn-academic-secondary"
                          >
                            {isGenerating ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                                دروستکردن...
                              </>
                            ) : (
                              'دروستکردن'
                            )}
                          </Button>
                        )}
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
              <div className="space-y-6">
                {sections.map((section, index) => (
                  <div key={index} className="border-l-4 border-primary/30 pl-4">
                    <h3 className="font-bold text-lg mb-3 sorani-text">{section.title}</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-base leading-relaxed sorani-text whitespace-pre-wrap">
                        {section.content}
                      </p>
                    </div>
                  </div>
                ))}
                
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
