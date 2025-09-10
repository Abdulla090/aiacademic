import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Info, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface MobileBottomNavProps {
  onSettingsClick?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onSettingsClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    {
      id: 'home',
      label: 'ماڵەوە',
      labelEn: 'Home',
      icon: Home,
      path: '/dashboard',
      onClick: () => navigate('/dashboard')
    },
    {
      id: 'about',
      label: 'دەربارە',
      labelEn: 'About',
      icon: Info,
      path: '/about',
      onClick: () => navigate('/about')
    },
    {
      id: 'settings',
      label: 'ڕێکخستن',
      labelEn: 'Settings',
      icon: Settings,
      path: '',
      onClick: onSettingsClick,
      disabled: !onSettingsClick
    }
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <div className="mobile-bottom-nav fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
      <div className="flex justify-around items-center py-2 px-4 safe-area-pb">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = item.path ? isActive(item.path) : false;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={item.onClick}
              disabled={item.disabled}
              className={`flex flex-col items-center justify-center gap-1 h-auto py-2 px-3 min-w-0 flex-1 ${
                item.disabled
                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                  : active
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <IconComponent className={`h-5 w-5 ${
                item.disabled
                  ? 'text-gray-400'
                  : active
                    ? 'text-purple-600'
                    : 'text-gray-600'
              }`} />
              <span className={`text-xs font-medium sorani-text truncate ${
                item.disabled
                  ? 'text-gray-400'
                  : active
                    ? 'text-purple-600'
                    : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
