import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, RefreshCw, Heart, Zap, Trophy, Clock, Target, Star, Lightbulb, Award, TrendingUp, X, Check, ArrowRight, Filter, BarChart3, Flame } from 'lucide-react';
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
import { useTranslation } from 'react-i18next';
import { ParticleEffect } from '@/components/ui/particle-effect';

type QuizDifficultyBase = 'easy' | 'medium' | 'hard';
type DifficultyLevel = QuizDifficultyBase | 'mixed';

const difficultyBadgeClasses: Record<QuizDifficultyBase, string> = {
  easy: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  hard: 'bg-rose-100 text-rose-700 border border-rose-200',
};

const difficultyLabel: Record<QuizDifficultyBase, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const difficultyOrder: QuizDifficultyBase[] = ['easy', 'medium', 'hard'];
const TOTAL_LIVES = 3;
const difficultyOptionLabels: Record<DifficultyLevel, string> = {
  easy: 'Gentle',
  medium: 'Standard',
  hard: 'Challenging',
  mixed: 'Balanced',
};

const renderDifficultyBadge = (level?: string) => {
  if (!level) return null;
  const normalized = level.toLowerCase() as QuizDifficultyBase;
  if (!difficultyOrder.includes(normalized)) return null;
  return (
    <span className={`text-[10px] uppercase tracking-[0.2em] px-3 py-1 font-semibold ${difficultyBadgeClasses[normalized]}`}>
      {difficultyLabel[normalized]}
    </span>
  );
};

export const QuizGenerator = () => {
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [responseLanguage, setResponseLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [submitted, setSubmitted] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState<Set<number>>(new Set());
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAchievement, setShowAchievement] = useState<'perfect' | 'streak' | 'speed' | 'completion' | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [fastAnswers, setFastAnswers] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('all');
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [revealedExplanations, setRevealedExplanations] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isMobile, isTablet } = useResponsive();
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const difficultySpread = useMemo(() => {
    return questions.reduce((acc, question) => {
      const normalized = (question.difficulty ?? 'medium').toLowerCase() as QuizDifficultyBase;
      if (difficultyOrder.includes(normalized)) {
        acc[normalized] = acc[normalized] + 1;
      }
      return acc;
    }, { easy: 0, medium: 0, hard: 0 } as Record<QuizDifficultyBase, number>);
  }, [questions]);

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    questions.forEach((question) => {
      if (question.category) {
        counts.set(question.category, (counts.get(question.category) ?? 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [questions]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const triggerGeneration = async (contentText: string) => {
    if (!contentText.trim()) {
      toast({
        title: '┘ç█ò┌╡█ò',
        description: '┘ü╪º█î┘ä█ò┌⌐█ò ╪¿█ò╪¬╪º┌╡█ò █î╪º┘å ╪»█ò┘é█ò┌⌐█ò╪¬ ╪¿█ò╪¬╪º┌╡█ò',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setHintMessage(null);
    setShowReviewPanel(false);
    setRevealedExplanations(new Set());
    try {
      const result = await geminiService.generateQuiz(contentText, questionCount, difficulty);
      setQuestions(result);
      toast({
        title: '╪│█ò╪▒┌⌐█ò┘ê╪¬┘ê┘ê ╪¿┘ê┘ê',
        description: `${result.length} ┘╛╪▒╪│█î╪º╪▒ ╪»╪▒┘ê╪│╪¬┌⌐╪▒╪º`,
      });
    } catch (error) {
      toast({
        title: '┘ç█ò┌╡█ò',
        description: '┘å█ò╪¬┘ê╪º┘å╪▒╪º ┌⌐┘ê█î╪▓█ò┌⌐█ò ╪»╪▒┘ê╪│╪¬ ╪¿┌⌐╪▒█Ä╪¬',
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
          title: '┘ç█ò┌╡█ò ┘ä█ò ╪«┘ê█Ä┘å╪»┘å█ò┘ê█ò█î ┘ü╪º█î┘ä',
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
    setLives(TOTAL_LIVES);
    setStreak(0);
    setMaxStreak(0);
    setHintsUsed(new Set());
    setTimerSeconds(0);
    setTimerActive(true);
    setFastAnswers(0);
    setQuestionStartTime(Date.now());
    setHintMessage(null);
    setShowReviewPanel(false);
    setRevealedExplanations(new Set());
  };

  const addRevealedExplanation = (index: number) => {
    setRevealedExplanations(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const revealAllExplanations = () => {
    setRevealedExplanations(new Set(questions.map((_, index) => index)));
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    if (submitted) return;

    const question = questions[questionIndex];
    if (!question) return;

    const wasCorrect = answers[questionIndex] === question.correctAnswer;
    const isCorrect = answer === question.correctAnswer;
    
    setAnswers(prev => ({...prev, [questionIndex]: answer}));

    if (viewMode === 'single') {
      addRevealedExplanation(questionIndex);
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
          setFastAnswers(prev => {
            const nextValue = prev + 1;
            if (nextValue >= 3) {
              setShowAchievement('speed');
            }
            return nextValue;
          });
        }

        toast({
          title: 'Great work!',
          description: 'You nailed this question.',
          variant: 'default'
        });
      } else if (!wasCorrect) {
        setStreak(0);
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives === 0) {
            toast({
              title: 'Session complete!',
              description: 'All lives are used up.',
              variant: 'destructive'
            });
            setSubmitted(true);
            setTimerActive(false);
            revealAllExplanations();
          }
          return newLives;
        });

        toast({
          title: 'Keep going',
          description: 'That choice was not correct.',
          variant: 'destructive'
        });
      }

      if (isCorrect && currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          setQuestionStartTime(Date.now());
          setHintMessage(null);
        }, 1000);
      } else if (isCorrect && currentQuestionIndex === questions.length - 1) {
        setSubmitted(true);
        setTimerActive(false);
        revealAllExplanations();
        checkForAchievements();
      }
    }
  };
  const handleSubmit = () => {
    setSubmitted(true);
    setTimerActive(false);
    revealAllExplanations();
    setHintMessage(null);
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
    const question = questions[questionIndex];
    if (!question) return;

    setHintsUsed(prev => new Set([...prev, questionIndex]));
    addRevealedExplanation(questionIndex);
    
    const wrongAnswers = question.options.filter(opt => opt !== question.correctAnswer);
    const fallbackHint = wrongAnswers.length > 0
      ? `Hint: consider eliminating "${wrongAnswers[0]}".`
      : 'Hint: revisit the key idea in the text.';
    const hintText = question.hint ?? fallbackHint;

    setHintMessage(hintText);
    toast({
      title: 'ڕێنمایی',
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

  useEffect(() => {
    if (!hintMessage) return;
    const timeout = setTimeout(() => setHintMessage(null), 6000);
    return () => clearTimeout(timeout);
  }, [hintMessage]);

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

      <AnimatePresence>
        {hintMessage && (
          <motion.div
            key="hint-banner"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-4"
          >
            <div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-blue-50 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-purple-500">Hint unlocked</div>
                  <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                    {hintMessage}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setHintMessage(null)}
                  className="h-7 w-7 rounded-full text-purple-500 hover:text-purple-700 hover:bg-purple-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="card-academic">
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Trophy className="h-5 w-5" />
              <span className="sorani-text">Quiz Generator</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-600">
                {difficulty.toUpperCase()}
              </Badge>
            </div>
            {questions.length > 0 && !submitted && (
              <div className="flex items-center gap-2 text-sm flex-wrap justify-end">
                <div className="flex items-center gap-1">
                  {Array.from({ length: TOTAL_LIVES }).map((_, i) => (
                    <Heart 
                      key={i}
                      className={`h-5 w-5 ${i < lives ? 'fill-red-500 text-red-500' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="font-bold text-purple-600">{streak}</span>
                </div>
                <div className="flex items-center gap-1 bg-emerald-100 px-2 py-1 rounded-full">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-emerald-600">{answeredCount}/{questions.length}</span>
                </div>
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
            placeholder="╪»█ò┘é█ò┌⌐█ò╪¬ ┘ä█Ä╪▒█ò ╪¿┘å┘ê┘ê╪│█ò █î╪º┘å ┘ü╪º█î┘ä█Ä┌⌐ ╪¿╪º╪▒╪¿┌⌐█ò..."
            className={`input-academic sorani-text ${isMobile ? 'min-h-[120px]' : 'h-32'} text-sm sm:text-base`}
          />
          <div className="flex flex-col gap-4">
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
            <div className="flex-1">
              <Label className="sorani-text">
                قەبارەی سووڵەتی پرسیارەکان
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {( ['easy','medium','hard','mixed'] as DifficultyLevel[] ).map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={difficulty === level ? 'default' : 'outline'}
                    size={isMobile ? 'sm' : 'default'}
                    onClick={() => setDifficulty(level)}
                    className="transition-all"
                  >
                    {difficultyOptionLabels[level]}
                  </Button>
                ))}
              </div>
            </div>
            <div className="w-full">
              <LanguageSelection
                 selectedLanguage={responseLanguage}
                 onLanguageChange={setResponseLanguage}
              />
            </div>
          </div>
          <ResponsiveButtonGroup orientation={isMobile ? "vertical" : "horizontal"} className="flex-shrink-0">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-academic-primary"
            >
            {loading ? (
              <RefreshCw className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} />
            ) : null}
            <span className="sorani-text">{loading ? 'چاوەڕوان بە...' : 'دروستکردنی کویز'}</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()} 
            className="btn-academic-secondary"
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
                    <span className="sorani-text">┘ç█ò┘à┘ê┘ê ┘╛╪▒╪│█î╪º╪▒█ò┌⌐╪º┘å</span>
                  </Button>
                  <Button
                    variant={viewMode === 'single' ? 'default' : 'outline'}
                    onClick={() => {
                      setViewMode('single');
                      resetQuizState();
                    }}
                    size="sm"
                  >
                    <span className="sorani-text">█î█ò┌⌐ ╪¿█ò █î█ò┌⌐</span>
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
                              ┘╛╪▒╪│█î╪º╪▒ {currentQuestionIndex + 1} ┘ä█ò {questions.length}
                            </div>
                            {!hintsUsed.has(currentQuestionIndex) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => useHint(currentQuestionIndex)}
                                className="gap-1"
                              >
                                <Lightbulb className="h-4 w-4" />
                                <span className="sorani-text">╪¬█Ä╪¿█î┘å█î</span>
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
                      <span className="sorani-text">┘å╪º╪▒╪»┘å█î ┘ê█ò┌╡╪º┘à█ò┌⌐╪º┘å</span>
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
                        ┘å┘à╪▒█ò┌⌐█ò╪¬: {getScore()} ┘ä█ò {questions.length}
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white rounded-lg p-4 text-center">
                          <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                          <div className="font-bold">{formatTime(timerSeconds)}</div>
                          <div className="text-xs text-gray-600 sorani-text">┌⌐╪º╪¬</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <Zap className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                          <div className="font-bold">{maxStreak}</div>
                          <div className="text-xs text-gray-600 sorani-text">╪¿█ò╪▒╪▓╪¬╪▒█î┘å ╪▓┘å╪¼█î╪▒█ò</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <Lightbulb className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                          <div className="font-bold">{hintsUsed.size}</div>
                          <div className="text-xs text-gray-600 sorani-text">╪¬█Ä╪¿█î┘å█î ╪¿█ò┌⌐╪º╪▒┘ç█Ä┘å╪▒╪º┘ê</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                          <div className="font-bold">{fastAnswers}</div>
                          <div className="text-xs text-gray-600 sorani-text">┘ê█ò┌╡╪º┘à█î ╪«█Ä╪▒╪º</div>
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
                        <span className="sorani-text">╪»┘ê┘ê╪¿╪º╪▒█ò ┘ç█ò┘ê┌╡╪¿╪»█ò┘ê█ò</span>
                      </Button>
                    </motion.div>
                  ) : null}
                </div>
            </div>
        )}
    </ResponsiveLayout>
  );
};
