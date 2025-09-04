import { useState, useEffect, useCallback } from 'react';

interface UseTypingEffectOptions {
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  enabled?: boolean;
}

interface UseTypingEffectReturn {
  displayedText: string;
  isTyping: boolean;
  startTyping: (text: string) => void;
  stopTyping: () => void;
  resetTyping: () => void;
}

export const useTypingEffect = ({
  speed = 30,
  onComplete,
  enabled = true
}: UseTypingEffectOptions = {}): UseTypingEffectReturn => {
  const [displayedText, setDisplayedText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const startTyping = useCallback((text: string) => {
    if (!enabled) {
      setDisplayedText(text);
      onComplete?.();
      return;
    }

    setTargetText(text);
    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(true);
  }, [enabled, onComplete]);

  const stopTyping = useCallback(() => {
    setIsTyping(false);
    if (targetText) {
      setDisplayedText(targetText);
    }
  }, [targetText]);

  const resetTyping = useCallback(() => {
    setDisplayedText('');
    setTargetText('');
    setCurrentIndex(0);
    setIsTyping(false);
  }, []);

  useEffect(() => {
    if (!isTyping || !targetText || currentIndex >= targetText.length) {
      if (isTyping && currentIndex >= targetText.length) {
        setIsTyping(false);
        onComplete?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      // Add the next character
      setDisplayedText(prev => prev + targetText[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isTyping, targetText, currentIndex, speed, onComplete]);

  return {
    displayedText,
    isTyping,
    startTyping,
    stopTyping,
    resetTyping
  };
};

export default useTypingEffect;
