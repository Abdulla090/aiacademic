import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { LanguageSelection } from './LanguageSelection';

export const ImageConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [responseLanguage, setResponseLanguage] = useState('en');
  const [outputFormat, setOutputFormat] = useState('png');
  const [quality, setQuality] = useState(0.92);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        const img = new Image();
        img.onload = () => {
          setWidth(img.width);
          setHeight(img.height);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: 'هەڵە',
        description: 'هیچ وێنەیەک هەڵنەبژێردراوە',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${file.name.split('.')[0]}.${outputFormat}`;
              document.body.appendChild(a);
              a.click();
              URL.revokeObjectURL(url);
              a.remove();
              toast({
                title: 'سەرکەوتوو بوو',
                description: `وێنەکە بە سەرکەوتوویی گۆڕدرا بۆ ${outputFormat}`,
              });
            }
            setLoading(false);
          },
          `image/${outputFormat}`,
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="card-academic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="sorani-text">گۆڕینی فۆرماتی وێنە</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-border rounded-lg">
              {preview ? (
                <img src={preview} alt="Image Preview" className="max-h-64 rounded-lg" />
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">وێنەکەت لێرە ڕابکێشە یان کلیک بکە</p>
                </>
              )}
              <Button variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                هەڵبژاردنی وێنە
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="format">گۆڕین بۆ</Label>
                <Select onValueChange={setOutputFormat} defaultValue={outputFormat}>
                  <SelectTrigger id="format">
                    <SelectValue placeholder="فۆرمات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="webp">WEBP</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                    <SelectItem value="tiff">TIFF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <LanguageSelection
                 selectedLanguage={responseLanguage}
                 onLanguageChange={setResponseLanguage}
               />
              <div>
                <Label htmlFor="quality">کوالێتی: {Math.round(quality * 100)}%</Label>
                <Slider
                  id="quality"
                  min={0.1}
                  max={1}
                  step={0.01}
                  value={[quality]}
                  onValueChange={(value) => setQuality(value[0])}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="width" className="text-sm">پانی</Label>
                  <input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="input-academic w-full text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-sm">بەرزی</Label>
                  <input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="input-academic w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          <Button onClick={handleConvert} disabled={loading} className="btn-academic-primary w-full">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'گۆڕین'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};