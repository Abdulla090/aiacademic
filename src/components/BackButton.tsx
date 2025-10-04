import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface BackButtonProps {
  to?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  useHistory?: boolean; // New prop to control history-based navigation
}

// Map each tool route to its category in the dashboard
const toolToCategoryMap: Record<string, string> = {
  '/article-writer': 'Writing',
  '/report-generator': 'Writing',
  '/grammar-checker': 'Writing',
  '/writing-supervisor': 'Writing',
  '/text-structure-fixer': 'Writing',
  '/ai-content-humanizer': 'Writing',
  '/summarizer-paraphraser': 'Study',
  '/flashcard-generator': 'Study',
  '/quiz-generator': 'Study',
  '/study-analytics-dashboard': 'Study',
  '/ai-research-assistant': 'Study',
  '/mind-map-generator': 'Study',
  '/task-planner': 'General',
  '/presentation-generator': 'Presentation',
  '/file-converter': 'Tools',
  '/image-converter': 'Tools',
  '/compressor': 'Tools',
  '/citation-generator': 'Tools',
  '/knowledge-graph': 'Tools',
  '/ocr-extractor': 'Tools',
  '/chat-with-file': 'Tools',
  '/kurdish-dialect-translator': 'Tools',
};

export const BackButton = ({ 
  to, 
  variant = "outline", 
  size = "default",
  className = "",
  useHistory = true // Default to using browser history
}: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const handleClick = () => {
    // If a specific 'to' path is provided, use it
    if (to) {
      navigate(to);
      return;
    }

    // Check if current path is a tool and we should navigate to its category
    const currentPath = location.pathname;
    const category = toolToCategoryMap[currentPath];
    
    if (category) {
      // Navigate to dashboard with the category selected
      navigate('/dashboard', { state: { selectedCategory: category } });
      return;
    }

    // If useHistory is true and there's history to go back to
    if (useHistory && window.history.length > 1) {
      navigate(-1); // Go back one step in history
    } else {
      // Fallback to dashboard
      navigate('/dashboard');
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleClick}
      className={className}
    >
      {isRTL ? (
        <>
          {t('back', 'Back')}
          <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
        </>
      ) : (
        <>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back', 'Back')}
        </>
      )}
    </Button>
  );
};