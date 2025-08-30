import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Copy, RefreshCw, CheckCircle, Download, Save, History, X, Upload } from 'lucide-react';
import { geminiService, type GrammarCorrection } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from "jspdf";
import { notoNaskhArabic } from '@/lib/fonts';

interface GrammarCheckerProps {
  language: string;
}

export const GrammarChecker = ({ language }: GrammarCheckerProps) => {
  const [text, setText] = useState('');
  const [correction, setCorrection] = useState<GrammarCorrection | null>(null);
  const [correctionHistory, setCorrectionHistory] = useState<GrammarCorrection[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  
  // Load saved text and history from localStorage on component mount
  useEffect(() => {
    const savedText = localStorage.getItem('grammarCheckerText');
    if (savedText) {
      setText(savedText);
    }
    
    const savedHistory = localStorage.getItem('grammarCheckerHistory');
    if (savedHistory) {
      try {
        setCorrectionHistory(JSON.parse(savedHistory));
      } catch {
        // If parsing fails, clear the invalid history
        localStorage.removeItem('grammarCheckerHistory');
      }
    }
  }, []);
  
  // Save text to localStorage whenever it changes
  useEffect(() => {
    if (text) {
      localStorage.setItem('grammarCheckerText', text);
    } else {
      localStorage.removeItem('grammarCheckerText');
    }
  }, [text]);
  
  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (correctionHistory.length > 0) {
      localStorage.setItem('grammarCheckerHistory', JSON.stringify(correctionHistory));
    } else {
      localStorage.removeItem('grammarCheckerHistory');
    }
  }, [correctionHistory]);

  const handleCheck = async () => {
    if (!text.trim()) {
      toast({
        title: 'هەڵە',
        description: 'تکایە نووسینەکەت بنووسە',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await geminiService.checkGrammar(text, language);
      setCorrection(result);
      
      // Add to history (limit to 10 items)
      setCorrectionHistory(prev => {
        const newHistory = [result, ...prev.slice(0, 9)];
        return newHistory;
      });
      
      toast({
        title: 'پشکنین تەواو بوو',
        description: 'ڕێزمانەکە پشکنرا'
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا ڕێزمانەکە پشکنرێت',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (correction) {
      setText(correction.corrected);
      toast({
        title: 'گۆڕانکارییەکان جێبەجێ کران',
        description: 'نووسینەکە ڕاست کرایەوە'
      });
    }
  };

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: 'کۆپی کرا',
        description: 'نووسینەکە بۆ کلیپبۆرد کۆپی کرا'
      });
    } catch {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا کۆپی بکرێت',
        variant: 'destructive'
      });
    }
  };
  
  const handleDownload = async (text: string, format: 'text' | 'pdf' = 'text') => {
    try {
      if (format === 'pdf') {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;
        
        // Add Arabic/Kurdish font support
        doc.addFileToVFS('NotoNaskhArabic-Regular.ttf', notoNaskhArabic);
        doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
        doc.setFont('NotoNaskhArabic');

        // Add title
        doc.setFontSize(18);
        doc.setFont('NotoNaskhArabic');
        const titleLines = doc.splitTextToSize('نووسینی ڕاستکراوە', pageWidth - 20);
        doc.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += (titleLines.length * 10) + 10;
        
        // Add content
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(text || '', pageWidth - 20);
        
        // Add content page by page
        for (let i = 0; i < splitText.length; i++) {
          // Check if we need a new page
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
            // Reset font for new page
            doc.setFont('NotoNaskhArabic');
          }
          
          doc.text(splitText[i], 10, yPosition);
          yPosition += 7;
        }
        
        // Save the PDF
        doc.save('نووسینی ڕاستکراوە.pdf');
        toast({
          title: 'دابەزاندن',
          description: 'فایل PDF دابەزێنرا'
        });
        return;
      }
      
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'نووسینی ڕاستکراوە.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'دابەزاندن',
        description: 'فایل دابەزێنرا'
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

  const hasCorrections = correction && correction.original !== correction.corrected;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-primary rounded-xl text-primary-foreground">
          <CheckSquare className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground sorani-text">پشکنەری ڕێزمان</h1>
          <p className="text-muted-foreground latin-text">Grammar Checker</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <Card className="card-academic">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="sorani-text flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              نووسینی سەرەتایی
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleCopy(text)} disabled={!text} className="gap-1">
                <Copy className="h-4 w-4" />
                کۆپی
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDownload(text, 'pdf')} disabled={!text} className="gap-1">
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground sorani-text">
                وشەکان: {text.split(/\s+/).filter(word => word.length > 0).length}
              </p>
              <p className="text-sm text-muted-foreground sorani-text">
                نووسەکان: {text.length}
              </p>
            </div>
            
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="نووسینەکەت لێرە بنووسە بۆ پشکنینی ڕێزمان و ستایل..."
              className="min-h-[500px] sorani-text text-base leading-relaxed"
            />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground sorani-text">
                وشەکان: {text.split(/\s+/).filter(word => word.length > 0).length}
              </p>
              <p className="text-sm text-muted-foreground sorani-text">
                نووسەکان: {text.length}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleCheck}
                disabled={loading || !text.trim()}
                className="btn-academic-primary flex-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    پشکنین...
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    پشکنینی ڕێزمان
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setText('')}
                variant="outline"
                className="gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                دووبارەکردنەوە
              </Button>
              
              <Button
                onClick={() => {
                  const savedCorrectedText = localStorage.getItem('grammarCheckerCorrectedText');
                  if (savedCorrectedText) {
                    setText(savedCorrectedText);
                    toast({
                      title: 'بارکردن',
                      description: 'نووسینی ڕاستکراوە بار کرایەوە'
                    });
                  } else {
                    toast({
                      title: 'هیچ نووسینێک نەدۆزرایەوە',
                      description: 'هیچ نووسینێکی ڕاستکراوە پاشەکەوت نەکراوە',
                      variant: 'destructive'
                    });
                  }
                }}
                variant="outline"
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                بارکردن
              </Button>
              
              <Button
                onClick={() => setShowHistory(true)}
                variant="outline"
                className="gap-1"
              >
                <History className="h-4 w-4" />
                مێژوو
              </Button>
              
              {/* History Modal */}
              {showHistory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b">
                      <h3 className="text-lg font-semibold sorani-text">مێژووی گۆڕانکارییەکان</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-4">
                      {correctionHistory.length > 0 ? (
                        <div className="space-y-4">
                          {correctionHistory.map((item, index) => (
                            <div key={index} className="border border-border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-sm sorani-text">
                                  گۆڕانکاریی #{correctionHistory.length - index}
                                </h4>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setText(item.corrected);
                                    setShowHistory(false);
                                    toast({
                                      title: 'بارکردن',
                                      description: 'نووسینی ڕاستکراوە بار کرایەوە'
                                    });
                                  }}
                                  className="gap-1"
                                >
                                  <Download className="h-4 w-4" />
                                  بارکردن
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-xs font-medium text-muted-foreground mb-1 sorani-text">سەرەتایی:</h5>
                                  <p className="text-sm sorani-text line-clamp-3" style={{ whiteSpace: 'pre-wrap' }}>
                                    {item.original}
                                  </p>
                                </div>
                                <div>
                                  <h5 className="text-xs font-medium text-muted-foreground mb-1 sorani-text">ڕاستکراوە:</h5>
                                  <p className="text-sm sorani-text line-clamp-3" style={{ whiteSpace: 'pre-wrap' }}>
                                    {item.corrected}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="sorani-text">هیچ مێژووێک نییە</p>
                          <p className="text-sm mt-1 sorani-text">هیچ گۆڕانکارییەک پاشەکەوت نەکراوە</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t flex justify-between">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            const doc = new jsPDF();
                            const pageWidth = doc.internal.pageSize.getWidth();
                            let yPosition = 20;
                            
                            // Add Arabic/Kurdish font support
                            doc.addFileToVFS('NotoNaskhArabic-Regular.ttf', notoNaskhArabic);
                            doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
                            doc.setFont('NotoNaskhArabic');

                            // Add title
                            doc.setFontSize(18);
                            doc.setFont('NotoNaskhArabic');
                            doc.text('مێژووی گۆڕانکارییەکان', pageWidth / 2, yPosition, { align: 'center' });
                            yPosition += 20;
                            
                            // Add history items
                            correctionHistory.forEach((item, index) => {
                              // Check if we need a new page
                              if (yPosition > doc.internal.pageSize.getHeight() - 40) {
                                doc.addPage();
                                yPosition = 20;
                                // Reset font for new page
                                doc.setFont('NotoNaskhArabic');
                              }
                              
                              // Add item title
                              doc.setFontSize(14);
                              doc.setFont('NotoNaskhArabic');
                              doc.text(`گۆڕانکاریی #${correctionHistory.length - index}`, 10, yPosition);
                              yPosition += 10;
                              
                              // Add original text
                              doc.setFontSize(12);
                              doc.text('سەرەتایی:', 10, yPosition);
                              yPosition += 7;
                              
                              const originalLines = doc.splitTextToSize(item.original, pageWidth - 20);
                              for (let i = 0; i < originalLines.length; i++) {
                                if (yPosition > doc.internal.pageSize.getHeight() - 20) {
                                  doc.addPage();
                                  yPosition = 20;
                                  // Reset font for new page
                                  doc.setFont('NotoNaskhArabic');
                                }
                                doc.text(originalLines[i], 15, yPosition);
                                yPosition += 7;
                              }
                              
                              yPosition += 5;
                              
                              // Add corrected text
                              doc.setFont('NotoNaskhArabic');
                              doc.text('ڕاستکراوە:', 10, yPosition);
                              yPosition += 7;
                              
                              doc.setFont('NotoNaskhArabic');
                              const correctedLines = doc.splitTextToSize(item.corrected, pageWidth - 20);
                              for (let i = 0; i < correctedLines.length; i++) {
                                if (yPosition > doc.internal.pageSize.getHeight() - 20) {
                                  doc.addPage();
                                  yPosition = 20;
                                  // Reset font for new page
                                  doc.setFont('NotoNaskhArabic');
                                }
                                doc.text(correctedLines[i], 15, yPosition);
                                yPosition += 7;
                              }
                              
                              yPosition += 15;
                            });
                            
                            // Save the PDF
                            doc.save('مێژووی گۆڕانکارییەکان.pdf');
                          }}
                          className="gap-1"
                        >
                          <Download className="h-4 w-4" />
                          PDF
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.json';
                            input.onchange = (event) => {
                              const file = (event.target as HTMLInputElement).files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  try {
                                    const content = e.target?.result as string;
                                    const parsedHistory = JSON.parse(content);
                                    if (Array.isArray(parsedHistory)) {
                                      setCorrectionHistory(parsedHistory);
                                      localStorage.setItem('grammarCheckerHistory', JSON.stringify(parsedHistory));
                                      toast({
                                        title: 'هاوردەکردن',
                                        description: 'مێژووی گۆڕانکارییەکان هاوردە کرایەوە'
                                      });
                                    } else {
                                      throw new Error('Invalid file format');
                                    }
                                  } catch {
                                    toast({
                                      title: 'هەڵە',
                                      description: 'نەتوانرا فایلەکە هاوردە بکرێت',
                                      variant: 'destructive'
                                    });
                                  }
                                };
                                reader.readAsText(file);
                              }
                            };
                            input.click();
                          }}
                          className="gap-1"
                        >
                          <Upload className="h-4 w-4" />
                          هاوردەکردن
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(correctionHistory, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'مێژووی گۆڕانکارییەکان.json';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            
                            toast({
                              title: 'هاوردەکردن',
                              description: 'مێژووی گۆڕانکارییەکان هاوردە کرایەوە'
                            });
                          }}
                          className="gap-1"
                        >
                          <Download className="h-4 w-4" />
                          هاوردەکردن
                        </Button>
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCorrectionHistory([]);
                          localStorage.removeItem('grammarCheckerHistory');
                          toast({
                            title: 'مێژوو سڕایەوە',
                            description: 'هەموو مێژووی گۆڕانکارییەکان سڕدرایەوە'
                          });
                        }}
                      >
                        سڕینەوەی هەموو مێژوو
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="card-academic">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="sorani-text flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              نووسینی ڕاستکراوە
            </CardTitle>
            {correction && (
              <div className="flex gap-2">
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
                <Button size="sm" variant="outline" onClick={() => handleCopy(correction.corrected)} className="gap-1">
                  <Copy className="h-4 w-4" />
                  کۆپی
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload(correction.corrected, 'pdf')} className="gap-1">
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                {hasCorrections && (
                  <Button size="sm" onClick={handleAccept} className="btn-academic-primary gap-1">
                    <CheckCircle className="h-4 w-4" />
                    جێبەجێکردن
                  </Button>
                )}
              </div>
            )}
            
            {correction && (
              <div className="border-t border-border pt-4 mt-4">
                <h3 className="font-semibold text-sm text-foreground mb-2 sorani-text">ئامارەکانی نووسینی ڕاستکراوە:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground sorani-text">وشەکان</p>
                    <p className="text-lg font-semibold">{correction.corrected.split(/\s+/).filter(word => word.length > 0).length}</p>
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground sorani-text">نووسەکان</p>
                    <p className="text-lg font-semibold">{correction.corrected.length}</p>
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground sorani-text">گۆڕانکارییەکان</p>
                    <p className="text-lg font-semibold">{hasCorrections ? correction.suggestions.length : 0}</p>
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground sorani-text">ڕێژەی گۆڕانکاری</p>
                    <p className="text-lg font-semibold">
                      {correction.original.length > 0
                        ? Math.round((correction.corrected.length / correction.original.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {correction ? (
              <div className="space-y-6">
                {hasCorrections ? (
                  <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                    گۆڕانکاریەکان هەن
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    هیچ گۆڕانکارییەک پێویست نییە
                  </Badge>
                )}

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-sm text-foreground sorani-text">نووسینی ڕاستکراوە:</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          localStorage.setItem('grammarCheckerCorrectedText', correction.corrected);
                          toast({
                            title: 'پاشەکەوتکردن',
                            description: 'نووسینی ڕاستکراوە پاشەکەوت کرایەوە'
                          });
                        }}
                        className="gap-1"
                      >
                        <Save className="h-4 w-4" />
                        پاشەکەوتکردن
                      </Button>
                    </div>
                    {previewMode === 'edit' ? (
                      <Textarea
                        value={correction.corrected}
                        readOnly
                        className="min-h-[300px] sorani-text text-base leading-relaxed bg-secondary/50"
                      />
                    ) : (
                      <div
                        className="min-h-[300px] sorani-text text-base leading-relaxed p-4 border border-border rounded-lg bg-background overflow-y-auto"
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {correction.corrected}
                      </div>
                    )}
                  </div>

                  {hasCorrections && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-sm text-foreground sorani-text">پێشبینینی گۆڕانکارییەکان:</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const doc = new jsPDF();
                            const pageWidth = doc.internal.pageSize.getWidth();
                            let yPosition = 20;
                            
                            // Add Arabic/Kurdish font support
                            doc.addFileToVFS('NotoNaskhArabic-Regular.ttf', notoNaskhArabic);
                            doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
                            doc.setFont('NotoNaskhArabic');

                            // Add title
                            doc.setFontSize(18);
                            doc.setFont('NotoNaskhArabic');
                            doc.text('پێشبینینی گۆڕانکارییەکان', pageWidth / 2, yPosition, { align: 'center' });
                            yPosition += 20;
                            
                            // Add original text section
                            doc.setFontSize(14);
                            doc.setFont('NotoNaskhArabic');
                            doc.text('نووسینی سەرەتایی:', 10, yPosition);
                            yPosition += 10;
                            
                            doc.setFontSize(12);
                            const originalLines = doc.splitTextToSize(correction.original, pageWidth - 20);
                            for (let i = 0; i < originalLines.length; i++) {
                              if (yPosition > doc.internal.pageSize.getHeight() - 20) {
                                doc.addPage();
                                yPosition = 20;
                                // Reset font for new page
                                doc.setFont('NotoNaskhArabic');
                              }
                              doc.text(originalLines[i], 10, yPosition);
                              yPosition += 7;
                            }
                            
                            yPosition += 10;
                            
                            // Add corrected text section
                            doc.setFontSize(14);
                            doc.setFont('NotoNaskhArabic');
                            doc.text('نووسینی ڕاستکراوە:', 10, yPosition);
                            yPosition += 10;
                            
                            doc.setFontSize(12);
                            const correctedLines = doc.splitTextToSize(correction.corrected, pageWidth - 20);
                            for (let i = 0; i < correctedLines.length; i++) {
                              if (yPosition > doc.internal.pageSize.getHeight() - 20) {
                                doc.addPage();
                                yPosition = 20;
                                // Reset font for new page
                                doc.setFont('NotoNaskhArabic');
                              }
                              doc.text(correctedLines[i], 10, yPosition);
                              yPosition += 7;
                            }
                            
                            // Save the PDF
                            doc.save('پێشبینینی گۆڕانکارییەکان.pdf');
                          }}
                          className="gap-1"
                        >
                          <Download className="h-4 w-4" />
                          PDF
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-border rounded-lg p-4 bg-red-50/50 dark:bg-red-950/20">
                          <h4 className="font-semibold text-sm text-foreground mb-2 sorani-text">نووسینی سەرەتایی:</h4>
                          <div
                            className="sorani-text text-base leading-relaxed max-h-[200px] overflow-y-auto"
                            style={{ whiteSpace: 'pre-wrap' }}
                          >
                            {correction.original}
                          </div>
                        </div>
                        <div className="border border-border rounded-lg p-4 bg-green-50/50 dark:bg-green-950/20">
                          <h4 className="font-semibold text-sm text-foreground mb-2 sorani-text">نووسینی ڕاستکراوە:</h4>
                          <div
                            className="sorani-text text-base leading-relaxed max-h-[200px] overflow-y-auto"
                            style={{ whiteSpace: 'pre-wrap' }}
                          >
                            {correction.corrected}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {correction.suggestions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-foreground mb-2 sorani-text">پێشنیارەکان:</h3>
                      <div className="space-y-2">
                        {correction.suggestions.map((suggestion, index) => (
                          <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                            <p className="text-sm sorani-text">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
                <div className="text-center">
                  <CheckSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2 sorani-text">ئەنجامی پشکنین لێرە دەردەکەوێت</h3>
                  <p className="sorani-text">نووسینەکەت بنووسە و کلیک لە "پشکنینی ڕێزمان" بکە</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
