import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, RefreshCw } from 'lucide-react';
import { geminiService, type PresentationSlide } from '@/services/geminiService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { readFileContent } from '@/lib/fileReader';
import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/white.css';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';

export const PresentationGenerator = () => {
  const [text, setText] = useState('');
  const [slides, setSlides] = useState<PresentationSlide[]>([]);
  const [loading, setLoading] = useState(false);
  const [slideCount, setSlideCount] = useState(7);
  const [style, setStyle] = useState('academic');
  const [core, setCore] = useState('introduction');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deckDivRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<Reveal.Api | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (slides.length > 0 && deckDivRef.current) {
      if (deckRef.current) {
        deckRef.current.destroy();
      }
      
      const deck = new Reveal(deckDivRef.current, {
        embedded: true,
        hash: true,
        plugins: []
      });
      deck.initialize().then(() => {
        deck.layout();
        deck.sync();
        deckRef.current = deck;
      });
    }
  }, [slides, text]);

  const triggerGeneration = async (contentText: string) => {
    if (!contentText.trim()) {
      toast({
        title: 'هەڵە',
        description: 'فایلەکە بەتاڵە یان دەقەکەت بەتاڵە',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      const result = await geminiService.generatePresentation(contentText, slideCount, style, core);
      setSlides(result);
      toast({
        title: 'سەرکەوتوو بوو',
        description: `${result.length} سلاید دروستکرا`,
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا پێشکەشکردنەکە دروست بکرێت',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const content = await readFileContent(file);
        if (typeof content === 'string') {
          setText(content);
          await triggerGeneration(content);
        } else {
          toast({
            title: 'جۆری فایل پشتگیری نەکراوە',
            description: 'دەرهێنانی دەق لە فایلەکانی PDF لە ئێستادا بۆ دروستکردنی پێشکەشکردن بەردەست نییە.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'هەڵە لە خوێندنەوەی فایل',
          description: (error as Error).message,
          variant: 'destructive',
        });
      }
    }
  };
  
  const handleGenerate = () => {
    triggerGeneration(text);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="sorani-text">دروستکەری پێشکەشکردن</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="دەقی پێشکەشکردنەکەت لێرە بنووسە یان فایلێک باربکە..."
              className="input-academic sorani-text h-32"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="slide-count">ژمارەی سلایدەکان: {slideCount}</Label>
                <Slider
                  id="slide-count"
                  min={3}
                  max={13}
                  step={1}
                  value={[slideCount]}
                  onValueChange={(value) => setSlideCount(value[0])}
                />
              </div>
              <Select onValueChange={setStyle} defaultValue={style}>
                <SelectTrigger>
                  <SelectValue placeholder="شێواز" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">ئەکادیمی</SelectItem>
                  <SelectItem value="professional">پیشەگەرانە</SelectItem>
                  <SelectItem value="creative">داهێنەرانە</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={setCore} defaultValue={core}>
                <SelectTrigger>
                  <SelectValue placeholder="ناوەڕۆکی سەرەکی" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="introduction">پێشەکی</SelectItem>
                  <SelectItem value="explanation">شیکردنەوە</SelectItem>
                  <SelectItem value="methodology">میتۆدۆلۆژی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleGenerate} disabled={loading} className="btn-academic-primary">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'دروستکردنی پێشکەشکردن'}
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="btn-academic-secondary">
                <Upload className="h-4 w-4 mr-2" />
                بارکردنی فایل
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.md,.pdf,.docx"
              />
            </div>
          </CardContent>
        </Card>

        {slides.length > 0 && (
          <div className="mt-8" style={{ height: '500px' }}>
            <div ref={deckDivRef} className="reveal h-full">
              <div className="slides">
                {slides.map((slide, index) => (
                  <section key={index} data-layout={slide.layout}>
                    <div className="h-full w-full flex flex-col justify-center items-center text-center p-8">
                      {slide.layout === 'title' ? (
                        <>
                          <RichTextRenderer
                            content={slide.title}
                            showCopyButton={false}
                            className="text-5xl font-bold mb-4"
                          />
                          <RichTextRenderer
                            content={slide.content}
                            showCopyButton={false}
                            className="text-xl"
                          />
                        </>
                      ) : slide.layout === 'image-right' ? (
                        <div className="flex items-center w-full">
                          <div className="w-1/2 pr-8">
                            <RichTextRenderer
                              content={slide.title}
                              showCopyButton={false}
                              className="text-4xl font-semibold mb-4"
                            />
                            <RichTextRenderer
                              content={slide.content}
                              showCopyButton={false}
                              className=""
                            />
                          </div>
                          <div className="w-1/2">
                            <img src={`https://source.unsplash.com/800x600/?${slide.imageSearchTerm}`} alt={slide.title} className="rounded-lg shadow-lg" />
                          </div>
                        </div>
                      ) : slide.layout === 'image-left' ? (
                        <div className="flex items-center w-full">
                          <div className="w-1/2">
                            <img src={`https://source.unsplash.com/800x600/?${slide.imageSearchTerm}`} alt={slide.title} className="rounded-lg shadow-lg" />
                          </div>
                          <div className="w-1/2 pl-8">
                            <RichTextRenderer
                              content={slide.title}
                              showCopyButton={false}
                              className="text-4xl font-semibold mb-4"
                            />
                            <RichTextRenderer
                              content={slide.content}
                              showCopyButton={false}
                              className=""
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <RichTextRenderer
                            content={slide.title}
                            showCopyButton={false}
                            className="text-4xl font-semibold mb-4"
                          />
                          <RichTextRenderer
                            content={slide.content}
                            showCopyButton={false}
                            className="max-w-4xl"
                          />
                        </>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};