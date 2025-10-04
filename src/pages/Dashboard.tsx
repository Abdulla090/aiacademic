import { AcademicToolCard } from "@/components/AcademicToolCard";
import { Button } from "@/components/ui/button";
import {
  PenTool,
  FileText,
  CheckSquare,
  Brain,
  BookOpen,
  Shield,
  CreditCard,
  Presentation,
  Calendar,
  FileUp,
  Image,
  Minimize,
  LucideIcon,
  Network,
  MessageSquare,
  FileImage,
  Globe,
  BarChart3,
  Bot,
  Wand2,
  Settings
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { MobileSettingsModal } from "@/components/MobileSettingsModal";

const Index = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Check if we're being navigated to with a specific category selected
  useEffect(() => {
    const state = location.state as { selectedCategory?: string };
    if (state?.selectedCategory) {
      setCurrentTool(state.selectedCategory);
      // Clear the state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  interface AcademicTool {
    title: string;
    description: string;
    icon: LucideIcon;
    image?: string;
    category: string;
    isComingSoon?: boolean;
    path?: string;
  }

  const academicTools: AcademicTool[] = [
    {
      title: "articleWriter",
      description: "articleWriterDescription",
      icon: PenTool,
      image: "/card-images/article.png",
      category: "writing",
      path: "/article-writer"
    },
    {
      title: "reportGenerator",
      description: "reportGeneratorDescription",
      icon: FileText,
      image: "/card-images/new-report.png",
      category: "writing",
      path: "/report-generator"
    },
    {
      title: "grammarChecker",
      description: "grammarCheckerDescription",
      icon: CheckSquare,
      image: "/card-images/grammar-fix.jpeg",
      category: "editing",
      path: "/grammar-checker"
    },
    {
      title: "textStructureFixer",
      description: "textStructureFixerDescription",
      icon: Wand2,
      image: "/card-images/grammar-fix.png",
      category: "editing",
      path: "/text-structure-fixer"
    },
    {
      title: "mindMapGenerator",
      description: "mindMapGeneratorDescription",
      icon: Brain,
      image: "/card-images/mindmap.png",
      category: "planning",
      path: "/mind-map-generator"
    },
    {
      title: "summarizerParaphraser",
      description: "summarizerParaphraserDescription",
      icon: BookOpen,
      image: "/card-images/summarizer.png",
      category: "editing",
      path: "/summarizer-paraphraser"
    },
    {
      title: "plagiarismChecker",
      description: "plagiarismCheckerDescription",
      icon: Shield,
      category: "verification",
      isComingSoon: true
    },
    {
      title: "flashcardGenerator",
      description: "flashcardGeneratorDescription",
      icon: CreditCard,
      image: "/card-images/flashcard.png",
      category: "study",
      path: "/flashcard-generator"
    },
    {
      title: "quizGenerator",
      description: "quizGeneratorDescription",
      icon: FileText,
      image: "/card-images/quiz.png",
      category: "study",
      path: "/quiz-generator"
    },
    {
      title: "presentationGenerator",
      description: "presentationGeneratorDescription",
      icon: Presentation,
      image: "/card-images/presentation.jpeg",
      category: "presentation",
      path: "/presentation-generator"
    },
    {
      title: "taskPlanner",
      description: "taskPlannerDescription",
      icon: Calendar,
      category: "planning",
      path: "/task-planner"
    },
    {
      title: "writingSupervisor",
      description: "writingSupervisorDescription",
      icon: PenTool,
      category: "writing",
      path: "/writing-supervisor"
    },
    {
      title: "fileConverter",
      description: "fileConverterDescription",
      icon: FileUp,
      category: "tools",
      path: "/file-converter"
    },
    {
      title: "imageConverter",
      description: "imageConverterDescription",
      icon: Image,
      category: "tools",
      path: "/image-converter"
    },
    {
      title: "compressor",
      description: "compressorDescription",
      icon: Minimize,
      category: "tools",
      path: "/compressor"
    },
    {
      title: "citationGenerator",
      description: "citationGeneratorDescription",
      icon: BookOpen,
      category: "tools",
      path: "/citation-generator"
    },
    {
      title: "knowledgeGraphGenerator",
      description: "knowledgeGraphGeneratorDescription",
      icon: Network,
      category: "tools",
      path: "/knowledge-graph"
    },
    {
      title: "chatWithFile",
      description: "chatWithFileDescription",
      icon: MessageSquare,
      category: "tools",
      path: "/chat-with-file"
    },
    {
      title: "ocrExtractor",
      description: "ocrExtractorDescription",
      icon: FileImage,
      image: "/card-images/imaage-converter.png",
      category: "tools",
      path: "/ocr-extractor"
    },
    {
      title: "kurdishDialectTranslator",
      description: "kurdishDialectTranslatorDescription",
      icon: Globe,
      category: "tools",
      path: "/kurdish-dialect-translator"
    },
    {
      title: "studyAnalyticsDashboard",
      description: "studyAnalyticsDashboardDescription",
      icon: BarChart3,
      category: "study",
      path: "/study-analytics-dashboard"
    },
    {
      title: "aiResearchAssistant",
      description: "aiResearchAssistantDescription",
      icon: Bot,
      category: "study",
      path: "/ai-research-assistant"
    },
    {
      title: "aiContentHumanizer",
      description: "aiContentHumanizerDescription",
      icon: Wand2,
      category: "editing",
      path: "/ai-content-humanizer"
    }
  ];

  const toolsByCategory: { [key: string]: AcademicTool[] } = {
    Writing: academicTools.filter(tool => ["writing", "editing"].includes(tool.category)),
    Study: academicTools.filter(tool => ["study", "planning"].includes(tool.category) && tool.title !== 'taskPlanner' && tool.category !== 'presentation'),
    Tools: academicTools.filter(tool => ["tools", "verification"].includes(tool.category)),
    General: academicTools.filter(tool => tool.title === 'taskPlanner'),
    Presentation: academicTools.filter(tool => tool.category === 'presentation'),
  };

  const categoryOrder = ["Writing", "Study", "Tools", "Presentation", "General"];

  // If a specific category is selected, show the tools within that category
 if (currentTool && toolsByCategory[currentTool]) {
    const selectedCategoryTools = toolsByCategory[currentTool];
    const isRTL = i18n.dir() === 'rtl';
    
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 bg-purple-grid" dir={i18n.dir()}>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-0">{t(currentTool.toLowerCase())}</h1>
          </div>

          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentTool(null)} 
              className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              {isRTL ? '→' : '←'} {t('backToCategories') || 'Back to Categories'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {selectedCategoryTools.map((tool, index) => (
              <AcademicToolCard
                key={index}
                title={t(tool.title)}
                description={t(tool.description)}
                icon={tool.icon}
                category={t(tool.category)}
                isComingSoon={tool.isComingSoon}
                path={tool.path}
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  const categoryCards = categoryOrder.map(categoryName => {
    const tools = toolsByCategory[categoryName];
    if (!tools || tools.length === 0) return null;

    // Create a single card for the category with all its tools
    // We need to define a default icon for the category card
    const getCategoryIcon = (category: string) => {
      switch(category) {
        case 'Writing': return PenTool;
        case 'Study': return BookOpen;
        case 'Tools': return FileUp;
        case 'Presentation': return Presentation;
        case 'General': return Calendar;
        default: return FileText;
      }
    };

    const getCategoryImage = (category: string) => {
      switch(category) {
        case 'Writing': return '/card-images/writting.png';
        case 'Study': return '/card-images/study.jpeg';
        case 'Tools': return '/card-images/tools.jpeg';
        case 'Presentation': return '/card-images/presentation.png';
        case 'General': return '/card-images/general.jpeg';
        default: return undefined;
      }
    };
    return (
      <AcademicToolCard
        key={categoryName}
        title={t(categoryName.toLowerCase())}
        description={`${t(categoryName.toLowerCase())} tools: ${tools.map(tool => t(tool.title)).join(', ')}`}
        icon={getCategoryIcon(categoryName)}
        image={getCategoryImage(categoryName)}
        category={categoryName}
        path={undefined} // Categories don't have a direct path
        onClick={() => {
          // Set current tool to the category name to trigger filtering
          setCurrentTool(categoryName);
        }}
      />
    );
 });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 bg-purple-grid" dir={i18n.dir()}>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-0">{t('academicTools')}</h1>
          <div className="flex items-center">
            <Button onClick={() => setShowSettings(true)} className="btn-3d-primary">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryCards}
        </div>
      </main>
      <MobileSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default Index;