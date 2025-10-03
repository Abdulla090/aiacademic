import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { KurdishPDFService } from '@/services/kurdishPdfService';
import { BackButton } from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';

const KurdishFontTestPage: React.FC = () => {
  const [title, setTitle] = useState('تاقیکردنەوەی فۆنتی کوردی نوێ');
  const [content, setContent] = useState(`تەکنەلۆژیا بڕۆمەکی مستمر ڕۆڵەیەکی گرنگی دەگێڕکات لە گۆڕیپینی پانی ئەوە. ئەم نەمڵکەنە

ئەم تێکستە بە فۆنتی کوردی نوێ نووسراوە.

پیتە تایبەتەکانی کوردی:
ڕ - ر كوردی
ۆ - واوی كوردی  
ڤ - ڤاڤ
ڵ - لامی كوردی
ێ - ێ
ە - ە
چ - چ
پ - پ
گ - گ
ژ - ژ

دەقی نموونە:
"تەکنەلۆژیای زیرەکی دەستکرد ڕۆڵێکی گرنگی دەگێڕێت لە گۆڕینی ژیانی ئێمە. ئەم تەکنەلۆژیایە دەتوانێت یارمەتیمان بدات لە چارەسەرکردنی کێشەکانی جۆراوجۆر."

ئەم تاقیکردنەوەیە پیشان دەدات کە فۆنتی نوێ چۆن کار دەکات.`);
  const [testing, setTesting] = useState(false);
  const [fontTest, setFontTest] = useState('');
  const navigate = useNavigate();
  const testAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const testTexts = {
    basic: 'سڵاو، ئەمە تاقیکردنەوەی فۆنتی کوردی نوێیە',
    problemText: 'تەکنەلۆژیا بڕۆمەکی مستمر ڕۆڵەیەکی گرنگی دەگێڕکات لە گۆڕیپینی پانی ئەوە. ئەم نەمڵکەنە',
    advanced: 'ڕۆژ، ڕۆژهەڵات، پێشمەرگە، هەولێر، سلێمانی، دهۆک',
    mixed: 'کوردستان Kurdistan ڕاپۆرت Report تەکنەلۆژی Technology',
    numbers: '١٢٣٤٥٦٧٨٩٠ - ۱۲۳۴۵۶۷۸۹۰',
    special: 'ڕ، ۆ، ڤ، ڵ، ێ، ە، چ، پ، گ، ژ',
    connecting: 'گرنگی، دەگێڕکات، تەکنەلۆژیا، مستمر'
  };

  const testKurdishPDF = async () => {
    setTesting(true);
    try {
      toast({
        title: 'دەستکردن',
        description: 'دروستکردنی PDF بە فۆنتی کوردی نوێ...',
      });

      const pdfService = new KurdishPDFService({
        orientation: 'portrait',
        format: 'a4'
      });

      // Test font loading
      const fontLoaded = await pdfService.loadKurdishFont();
      
      if (!fontLoaded) {
        throw new Error('نەتوانرا فۆنتی کوردی بارکرێت');
      }

      // Create sections from content
      const sections = content.split('\n\n').map((section, index) => ({
        title: index === 0 ? '' : `بەشی ${index}`,
        content: section.trim()
      }));

      // Add test sections
      sections.push({
        title: 'تاقیکردنەوەی پیتەکان',
        content: Object.entries(testTexts).map(([key, text]) => 
          `${key}: ${text}`
        ).join('\n\n')
      });

      await pdfService.createKurdishReport(title, sections, 'ku', {
        showHeader: true,
        headerText: {
          kurdish: `تاقیکردنەوەی فۆنتی نوێ - ${new Date().toLocaleDateString('ku-Arab-IQ')}`
        }
      });

      pdfService.save('kurdish-new-font-test.pdf');

      toast({
        title: 'سەرکەوتوو',
        description: 'PDF بە سەرکەوتوویی دروست کرا بە فۆنتی کوردی نوێ!',
      });

    } catch (error: any) {
      console.error('Kurdish PDF Error:', error);
      toast({
        title: 'هەڵە',
        description: error.message || 'هەڵەیەک ڕوویدا لە دروستکردنی PDF',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const testFontDisplay = () => {
    if (testAreaRef.current && fontTest) {
      // Apply the font to test area (this won't work unless the font is loaded in CSS)
      testAreaRef.current.style.fontFamily = 'new-ku-font, Arial, sans-serif';
      testAreaRef.current.style.fontSize = '18px';
      testAreaRef.current.style.lineHeight = '1.6';
      testAreaRef.current.style.direction = 'rtl';
      testAreaRef.current.style.textAlign = 'right';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle bg-purple-grid">
      <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <BackButton />
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            تاقیکردنەوەی فۆنتی کوردی نوێ
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Kurdish New Font Test Page - new-ku-font.ttf
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium mb-2">ناونیشان:</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ناونیشانی پەڕگەکە بنووسە..."
              className="text-right"
              dir="rtl"
            />
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-sm font-medium mb-2">ناوەڕۆک:</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ناوەڕۆکی PDF ەکە بنووسە..."
              className="min-h-[200px] text-right"
              dir="rtl"
            />
          </div>

          {/* Font Display Test */}
          <div>
            <label className="block text-sm font-medium mb-2">تاقیکردنەوەی پیشاندان:</label>
            <Input
              value={fontTest}
              onChange={(e) => setFontTest(e.target.value)}
              onKeyUp={testFontDisplay}
              placeholder="تێکستێک بنووسە بۆ تاقیکردنەوەی فۆنت..."
              className="text-right mb-2"
              dir="rtl"
            />
            <div 
              ref={testAreaRef}
              className="p-4 border rounded-md bg-gray-50 min-h-[60px] text-right"
              dir="rtl"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              {fontTest || 'ئێرە تێکستەکەت پیشان دەدرێت...'}
            </div>
          </div>

          {/* Test Samples */}
          <div>
            <label className="block text-sm font-medium mb-2">نموونەی تێکستەکان:</label>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(testTexts).map(([key, text]) => (
                <div key={key} className="p-3 border rounded bg-blue-50">
                  <div className="font-medium text-sm text-blue-800 mb-1">
                    {key}:
                  </div>
                  <div className="text-right" dir="rtl">
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Button */}
          <div className="text-center">
            <Button 
              onClick={testKurdishPDF}
              disabled={testing}
              size="lg"
              className="w-full md:w-auto"
            >
              {testing ? 'تاقیکردنەوە...' : 'دروستکردنی PDF بە فۆنتی نوێ'}
            </Button>
          </div>

          {/* Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="font-medium text-yellow-800 mb-2">زانیاری:</h3>
            <ul className="text-sm text-yellow-700 space-y-1" dir="rtl">
              <li>• ئەم پەڕەیە فۆنتی Amiri/NotoSansArabic تاقی دەکاتەوە</li>
              <li>• فۆنتەکە لە فۆڵدەری /kurdish-font/ دا هەیە</li>
              <li>• PDF ەکە بە ڕاستەوە ئاڕاستە دەکرێت</li>
              <li>• هەموو پیتە تایبەتەکانی کوردی پشتگیری دەکرێت</li>
              <li>• Arabic Reshaper بۆ پەیوەندی پیتەکان بەکاردێت</li>
            </ul>
          </div>

        </CardContent>
      </Card>
    </div>
    </div>
  );
};

export default KurdishFontTestPage;