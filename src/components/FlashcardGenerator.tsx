import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { geminiService, type Flashcard } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { readFileContent } from '@/lib/fileReader';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { ResponsiveLayout, ResponsiveButtonGroup } from '@/components/ui/responsive-layout';
import { useResponsive } from '@/hooks/useResponsive';

export const FlashcardGenerator = () => {
  const [text, setText] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isMobile, isTablet } = useResponsive();

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
      const result = await geminiService.generateFlashcards(contentText);
      setFlashcards(result);
      setCurrentCard(0);
      setIsFlipped(false);
      toast({
        title: 'سەرکەوتوو بوو',
        description: `${result.length} فلاشکارت دروستکرا`,
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا فلاشکارتەکان دروست بکرێن',
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
            title: 'هەڵە لە خوێندنەوەی فایل',
            description: 'فایلەکە ناتوانرێت وەک دەق بخوێنرێتەوە',
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
  
  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
  };
  
  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <ResponsiveLayout>
      <Card className="card-academic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="sorani-text">دروستکەری فلاشکارت</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="دەقەکەت لێرە بنووسە یان فایلێک باربکە..."
            className={`input-academic sorani-text ${isMobile ? 'min-h-[120px]' : 'h-32'} text-sm sm:text-base`}
          />
          <ResponsiveButtonGroup orientation={isMobile ? "vertical" : "horizontal"}>
            <Button 
              onClick={handleGenerate} 
              disabled={loading} 
              className={`btn-academic-primary ${isMobile ? 'text-xs px-3 py-2' : ''}`}
            >
              {loading ? (
                <RefreshCw className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${isMobile ? 'mr-1' : 'mr-2'} animate-spin`} />
              ) : null}
              <span className="sorani-text">{loading ? 'چاوەڕوان بە...' : 'دروستکردنی فلاشکارت'}</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()} 
              className={`btn-academic-secondary ${isMobile ? 'text-xs px-3 py-2' : ''}`}
            >
              <Upload className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
              <span className="sorani-text">{isMobile ? 'فایل' : 'بارکردنی فایل'}</span>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".txt,.md,.pdf,.docx"
            />
          </ResponsiveButtonGroup>
        </CardContent>
      </Card>
        
        {flashcards.length > 0 && (
            <div className={`${isMobile ? 'mt-4' : 'mt-8'}`}>
                <AnimatePresence>
                    <motion.div
                        key={currentCard}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.5 }}
                        className={`relative ${isMobile ? 'h-48' : 'h-64'} cursor-pointer touch-manipulation`}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <motion.div
                            className="absolute w-full h-full"
                            style={{ backfaceVisibility: 'hidden' }}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                        >
                            <Card className={`h-full flex items-center justify-center ${isMobile ? 'p-3' : 'p-6'} ${isMobile ? 'text-base' : 'text-xl'} font-semibold text-center`}>
                                <RichTextRenderer
                                  content={flashcards[currentCard].question}
                                  showCopyButton={false}
                                  className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold text-center leading-relaxed`}
                                />
                            </Card>
                        </motion.div>
                        <motion.div
                            className="absolute w-full h-full"
                            style={{ backfaceVisibility: 'hidden', rotateY: 180 }}
                            animate={{ rotateY: isFlipped ? 0 : -180 }}
                        >
                            <Card className={`h-full flex items-center justify-center ${isMobile ? 'p-3' : 'p-6'} ${isMobile ? 'text-sm' : 'text-lg'} text-center bg-secondary`}>
                                <RichTextRenderer
                                  content={flashcards[currentCard].answer}
                                  showCopyButton={false}
                                  className={`${isMobile ? 'text-sm' : 'text-lg'} text-center leading-relaxed`}
                                />
                            </Card>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
                <ResponsiveButtonGroup orientation="horizontal">
                  <Button 
                    onClick={handlePrevCard}
                    disabled={currentCard === 0}
                    size={isMobile ? "sm" : "default"}
                    className={isMobile ? 'px-2' : ''}
                  >
                    <ChevronLeft className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    {!isMobile && <span className="ml-1">قبلی</span>}
                  </Button>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} flex items-center px-2`}>
                    {currentCard + 1} / {flashcards.length}
                  </span>
                  <Button 
                    onClick={handleNextCard}
                    disabled={currentCard === flashcards.length - 1}
                    size={isMobile ? "sm" : "default"}
                    className={isMobile ? 'px-2' : ''}
                  >
                    {!isMobile && <span className="mr-1">دواتر</span>}
                    <ChevronRight className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </Button>
                </ResponsiveButtonGroup>
            </div>
        )}
    </ResponsiveLayout>
  );
};