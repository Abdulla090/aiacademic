import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { geminiService, type Flashcard } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { readFileContent } from '@/lib/fileReader';

export const FlashcardGenerator = () => {
  const [text, setText] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
  
  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
  };
  
  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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
              className="input-academic sorani-text h-32"
            />
            <div className="flex items-center gap-4">
                <Button onClick={handleGenerate} disabled={loading} className="btn-academic-primary">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'دروستکردنی فلاشکارت'}
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
        
        {flashcards.length > 0 && (
            <div className="mt-8">
                <AnimatePresence>
                    <motion.div
                        key={currentCard}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.5 }}
                        className="relative h-64"
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <motion.div
                            className="absolute w-full h-full"
                            style={{ backfaceVisibility: 'hidden' }}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                        >
                            <Card className="h-full flex items-center justify-center p-6 text-xl font-semibold text-center">
                                {flashcards[currentCard].question}
                            </Card>
                        </motion.div>
                        <motion.div
                            className="absolute w-full h-full"
                            style={{ backfaceVisibility: 'hidden', rotateY: 180 }}
                            animate={{ rotateY: isFlipped ? 0 : -180 }}
                        >
                            <Card className="h-full flex items-center justify-center p-6 text-lg text-center bg-secondary">
                                {flashcards[currentCard].answer}
                            </Card>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
                <div className="flex items-center justify-center gap-4 mt-4">
                    <Button onClick={handlePrevCard}><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="text-sm">{currentCard + 1} / {flashcards.length}</span>
                    <Button onClick={handleNextCard}><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>
        )}
    </div>
  );
};