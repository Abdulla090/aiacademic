import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import imageCompression from 'browser-image-compression';
import { LanguageSelection } from './LanguageSelection';

export const Compressor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [responseLanguage, setResponseLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setCompressedFile(null);
    }
  };

  const handleCompress = async () => {
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
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressed = await imageCompression(file, options);
      setCompressedFile(compressed);
      toast({
        title: 'سەرکەوتوو بوو',
        description: `فایلەکە بە سەرکەوتوویی پەستێنرا`,
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'هەڵەیەک ڕوویدا لە کاتی پەستانەوەی فایلەکە',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (compressedFile) {
      const url = URL.createObjectURL(compressedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = compressedFile.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="card-academic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="sorani-text">پەستانەوەی فایل و وێنە</span>
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
          {file && (
            <div className="flex justify-between items-center">
              <div>
                <p>قەبارەی بنەڕەت: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                {compressedFile && (
                  <p>قەبارەی پەستێنراو: {(compressedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                )}
              </div>
              <Button onClick={handleCompress} disabled={loading} className="btn-academic-primary">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'پەستانەوە'}
              </Button>
            </div>
          )}
          {compressedFile && (
            <Button onClick={handleDownload} className="w-full btn-academic-secondary">
              <Download className="h-4 w-4 mr-2" />
              داگرتنی فایلی پەستێنراو
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};