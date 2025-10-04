
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileImage, Copy, Download, Save, RefreshCw, Eye, Trash2 } from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from 'jspdf';
import { loadKurdishFont, setKurdishFont, addRTLText } from '@/lib/kurdishFont';
import { ResponsiveLayout, ResponsiveButtonGroup } from '@/components/ui/responsive-layout';
import { useResponsive } from '@/hooks/useResponsive';

type OCRExtractorProps = object;

export function OCRExtractor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<'ku' | 'en'>('ku');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'هەڵە',
        description: 'تەنها فایلی وێنە قبوڵە',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'هەڵە',
        description: 'قەبارەی فایل زۆر گەورەیە. زیاتر لە ١٠ مێگابایت نابێت',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Clear previous results
    setExtractedText('');
    setProgress(0);
    setRetryCount(0);
  }, [toast]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Create a synthetic file input change event
      const syntheticEvent = {
        target: {
          files: [file]
        },
        currentTarget: {
          files: [file]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handleFileSelect(syntheticEvent);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const extractText = async () => {
    if (!selectedFile) {
      toast({
        title: 'هەڵە',
        description: 'تکایە وێنەیەک هەڵبژێرە',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setRetryCount(0);

    try {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });

      setProgress(30);

      // Extract text using Gemini API
      const result = await geminiService.extractTextFromImage(base64, targetLanguage);
      
      setProgress(80);
      
      // Show processing message for Kurdish text
      if (targetLanguage === 'ku') {
        toast({
          title: 'پرۆسێسی کوردی',
          description: 'دەقی کوردی بە پیتە تایبەتەکانەوە ڕاست دەکرێتەوە...',
        });
        setProgress(90);
      }
      
      setExtractedText(result);
      setProgress(100);

      toast({
        title: 'سەرکەوتوو',
        description: 'دەقەکە بە سەرکەوتووی دەرهێنرا'
      });

    } catch (error) {
      console.error('OCR Error:', error);
      let errorMessage = 'نەتوانرا دەقەکە دەربهێنرێت. تکایە دووبارە تاقی بکەوە';
      
      if (error instanceof Error) {
        if (error.message.includes('HTTP error! status: 400')) {
          errorMessage = 'هەڵەی API. تکایە دڵنیابە لە دروستی کلیلی API';
        } else if (error.message.includes('HTTP error! status: 403')) {
          errorMessage = 'ئێوە مۆڵەتتان نییە بۆ بەکارهێنانی ئەم خزمەتگوزارییە';
        } else if (error.message.includes('HTTP error! status: 429') || error.message.includes('API request failed: 429')) {
          errorMessage = 'زۆر داواکاری کراوە. تکایە چەند خولەکێک چاوەڕێبن و دووبارە هەوڵبدەنەوە';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'هەڵەی پەیوەندی. تکایە ئینتەرنێتەکەتان بپشکنن';
        }
      }
      
      toast({
        title: 'هەڵە',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const copyToClipboard = async () => {
    if (!extractedText.trim()) return;
    
    try {
      await navigator.clipboard.writeText(extractedText);
      toast({
        title: 'کۆپی کرا',
        description: 'دەقەکە کۆپی کرا'
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا کۆپی بکرێت',
        variant: 'destructive'
      });
    }
  };

  const saveAsText = () => {
    if (!extractedText.trim()) return;

    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'دابەزاندن',
      description: 'دەقەکە وەک فایلی تێکست دابەزێنرا'
    });
  };

  const saveAsPDF = async () => {
    if (!extractedText.trim()) return;

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Load Kurdish font if target language is Kurdish
      if (targetLanguage === 'ku') {
        await loadKurdishFont(pdf);
      }

      // Add title
      if (targetLanguage === 'ku') {
        setKurdishFont(pdf, 'normal');
        pdf.setFontSize(18);
        addRTLText(pdf, 'دەقی دەرهێنراو لە وێنە', 105, 30, { align: 'center' });
      } else {
        pdf.setFont('helvetica');
        pdf.setFontSize(18);
        pdf.text('Extracted Text from Image', 105, 30, { align: 'center' });
      }

      // Add line under title
      pdf.setLineWidth(0.5);
      pdf.line(20, 35, 190, 35);

      // Add content
      let yPosition = 50;
      const pageWidth = 170;
      const lineHeight = 8;
      const paragraphs = extractedText.split('\n\n');

      if (targetLanguage === 'ku') {
        setKurdishFont(pdf, 'normal');
        pdf.setFontSize(12);
      } else {
        pdf.setFont('helvetica');
        pdf.setFontSize(12);
      }

      for (const paragraph of paragraphs) {
        if (!paragraph.trim()) continue;
        
        const lines = pdf.splitTextToSize(paragraph.trim(), pageWidth);
        
        for (const line of lines) {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          
          if (targetLanguage === 'ku') {
            addRTLText(pdf, line, 190, yPosition, { align: 'right', charSpace: 0.3 });
          } else {
            // For English, add normal left-aligned text
            pdf.text(line, 20, yPosition);
          }
          yPosition += lineHeight;
        }
        
        yPosition += 5; // Paragraph spacing
      }

      pdf.save(`extracted-text-${Date.now()}.pdf`);
      
      toast({
        title: 'دابەزاندن',
        description: 'دەقەکە وەک PDF دابەزێنرا'
      });

    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا PDF دروست بکرێت',
        variant: 'destructive'
      });
    }
  };

  const clearAll = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setExtractedText('');
    setProgress(0);
    setRetryCount(0);
  };

  const testConnection = async () => {
    try {
      const result = await geminiService.testOCRConnection();
      toast({
        title: 'سەرکەوتوو',
        description: `پەیوەندی: ${result}`,
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'پەیوەندی سەرکەوتوو نەبوو',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-primary rounded-xl text-primary-foreground">
          <FileImage className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {targetLanguage === 'ku' ? 'دەرهێنانی دەق لە وێنە' : 'OCR Text Extractor'}
          </h1>
          <p className="text-muted-foreground">
            {targetLanguage === 'ku'
              ? 'دەقی کوردی و ئینگلیزی لە وێنەکان دەربهێنە'
              : 'Extract Kurdish and English text from images'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Image Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              {targetLanguage === 'ku' ? 'وێنە بارکردن' : 'Upload Image'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {'Text Language:'}
              </label>
              <Select value={targetLanguage} onValueChange={(value: 'ku' | 'en') => setTargetLanguage(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ku">کوردی (Kurdish)</SelectItem>
                  <SelectItem value="en">ئینگلیزی (English)</SelectItem>
                </SelectContent>
              </Select>
              {targetLanguage === 'ku' && (
                <p className="text-xs text-muted-foreground mt-1">
                  {'Supports Kurdish special letters: ێ وە ۆ ژ ڵ ڕ چ گ'}
                </p>
              )}
            </div>

            {/* File Upload Area */}
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary/50"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {targetLanguage === 'ku' ? 'وێنەیەک بارکە یان فڕێبدە' : 'Upload or drag an image'}
              </p>
              <p className="text-sm text-muted-foreground">
                {targetLanguage === 'ku'
                  ? 'JPG، PNG، WEBP پاڵپشتی دەکرێت (زیاتر لە ١٠MB)'
                  : 'Supports JPG، PNG، WEBP (max 10MB)'}
              </p>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-contain rounded-lg border"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={extractText}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        {targetLanguage === 'ku' ? 'دەرهێنان...' : 'Extracting...'}
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        {targetLanguage === 'ku' ? 'دەق دەربهێنە' : 'Extract Text'}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearAll}
                    disabled={isProcessing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={testConnection}
                    disabled={isProcessing}
                  >
                    Test API
                  </Button>
                </div>
              </div>
            )}

            {/* Progress */}
            {progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{targetLanguage === 'ku' ? 'پێشکەوتن:' : 'Progress:'}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extracted Text Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              {targetLanguage === 'ku' ? 'دەقی دەرهێنراو' : 'Extracted Text'}
              {extractedText && (
                <Badge variant="secondary">
                  {extractedText.split(/\s+/).length} {targetLanguage === 'ku' ? 'وشە' : 'words'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder={targetLanguage === 'ku'
                ? 'دەقی دەرهێنراو لێرە دەردەکەوێت...'
                : 'Extracted text will appear here...'}
              className="min-h-[200px] sm:min-h-[300px] text-sm sm:text-base resize-none"
              dir={targetLanguage === 'ku' ? 'rtl' : 'ltr'}
            />

            {extractedText && (
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  {targetLanguage === 'ku' ? 'کۆپی' : 'Copy'}
                </Button>
                <Button onClick={saveAsText} variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  {targetLanguage === 'ku' ? 'وەک تێکست' : 'As Text'}
                </Button>
                <Button onClick={saveAsPDF} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {targetLanguage === 'ku' ? 'وەک PDF' : 'As PDF'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
