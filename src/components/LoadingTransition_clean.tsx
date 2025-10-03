import React, { useState, useEffect, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OptimizedImage } from './OptimizedImage';

interface LoadingTransitionProps {
  onComplete: () => void;
  duration?: number;
}

export const LoadingTransition: React.FC<LoadingTransitionProps> = ({
  onComplete,
  duration = 2000
}) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Memoize loadingSteps to prevent recreating on every render
  const loadingSteps = useMemo(() => [
    t('loadingAcademicTools'),
    t('loadingImages'),
    t('preparingInterface'),
    t('almostReady')
  ], [t]);

  // Preload images during loading (non-blocking)
  useEffect(() => {
    const imagesToPreload = [
      '/card-images/article.png',
      '/card-images/new-report.png',
      '/card-images/grammar-fix.jpeg',
      '/card-images/mindmap.png',
      '/card-images/summarizer.png'
    ];

    // Preload images asynchronously without blocking the loading progress
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
      // No need to wait for these to complete
    });
  }, []);

  useEffect(() => {
    console.log('LoadingTransition: Starting timer');
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / duration) * 100, 100);
      const stepIndex = Math.min(Math.floor((elapsed / duration) * loadingSteps.length), loadingSteps.length - 1);
      
      setProgress(progressPercent);
      setCurrentStep(stepIndex);

      if (progressPercent >= 100) {
        console.log('LoadingTransition: Completing');
        clearInterval(timer);
        setTimeout(() => {
          console.log('LoadingTransition: Calling onComplete');
          onComplete();
        }, 200);
      }
    }, 50);

    // Absolute safety timeout
    const safetyTimeout = setTimeout(() => {
      console.log('LoadingTransition: Safety timeout triggered');
      clearInterval(timer);
      onComplete();
    }, duration + 500);

    return () => {
      clearInterval(timer);
      clearTimeout(safetyTimeout);
    };
  }, [onComplete, duration, loadingSteps.length]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center z-50">
      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        {/* Logo and Brand */}
        <div className="space-y-4">
          <div className="relative">
            <div className={`p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl transform transition-all duration-700 ${
              progress > 80 ? 'scale-110 rotate-12' : 'scale-100'
            }`}>
              <BrainCircuit className="w-16 h-16 text-white mx-auto" />
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('appName')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t('loadingSubtitle')}
            </p>
          </div>
        </div>

        {/* Loading Progress */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                {loadingSteps[currentStep] || t('ready')}
              </span>
            </div>
            <Progress 
              value={progress} 
              className="w-full h-2 bg-gray-200 dark:bg-gray-700"
            />
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round(progress)}% {t('complete')}
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-3 opacity-60">
          {[
            { icon: '📝', name: t('writingCategory') },
            { icon: '🔧', name: t('editingCategory') },
            { icon: '🧠', name: t('planningCategory') },
            { icon: '📊', name: t('studyCategory') }
          ].map((feature, index) => (
            <div 
              key={index}
              className={`p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-500 ${
                progress > (index * 25) ? 'scale-100 opacity-100' : 'scale-95 opacity-50'
              }`}
            >
              <div className="text-lg mb-1">{feature.icon}</div>
              <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                {feature.name}
              </div>
            </div>
          ))}
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce opacity-30`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + i * 0.5}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};