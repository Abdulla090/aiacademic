import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Moon, 
  Sun, 
  Globe, 
  Volume2, 
  Bell, 
  Smartphone,
  Palette,
  Languages,
  Settings2
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface MobileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSettingsModal: React.FC<MobileSettingsModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    // Implement theme switching logic here
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 sorani-text">
            <Settings2 className="h-5 w-5" />
            ڕێکخستنەکان
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Theme Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-purple-600" />
              <Label className="text-sm font-medium sorani-text">ڕووکار</Label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {darkMode ? (
                  <Moon className="h-4 w-4 text-gray-600" />
                ) : (
                  <Sun className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm sorani-text">
                  {darkMode ? 'تاریک' : 'ڕووناک'}
                </span>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={handleThemeToggle}
              />
            </div>
          </div>

          <Separator />

          {/* Language Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-purple-600" />
              <Label className="text-sm font-medium sorani-text">زمان</Label>
            </div>
            <LanguageSwitcher />
          </div>

          <Separator />

          {/* Notifications Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-purple-600" />
              <Label className="text-sm font-medium sorani-text">ئاگادارکردنەوەکان</Label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm sorani-text">ئاگادارکردنەوە چالاک بکە</span>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>

          <Separator />

          {/* Sound Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-purple-600" />
              <Label className="text-sm font-medium sorani-text">دەنگ</Label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm sorani-text">دەنگی سیستەم</span>
              <Switch
                checked={sounds}
                onCheckedChange={setSounds}
              />
            </div>
          </div>

          <Separator />

          {/* App Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-purple-600" />
              <Label className="text-sm font-medium sorani-text">زانیاری ئەپ</Label>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>ڤێرژن: 1.0.0</p>
              <p>Kurdish Academic Hub</p>
              <p>© 2024</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <span className="sorani-text">داخستن</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
