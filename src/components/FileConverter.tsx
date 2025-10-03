import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import mammoth from 'mammoth';
import { htmlToText } from 'html-to-text';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as pdfjs from 'pdfjs-dist';
import { LanguageSelection } from './LanguageSelection';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdfjs-dist/${pdfjs.version}/pdf.worker.min.js`;
}

export const FileConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [responseLanguage, setResponseLanguage] = useState('en');
  const [outputFormat, setOutputFormat] = useState('docx');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: 'هەڵە',
        description: 'هیچ فایلێک هەڵنەبژێردراوە',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      let textContent = '';

      if (file.type === 'application/pdf') {
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map(s => (s as { str: string }).str).join(' ');
        }
      } else if (file.name.endsWith('.docx')) {
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        textContent = value;
      } else {
        textContent = await file.text();
      }

      if (outputFormat === 'docx') {
        const doc = new Document({
          sections: [{
            children: textContent.split('\n').map(line => new Paragraph({
              children: [new TextRun({ text: line, font: { name: 'Noto Naskh Arabic' } })],
            })),
          }],
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${file.name.split('.')[0]}.docx`);
      } else if (outputFormat === 'pdf') {
        const pdf = new jsPDF();
        const font = await fetch('/NotoNaskhArabic-Regular.ttf').then(res => res.arrayBuffer());
        const base64Font = btoa(new Uint8Array(font).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        pdf.addFileToVFS('NotoNaskhArabic-Regular.ttf', base64Font);
        pdf.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
        pdf.setFont('NotoNaskhArabic');
        const lines = pdf.splitTextToSize(textContent, 180);
        pdf.text(lines, 10, 10, { align: 'right' });
        pdf.save(`${file.name.split('.')[0]}.pdf`);
      } else {
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${file.name.split('.')[0]}.${outputFormat}`);
      }

      toast({
        title: 'سەرکەوتوو بوو',
        description: `فایلەکە بە سەرکەوتوویی گۆڕدرا بۆ ${outputFormat}`,
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'هەڵەیەک ڕوویدا لە کاتی گۆڕینی فایلەکە',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="card-academic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="sorani-text">گۆڕینی فۆرماتی فایل</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              {file ? file.name : 'فایلەکەت لێرە ڕابکێشە یان کلیک بکە بۆ هەڵبژاردن'}
            </p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              هەڵبژاردنی فایل
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
           <LanguageSelection
             selectedLanguage={responseLanguage}
             onLanguageChange={setResponseLanguage}
           />
          <div className="flex items-center gap-4">
            <Select onValueChange={setOutputFormat} defaultValue={outputFormat}>
              <SelectTrigger>
                <SelectValue placeholder="گۆڕین بۆ..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="txt">TXT</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="rtf">RTF</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleConvert} disabled={loading} className="btn-academic-primary w-full">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'گۆڕین'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};