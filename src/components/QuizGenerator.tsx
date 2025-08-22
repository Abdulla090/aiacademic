import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, RefreshCw } from 'lucide-react';
import { geminiService, type QuizQuestion } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { readFileContent } from '@/lib/fileReader';

export const QuizGenerator = () => {
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [submitted, setSubmitted] = useState(false);
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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
              className="input-academic sorani-text h-32"
            />
            <div className="flex items-center gap-4">
                <Button onClick={handleGenerate} disabled={loading} className="btn-academic-primary">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'دروستکردنی کویز'}
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
                                <CardTitle>{i + 1}. {q.question}</CardTitle>
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
                                        {option}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
                <div className="text-center">
                    {!submitted ? (
                        <Button onClick={handleSubmit}>ناردنی وەڵامەکان</Button>
                    ) : (
                        <div className="text-2xl font-bold">
                            نمرەکەت: {getScore()} / {questions.length}
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};