import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, RefreshCw } from 'lucide-react';
import { geminiService, type QuizQuestion } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { readFileContent } from '@/lib/fileReader';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { ResponsiveLayout, ResponsiveButtonGroup } from '@/components/ui/responsive-layout';
import { useResponsive } from '@/hooks/useResponsive';

export const QuizGenerator = () => {
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [submitted, setSubmitted] = useState(false);
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
    setSubmitted(false);
    setAnswers({});
    try {
      const result = await geminiService.generateQuiz(contentText);
      setQuestions(result);
      toast({
        title: 'سەرکەوتوو بوو',
        description: `${result.length} پرسیار دروستکرا`,
      });
    } catch (error) {
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا کویزەکە دروست بکرێت',
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
        setText(content as string);
        await triggerGeneration(content as string);
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

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({...prev, [questionIndex]: answer}));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const getScore = () => {
    return questions.reduce((score, question, index) => {
        return score + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
  };

  return (
    <ResponsiveLayout>
      <Card className="card-academic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="sorani-text">دروستکەری کویز</span>
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
              <span className="sorani-text">{loading ? 'چاوەڕوان بە...' : 'دروستکردنی کویز'}</span>
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
        
        {questions.length > 0 && (
            <div className="mt-8 space-y-6">
                {questions.map((q, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {i + 1}. <RichTextRenderer
                                        content={q.question}
                                        showCopyButton={false}
                                        className="inline"
                                    />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {q.options.map((option, j) => (
                                    <Button
                                        key={j}
                                        variant={answers[i] === option ? 'default' : 'outline'}
                                        onClick={() => !submitted && handleAnswerChange(i, option)}
                                        className={`w-full justify-start text-left ${submitted ? (
                                            option === q.correctAnswer ? 'bg-green-200' : (answers[i] === option ? 'bg-red-200' : '')
                                        ) : ''}`}
                                    >
                                        <RichTextRenderer
                                            content={option}
                                            showCopyButton={false}
                                            className="inline"
                                        />
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
                <div className="text-center">
                    {!submitted ? (
                        <Button 
                          onClick={handleSubmit}
                          className={`${isMobile ? 'w-full text-sm py-2' : ''}`}
                        >
                          ناردنی وەڵامەکان
                        </Button>
                    ) : (
                        <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
                            نمرەکەت: {getScore()} / {questions.length}
                        </div>
                    )}
                </div>
            </div>
        )}
    </ResponsiveLayout>
  );
};