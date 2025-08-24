import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { geminiService, type CitationRequest } from '@/services/geminiService';
import { readFileContent } from '@/lib/fileReader';

export const CitationGenerator = () => {
  const [inputType, setInputType] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState('');
  const [textContent, setTextContent] = useState(''); // To store text content of the file
  const [citationStyle, setCitationStyle] = useState('APA');
  const [generatedCitation, setGeneratedCitation] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setLink(''); // Clear link if a file is selected
      try {
        const content = await readFileContent(selectedFile);
        setTextContent(content);
      } catch (error) {
        toast({
          title: 'هەڵە لە خوێندنەوەی فایل',
          description: (error as Error).message,
          variant: 'destructive',
        });
        setFile(null);
      }
    }
  };

  const handleGenerate = async () => {
    if (inputType === 'file' && !file) {
      toast({
        title: 'هەڵە',
        description: 'فایلێک هەڵبژێرە',
        variant: 'destructive',
      });
      return;
    }
    
    if (inputType === 'link' && !link) {
      toast({
        title: 'هەڵە',
        description: 'لینکێک داخڵ بکە',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setGeneratedCitation(''); // Clear previous citation

    try {
      let contentToProcess = '';
      
      if (inputType === 'file') {
        contentToProcess = textContent;
      } else {
        // For link, we would ideally fetch the content. 
        // For now, we'll use the link itself as the content for the AI to process.
        // A more robust solution would involve fetching the webpage content.
        contentToProcess = link;
      }
      
      const request: CitationRequest = {
        content: contentToProcess,
        style: citationStyle as 'APA' | 'MLA' | 'Chicago' | 'IEEE'
      };
      
      const citation = await geminiService.generateCitation(request);
      setGeneratedCitation(citation);
      
      toast({
        title: 'سەرکەوتوو بوو',
        description: 'بەڵگەنامەکە بە سەرکەوتوویی دروست کرا',
      });
    } catch (error) {
      console.error("Error generating citation:", error);
      toast({
        title: 'هەڵە',
        description: 'هەڵەیەک ڕوویدا لە کاتی دروستکردنی بەڵگەنامە',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCitation);
    toast({
      title: 'کۆپی کرا',
      description: 'بەڵگەنامەکە کۆپی کرا بۆ کلیپ بۆرد',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="card-academic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="sorani-text">دروستکەری بەڵگەنامە</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              variant={inputType === 'file' ? 'default' : 'outline'} 
              onClick={() => setInputType('file')}
              className={inputType === 'file' ? 'btn-academic-primary' : 'btn-academic-outline'}
            >
              فایل
            </Button>
            <Button 
              variant={inputType === 'link' ? 'default' : 'outline'} 
              onClick={() => setInputType('link')}
              className={inputType === 'link' ? 'btn-academic-primary' : 'btn-academic-outline'}
            >
              لینک
            </Button>
          </div>
          
          {inputType === 'file' ? (
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
          ) : (
            <div className="space-y-2">
              <label htmlFor="link-input" className="text-sm font-medium">لینکی تۆڕ</label>
              <Input
                id="link-input"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com/research"
                className="input-academic"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="citation-style" className="text-sm font-medium">شێوازی بەڵگەنامە</label>
            <Select onValueChange={setCitationStyle} defaultValue={citationStyle}>
              <SelectTrigger id="citation-style">
                <SelectValue placeholder="شێواز هەڵبژێرە" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APA">APA</SelectItem>
                <SelectItem value="MLA">MLA</SelectItem>
                <SelectItem value="Chicago">Chicago</SelectItem>
                <SelectItem value="IEEE">IEEE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleGenerate} disabled={loading} className="btn-academic-primary w-full">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'دروستکردنی بەڵگەنامە'}
          </Button>
          
          {generatedCitation && (
            <div className="mt-6 p-4 bg-card border border-border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">بەڵگەنامەی دروستکراو:</h3>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="whitespace-pre-wrap">{generatedCitation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};