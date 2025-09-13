import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TransitionContextType {
  showLoadingTransition: boolean;
  setShowLoadingTransition: (show: boolean) => void;
  isTransitioning: boolean;
  setIsTransitioning: (transitioning: boolean) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
};

interface TransitionProviderProps {
  children: ReactNode;
}

export const TransitionProvider: React.FC<TransitionProviderProps> = ({ children }) => {
  const [showLoadingTransition, setShowLoadingTransition] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <TransitionContext.Provider 
      value={{
        showLoadingTransition,
        setShowLoadingTransition,
        isTransitioning,
        setIsTransitioning
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
};