import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, RefreshCw, Heart, Zap, Trophy, Clock, Target, Star, Lightbulb, Award, TrendingUp, X } from 'lucide-react';
import { geminiService, type QuizQuestion } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { readFileContent } from '@/lib/fileReader';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { ResponsiveLayout, ResponsiveButtonGroup } from '@/components/ui/responsive-layout';
import { useResponsive } from '@/hooks/useResponsive';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSelection } from './LanguageSelection';
import { ConfettiEffect } from '@/components/ui/confetti-effect';
import { AchievementBadge } from '@/components/ui/achievement-badge';
import { ProgressBar } from '@/components/ui/progress-bar';

type DifficultyLevel = 'easy' | 'medium' | 'hard';

export const QuizGenerator = () => {
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [responseLanguage, setResponseLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [submitted, setSubmitted] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState<Set<number>>(new Set());
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAchievement, setShowAchievement] = useState<'perfect' | 'streak' | 'speed' | 'completion' | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [fastAnswers, setFastAnswers] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('all');
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
      const result = await geminiService.generateQuiz(contentText, questionCount);
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
    resetQuizState();
  };

  const resetQuizState = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrentQuestionIndex(0);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setHintsUsed(new Set());
    setTimerSeconds(0);
    setTimerActive(true);
    setShowHint(false);
    setFastAnswers(0);
    setQuestionStartTime(Date.now());
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    if (submitted) return;

    const wasCorrect = answers[questionIndex] === questions[questionIndex].correctAnswer;
    const isCorrect = answer === questions[questionIndex].correctAnswer;
    
    setAnswers(prev => ({...prev, [questionIndex]: answer}));

    if (viewMode === 'single') {
      const responseTime = Date.now() - questionStartTime;
      
      if (isCorrect) {
        setStreak(prev => {
          const newStreak = prev + 1;
          setMaxStreak(Math.max(maxStreak, newStreak));
          if (newStreak >= 5) {
            setShowAchievement('streak');
          }
          return newStreak;
        });

        if (responseTime < 5000 && !hintsUsed.has(questionIndex)) {
          setFastAnswers(prev => prev + 1);
          if (fastAnswers + 1 >= 3) {
            setShowAchievement('speed');
          }
        }

        toast({
          title: '✓ راست!',
          description: 'وەڵامی راست',
          variant: 'default'
        });
      } else if (!wasCorrect) {
        setStreak(0);
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives === 0) {
            toast({
              title: 'تەواو بوو!',
              description: 'هیچ ژیانێکت نەماوە',
              variant: 'destructive'
            });
            setSubmitted(true);
          }
          return newLives;
        });

        toast({
          title: '✗ هەڵە',
          description: 'وەڵامی هەڵە',
          variant: 'destructive'
        });
      }

      // Auto advance after a delay
      if (isCorrect && currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          setShowHint(false);
          setQuestionStartTime(Date.now());
        }, 1000);
      } else if (isCorrect && currentQuestionIndex === questions.length - 1) {
        checkForAchievements();
      }
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimerActive(false);
    checkForAchievements();
  };

  const checkForAchievements = () => {
    const score = getScore();
    const percentage = (score / questions.length) * 100;

    if (percentage === 100) {
      setShowConfetti(true);
      setShowAchievement('perfect');
    } else if (percentage >= 80) {
      setShowAchievement('completion');
    }
  };

  const useHint = (questionIndex: number) => {
    setHintsUsed(new Set([...hintsUsed, questionIndex]));
    setShowHint(true);
    
    // Remove one wrong answer as a hint
    const question = questions[questionIndex];
    const wrongAnswers = question.options.filter(opt => opt !== question.correctAnswer);
    const hintText = `تێبینی: یەکێک لە وەڵامە هەڵەکان "${wrongAnswers[0]}" یە`;
    
    toast({
      title: 'تێبینی',
      description: hintText,
    });
  };

  const getScore = () => {
    return questions.reduce((score, question, index) => {
        return score + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
  };

  const getScorePercentage = () => {
    return Math.round((getScore() / questions.length) * 100);
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && questions.length > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, questions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ResponsiveLayout>
      <ConfettiEffect active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <AnimatePresence>
        {showAchievement && (
          <AchievementBadge 
            type={showAchievement} 
            show={true}
            onComplete={() => setShowAchievement(null)}
          />
        )}
      </AnimatePresence>

      <Card className="card-academic">
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              <span className="sorani-text">دروستکەری کویز</span>
            </div>
            {questions.length > 0 && !submitted && (
              <div className="flex items-center gap-3 text-sm flex-wrap">
                {/* Lives */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart 
                      key={i}
                      className={`h-5 w-5 ${i < lives ? 'fill-red-500 text-red-500' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                {/* Streak */}
                <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="font-bold text-purple-600">{streak}</span>
                </div>
                {/* Timer */}
                <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-blue-600">{formatTime(timerSeconds)}</span>
                </div>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="دەقەکەت لێرە بنووسە یان فایلێک باربکە..."
            className={`input-academic sorani-text ${isMobile ? 'min-h-[120px]' : 'h-32'} text-sm sm:text-base`}
          />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="question-count" className="sorani-text">
                ژمارەی پرسیارەکان
              </Label>
              <Input
                id="question-count"
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value, 10)))}
                className="input-academic mt-1"
                min="1"
                max="20"
              />
            </div>
             <LanguageSelection
               selectedLanguage={responseLanguage}
               onLanguageChange={setResponseLanguage}
             />
            <ResponsiveButtonGroup orientation={isMobile ? "vertical" : "horizontal"} className="flex-shrink-0">
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
          </div>
        </CardContent>
      </Card>
        
        {questions.length > 0 && (
            <div className="mt-8 space-y-6">
                {/* Progress Bar */}
                <ProgressBar 
                  current={Object.keys(answers).length} 
                  total={questions.length}
                  variant="gradient"
                />

                {/* View Mode Toggle */}
                <div className="flex gap-2 justify-center">
                  <Button
                    variant={viewMode === 'all' ? 'default' : 'outline'}
                    onClick={() => setViewMode('all')}
                    size="sm"
                  >
                    <span className="sorani-text">هەموو پرسیارەکان</span>
                  </Button>
                  <Button
                    variant={viewMode === 'single' ? 'default' : 'outline'}
                    onClick={() => {
                      setViewMode('single');
                      resetQuizState();
                    }}
                    size="sm"
                  >
                    <span className="sorani-text">یەک بە یەک</span>
                  </Button>
                </div>

                {/* Single Question Mode */}
                {viewMode === 'single' && !submitted && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestionIndex}
                      initial={{ opacity: 0, x: 100, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -100, scale: 0.9 }}
                      transition={{ duration: 0.3, type: 'spring' }}
                    >
                      <Card className="border-2 border-purple-200 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-gray-600 sorani-text">
                              پرسیار {currentQuestionIndex + 1} لە {questions.length}
                            </div>
                            {!hintsUsed.has(currentQuestionIndex) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => useHint(currentQuestionIndex)}
                                className="gap-1"
                              >
                                <Lightbulb className="h-4 w-4" />
                                <span className="sorani-text">تێبینی</span>
                              </Button>
                            )}
                          </div>
                          <CardTitle className="break-words text-xl">
                            <RichTextRenderer
                              content={questions[currentQuestionIndex].question}
                              showCopyButton={false}
                              className="report-content inline"
                            />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                          {questions[currentQuestionIndex].options.map((option, j) => {
                            const isSelected = answers[currentQuestionIndex] === option;
                            const isCorrect = option === questions[currentQuestionIndex].correctAnswer;
                            
                            return (
                              <motion.div
                                key={j}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: j * 0.1 }}
                              >
                                <Button
                                  variant={isSelected ? 'default' : 'outline'}
                                  onClick={() => handleAnswerChange(currentQuestionIndex, option)}
                                  disabled={lives === 0}
                                  className={`w-full justify-start text-left break-words whitespace-normal h-auto min-h-[50px] py-3 px-4 transition-all ${
                                    isSelected ? 'ring-2 ring-purple-500 scale-105' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-3 w-full">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                                      {String.fromCharCode(65 + j)}
                                    </div>
                                    <RichTextRenderer
                                      content={option}
                                      showCopyButton={false}
                                      className="report-content inline text-sm md:text-base flex-1"
                                    />
                                  </div>
                                </Button>
                              </motion.div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* All Questions Mode */}
                {viewMode === 'all' && (
                  <div className="space-y-4">
                    {questions.map((q, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        <Card className={`${submitted && answers[i] === q.correctAnswer ? 'border-2 border-green-500' : submitted && answers[i] ? 'border-2 border-red-500' : ''}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="break-words flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                                    {i + 1}
                                  </span>
                                  <RichTextRenderer
                                    content={q.question}
                                    showCopyButton={false}
                                    className="report-content inline"
                                  />
                                </div>
                              </CardTitle>
                              {!submitted && !hintsUsed.has(i) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => useHint(i)}
                                  className="flex-shrink-0"
                                >
                                  <Lightbulb className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {q.options.map((option, j) => {
                              const isSelected = answers[i] === option;
                              const isCorrect = option === q.correctAnswer;
                              
                              let buttonClasses = 'w-full justify-start text-left break-words whitespace-normal h-auto min-h-[40px] py-2 px-3 transition-all';
                              
                              if (submitted) {
                                if (isCorrect) {
                                  buttonClasses += ' bg-green-100 border-green-500 hover:bg-green-200';
                                } else if (isSelected) {
                                  buttonClasses += ' bg-red-100 border-red-500 hover:bg-red-200';
                                }
                              } else if (isSelected) {
                                buttonClasses += ' ring-2 ring-purple-500';
                              }

                              return (
                                <Button
                                  key={j}
                                  variant={isSelected && !submitted ? 'default' : 'outline'}
                                  onClick={() => handleAnswerChange(i, option)}
                                  disabled={submitted}
                                  className={buttonClasses}
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                                      {String.fromCharCode(65 + j)}
                                    </div>
                                    <RichTextRenderer
                                      content={option}
                                      showCopyButton={false}
                                      className="report-content inline text-sm md:text-base flex-1"
                                    />
                                    {submitted && isCorrect && (
                                      <Star className="h-5 w-5 fill-green-500 text-green-500 flex-shrink-0" />
                                    )}
                                    {submitted && isSelected && !isCorrect && (
                                      <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                                    )}
                                  </div>
                                </Button>
                              );
                            })}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Submit Button or Results */}
                <div className="text-center space-y-4">
                  {!submitted && viewMode === 'all' ? (
                    <Button 
                      onClick={handleSubmit}
                      disabled={Object.keys(answers).length < questions.length}
                      className={`${isMobile ? 'w-full' : ''} gap-2 text-lg py-6 px-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600`}
                      size="lg"
                    >
                      <Target className="h-5 w-5" />
                      <span className="sorani-text">ناردنی وەڵامەکان</span>
                    </Button>
                  ) : submitted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 space-y-4"
                    >
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <Trophy className="h-12 w-12 text-yellow-500" />
                        <div className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold ${getScoreColor()}`}>
                          {getScorePercentage()}%
                        </div>
                      </div>
                      <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold sorani-text`}>
                        نمرەکەت: {getScore()} لە {questions.length}
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white rounded-lg p-4 text-center">
                          <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                          <div className="font-bold">{formatTime(timerSeconds)}</div>
                          <div className="text-xs text-gray-600 sorani-text">کات</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <Zap className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                          <div className="font-bold">{maxStreak}</div>
                          <div className="text-xs text-gray-600 sorani-text">بەرزترین زنجیرە</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <Lightbulb className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                          <div className="font-bold">{hintsUsed.size}</div>
                          <div className="text-xs text-gray-600 sorani-text">تێبینی بەکارهێنراو</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                          <div className="font-bold">{fastAnswers}</div>
                          <div className="text-xs text-gray-600 sorani-text">وەڵامی خێرا</div>
                        </div>
                      </div>

                      {/* Retry Button */}
                      <Button
                        onClick={() => {
                          resetQuizState();
                        }}
                        className="mt-4 gap-2"
                        variant="outline"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span className="sorani-text">دووبارە هەوڵبدەوە</span>
                      </Button>
                    </motion.div>
                  ) : null}
                </div>
            </div>
        )}
    </ResponsiveLayout>
  );
};