import { useState, useCallback, useRef } from 'react';

interface UseStreamingTextOptions {
  onComplete?: (finalText: string) => void;
  onError?: (error: Error) => void;
}

interface UseStreamingTextReturn {
  text: string;
  isStreaming: boolean;
  startStreaming: () => void;
  stopStreaming: () => void;
  resetStreaming: () => void;
  appendChunk: (chunk: string) => void;
  completeStreaming: () => void;
}

export const useStreamingText = ({
  onComplete,
  onError
}: UseStreamingTextOptions = {}): UseStreamingTextReturn => {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingRef = useRef(false);
  const textRef = useRef('');

  const startStreaming = useCallback(() => {
    setIsStreaming(true);
    streamingRef.current = true;
  }, []);

  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    streamingRef.current = false;
  }, []);

  const resetStreaming = useCallback(() => {
    setText('');
    textRef.current = '';
    setIsStreaming(false);
    streamingRef.current = false;
  }, []);

  const appendChunk = useCallback((chunk: string) => {
    if (!streamingRef.current) return;
    
    textRef.current += chunk;
    setText(textRef.current);
  }, []);

  const completeStreaming = useCallback(() => {
    setIsStreaming(false);
    streamingRef.current = false;
    onComplete?.(textRef.current);
  }, [onComplete]);

  return {
    text,
    isStreaming,
    startStreaming,
    stopStreaming,
    resetStreaming,
    appendChunk,
    completeStreaming
  };
};

export default useStreamingText;
