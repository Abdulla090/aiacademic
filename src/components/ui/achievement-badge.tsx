import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Target, Award, Crown } from 'lucide-react';

interface AchievementBadgeProps {
  type: 'perfect' | 'streak' | 'speed' | 'completion' | 'master' | 'first';
  show: boolean;
  onComplete?: () => void;
}

const badgeConfig = {
  perfect: {
    icon: Trophy,
    title: 'تەواو!',
    subtitle: 'نمرەی تەواوت بەدەستهێنا',
    color: 'from-yellow-400 to-orange-500',
    glow: 'shadow-yellow-500/50'
  },
  streak: {
    icon: Zap,
    title: 'زنجیرەی سەرکەوتوو!',
    subtitle: 'بەردەوامبە لەسەر ئەم ڕێگایە',
    color: 'from-purple-400 to-pink-500',
    glow: 'shadow-purple-500/50'
  },
  speed: {
    icon: Star,
    title: 'خێرا!',
    subtitle: 'بە خێرایی وەڵامت داوەتەوە',
    color: 'from-blue-400 to-cyan-500',
    glow: 'shadow-blue-500/50'
  },
  completion: {
    icon: Target,
    title: 'تەواوکرا!',
    subtitle: 'هەموو پرسیارەکانت تەواوکرد',
    color: 'from-green-400 to-emerald-500',
    glow: 'shadow-green-500/50'
  },
  master: {
    icon: Crown,
    title: 'شارەزا!',
    subtitle: 'توانایی زۆری نیشان داوە',
    color: 'from-amber-400 to-yellow-500',
    glow: 'shadow-amber-500/50'
  },
  first: {
    icon: Award,
    title: 'یەکەم جار!',
    subtitle: 'دەستت پێکرد بە گەشتەکەت',
    color: 'from-indigo-400 to-purple-500',
    glow: 'shadow-indigo-500/50'
  }
};

export const AchievementBadge = ({ type, show, onComplete }: AchievementBadgeProps) => {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 50 }}
      animate={show ? { 
        scale: [0, 1.2, 1],
        opacity: 1,
        y: 0
      } : { scale: 0, opacity: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ 
        duration: 0.5,
        times: [0, 0.6, 1],
        ease: 'easeOut'
      }}
      onAnimationComplete={() => {
        if (show && onComplete) {
          setTimeout(onComplete, 2000);
        }
      }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <div className={`bg-gradient-to-br ${config.color} p-8 rounded-2xl shadow-2xl ${config.glow} shadow-lg`}>
        <div className="flex flex-col items-center text-white">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut'
            }}
          >
            <Icon className="w-16 h-16 mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-2 sorani-text">{config.title}</h3>
          <p className="text-sm opacity-90 sorani-text">{config.subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
};
