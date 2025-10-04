import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, RefreshCw, ChevronLeft, ChevronRight, Shuffle, Heart, Star, Clock, Zap, BookOpen, Target, Trophy, RotateCcw } from 'lucide-react';
import { geminiService, type Flashcard } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { readFileContent } from '@/lib/fileReader';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { ResponsiveLayout, ResponsiveButtonGroup } from '@/components/ui/responsive-layout';
import { useResponsive } from '@/hooks/useResponsive';
import { LanguageSelection } from './LanguageSelection';
import { ConfettiEffect } from '@/components/ui/confetti-effect';
import { AchievementBadge } from '@/components/ui/achievement-badge';
import { ProgressBar } from '@/components/ui/progress-bar';

type StudyMode = 'learning' | 'review' | 'timed';
type CardDifficulty = 'easy' | 'medium' | 'hard' | 'unknown';

interface CardProgress {
  cardId: number;
  difficulty: CardDifficulty;
  reviewCount: number;
  lastReviewed: number;
}

export const FlashcardGenerator = () => {
  const [text, setText] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [responseLanguage, setResponseLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>('learning');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());
  const [favoriteCards, setFavoriteCards] = useState<Set<number>>(new Set());
  const [cardProgress, setCardProgress] = useState<Map<number, CardProgress>>(new Map());
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAchievement, setShowAchievement] = useState<'perfect' | 'streak' | 'master' | 'completion' | null>(null);
  const [reviewedToday, setReviewedToday] = useState(0);
  const [streak, setStreak] = useState(0);
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
    setReviewedToday(0);
    setStreak(0);
  };
  
  const handleNextCard = useCallback(() => {
    setIsFlipped(false);
    setCurrentCard((prev) => {
      const next = (prev + 1) % flashcards.length;
      if (next === 0 && masteredCards.size === flashcards.length) {
        setShowConfetti(true);
        setShowAchievement('completion');
      }
      return next;
    });
    setReviewedToday(prev => prev + 1);
  }, [flashcards.length, masteredCards.size]);
  
  const handlePrevCard = useCallback(() => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  }, [flashcards.length]);

  const handleShuffle = useCallback(() => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentCard(0);
    setIsFlipped(false);
    toast({
      title: 'هەڵوەشایەوە!',
      description: 'فلاشکارتەکان بە هەڵکەوت ڕیزکران',
    });
  }, [flashcards, toast]);

  const handleCardDifficulty = useCallback((difficulty: CardDifficulty) => {
    const progress: CardProgress = {
      cardId: currentCard,
      difficulty,
      reviewCount: (cardProgress.get(currentCard)?.reviewCount || 0) + 1,
      lastReviewed: Date.now()
    };
    
    setCardProgress(new Map(cardProgress.set(currentCard, progress)));
    
    if (difficulty === 'easy') {
      setMasteredCards(new Set([...masteredCards, currentCard]));
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak >= 5) {
          setShowAchievement('streak');
        }
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    if (masteredCards.size + 1 === flashcards.length) {
      setShowAchievement('master');
      setShowConfetti(true);
    }
    
    handleNextCard();
  }, [currentCard, cardProgress, masteredCards, flashcards.length, handleNextCard]);

  const toggleFavorite = useCallback(() => {
    setFavoriteCards(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(currentCard)) {
        newFavorites.delete(currentCard);
      } else {
        newFavorites.add(currentCard);
      }
      return newFavorites;
    });
  }, [currentCard]);

  const resetProgress = () => {
    setMasteredCards(new Set());
    setCardProgress(new Map());
    setStreak(0);
    setReviewedToday(0);
    setCurrentCard(0);
    toast({
      title: 'گەڕایەوە',
      description: 'پێشکەوتنەکە ڕیسێت کرا',
    });
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && studyMode === 'timed') {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, studyMode]);

  // Keyboard shortcuts with debounce
  useEffect(() => {
    if (flashcards.length === 0) return;
    
    let keyPressTimeout: NodeJS.Timeout;
    const handleKeyPress = (e: KeyboardEvent) => {
      // Debounce to prevent multiple rapid triggers
      clearTimeout(keyPressTimeout);
      keyPressTimeout = setTimeout(() => {
        switch(e.key) {
          case 'ArrowRight':
            if (currentCard < flashcards.length - 1) handleNextCard();
            break;
          case 'ArrowLeft':
            if (currentCard > 0) handlePrevCard();
            break;
          case ' ':
            e.preventDefault();
            setIsFlipped(prev => !prev);
            break;
          case '1':
            if (isFlipped) handleCardDifficulty('easy');
            break;
          case '2':
            if (isFlipped) handleCardDifficulty('medium');
            break;
          case '3':
            if (isFlipped) handleCardDifficulty('hard');
            break;
          case 'f':
          case 'F':
            toggleFavorite();
            break;
        }
      }, 50);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearTimeout(keyPressTimeout);
    };
  }, [flashcards.length, currentCard, isFlipped, handleNextCard, handlePrevCard, handleCardDifficulty, toggleFavorite]);

  // Start timer when cards are generated
  useEffect(() => {
    if (flashcards.length > 0 && studyMode === 'timed') {
      setTimerActive(true);
      setTimerSeconds(0);
    }
  }, [flashcards, studyMode]);

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
              <BookOpen className="h-5 w-5" />
              <span className="sorani-text">دروستکەری فلاشکارت</span>
            </div>
            {flashcards.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>{masteredCards.size}/{flashcards.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <span>{streak}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span>{reviewedToday}</span>
                </div>
                {studyMode === 'timed' && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span>{formatTime(timerSeconds)}</span>
                  </div>
                )}
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
          <ResponsiveButtonGroup orientation={isMobile ? "vertical" : "horizontal"}>
            <LanguageSelection
               selectedLanguage={responseLanguage}
               onLanguageChange={setResponseLanguage}
            />
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
            <div className={`${isMobile ? 'mt-4' : 'mt-8'} space-y-4`}>
                {/* Study Mode Selector */}
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button
                    variant={studyMode === 'learning' ? 'default' : 'outline'}
                    onClick={() => setStudyMode('learning')}
                    size="sm"
                    className="gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="sorani-text">فێربوون</span>
                  </Button>
                  <Button
                    variant={studyMode === 'review' ? 'default' : 'outline'}
                    onClick={() => setStudyMode('review')}
                    size="sm"
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="sorani-text">پێداچوونەوە</span>
                  </Button>
                  <Button
                    variant={studyMode === 'timed' ? 'default' : 'outline'}
                    onClick={() => {
                      setStudyMode('timed');
                      setTimerActive(true);
                      setTimerSeconds(0);
                    }}
                    size="sm"
                    className="gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="sorani-text">کاتدار</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShuffle}
                    size="sm"
                    className="gap-2"
                  >
                    <Shuffle className="h-4 w-4" />
                    <span className="sorani-text">هەڵوەشان</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetProgress}
                    size="sm"
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="sorani-text">ڕیسێت</span>
                  </Button>
                </div>

                {/* Progress Bar */}
                <ProgressBar 
                  current={masteredCards.size} 
                  total={flashcards.length}
                  variant="gradient"
                />

                {/* Flashcard Display */}
                <div className={`relative ${isMobile ? 'h-64' : 'h-80'} perspective-1000`}>
                    {/* Favorite Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite();
                      }}
                      className="absolute top-2 right-2 z-10"
                    >
                      <Heart 
                        className={`h-5 w-5 transition-colors ${favoriteCards.has(currentCard) ? 'fill-red-500 text-red-500' : ''}`} 
                      />
                    </Button>

                    {/* Mastered Badge */}
                    {masteredCards.has(currentCard) && (
                      <div className="absolute top-2 left-2 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        <span className="sorani-text">شارەزا</span>
                      </div>
                    )}

                    {/* Card itself */}
                    <div
                        className={`w-full h-full cursor-pointer touch-manipulation transition-transform duration-500 preserve-3d`}
                        onClick={() => setIsFlipped(!isFlipped)}
                        style={{
                          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                    >
                        {/* Front Side */}
                        <Card className={`absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800 ${isMobile ? 'p-4' : 'p-8'} flex flex-col items-center justify-center shadow-xl transition-shadow hover:shadow-2xl`}>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 sorani-text">پرسیار</div>
                            <div className={`report-content ${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-center leading-relaxed w-full overflow-auto text-gray-900 dark:text-gray-100`}>
                              {flashcards[currentCard].question}
                            </div>
                            <div className="mt-6 text-xs text-gray-400 dark:text-gray-500 sorani-text">کرتەبکە بۆ وەڵام</div>
                        </Card>

                        {/* Back Side */}
                        <Card className={`absolute w-full h-full backface-hidden bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 border-2 border-green-200 dark:border-green-800 ${isMobile ? 'p-4' : 'p-8'} flex flex-col items-center justify-center shadow-xl transition-shadow hover:shadow-2xl`}
                              style={{ transform: 'rotateY(180deg)' }}>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 sorani-text">وەڵام</div>
                            <div className={`report-content ${isMobile ? 'text-base' : 'text-xl'} text-center leading-relaxed w-full overflow-auto text-gray-900 dark:text-gray-100`}>
                              {flashcards[currentCard].answer}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Difficulty Buttons (when flipped) */}
                <div className={`flex gap-2 justify-center flex-wrap transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden'}`}>
                  <Button
                    onClick={() => handleCardDifficulty('hard')}
                    className="bg-red-500 hover:bg-red-600 gap-2"
                    size="sm"
                  >
                    <span className="sorani-text">سەخت</span>
                  </Button>
                  <Button
                    onClick={() => handleCardDifficulty('medium')}
                    className="bg-orange-500 hover:bg-orange-600 gap-2"
                    size="sm"
                  >
                    <span className="sorani-text">مامناوەند</span>
                  </Button>
                  <Button
                    onClick={() => handleCardDifficulty('easy')}
                    className="bg-green-500 hover:bg-green-600 gap-2"
                    size="sm"
                  >
                    <span className="sorani-text">ئاسان</span>
                  </Button>
                </div>

                {/* Navigation */}
                <ResponsiveButtonGroup orientation="horizontal" className="justify-between">
                  <Button 
                    onClick={handlePrevCard}
                    disabled={currentCard === 0}
                    size={isMobile ? "sm" : "default"}
                    variant="outline"
                    className={`${isMobile ? 'px-3' : 'px-6'} gap-2`}
                  >
                    <ChevronLeft className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                    {!isMobile && <span className="sorani-text">قبلی</span>}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <span className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold px-4 py-2 bg-gray-100 rounded-lg`}>
                      {currentCard + 1} / {flashcards.length}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={handleNextCard}
                    disabled={currentCard === flashcards.length - 1}
                    size={isMobile ? "sm" : "default"}
                    variant="outline"
                    className={`${isMobile ? 'px-3' : 'px-6'} gap-2`}
                  >
                    {!isMobile && <span className="sorani-text">دواتر</span>}
                    <ChevronRight className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  </Button>
                </ResponsiveButtonGroup>

                {/* Keyboard Shortcuts Info */}
                {!isMobile && (
                  <div className="text-xs text-gray-500 text-center space-y-1 mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold mb-2">Keyboard Shortcuts:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>← → : Navigation</div>
                      <div>Space: Flip</div>
                      <div>1, 2, 3: Rate difficulty</div>
                      <div>F: Toggle favorite</div>
                    </div>
                  </div>
                )}
            </div>
        )}
    </ResponsiveLayout>
  );
};