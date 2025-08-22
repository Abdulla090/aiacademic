import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, RefreshCw } from 'lucide-react';
import { geminiService, type PresentationSlide } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { readFileContent } from '@/lib/fileReader';
import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/black.css';

export const PresentationGenerator = () => {
  const [text, setText] = useState('');
  const [slides, setSlides] = useState<PresentationSlide[]>([]);
  const [loading, setLoading] = useState(false);
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
      const result = await geminiService.generatePresentation(contentText);
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
        setText(content);
        await triggerGeneration(content);
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
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="دەقی پێشکەشکردنەکەت لێرە بنووسە یان فایلێک باربکە..."
              className="input-academic sorani-text h-32"
            />
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
                    {slide.layout === 'title' ? (
                      <div>
                        <h1>{slide.title}</h1>
                        <p>{slide.content}</p>
                      </div>
                    ) : slide.layout === 'image-right' ? (
                      <div className="flex items-center">
                        <div className="w-1/2">
                          <h2>{slide.title}</h2>
                          <p>{slide.content}</p>
                        </div>
                        <div className="w-1/2">
                          <img src={slide.imageUrl} alt={slide.title} />
                        </div>
                      </div>
                    ) : slide.layout === 'image-left' ? (
                      <div className="flex items-center">
                        <div className="w-1/2">
                          <img src={slide.imageUrl} alt={slide.title} />
                        </div>
                        <div className="w-1/2">
                          <h2>{slide.title}</h2>
                          <p>{slide.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2>{slide.title}</h2>
                        <p>{slide.content}</p>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};