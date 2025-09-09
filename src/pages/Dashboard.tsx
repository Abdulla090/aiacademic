import { AcademicStats } from "@/components/AcademicStats";
import { AcademicToolCard } from "@/components/AcademicToolCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Filter,
  Grid3X3,
  List,
  Search,
  FileUp,
  Image,
  Minimize,
  Network,
  MessageSquare,
  FileImage,
  Globe,
  BarChart3,
  Bot
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader"; 
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArticleWriter } from "@/components/ArticleWriter";
import { GrammarChecker } from "@/components/GrammarChecker";
import { ReportGenerator } from "@/components/ReportGenerator";
import { TaskPlanner } from "@/components/TaskPlanner";
import { SummarizerParaphraser } from "@/components/SummarizerParaphraser";
import { MindMapGenerator } from "@/components/MindMapGenerator";

const Index = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  interface AcademicTool {
    title: string;
    description: string;
    icon: any;
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
    }
  ];

  const categories = [
    { key: 'all', label: 'categoryAll' },
    { key: 'writing', label: 'categoryWriting' },
    { key: 'editing', label: 'categoryEditing' },
    { key: 'planning', label: 'categoryPlanning' },
    { key: 'study', label: 'categoryStudy' },
    { key: 'presentation', label: 'categoryPresentation' },
    { key: 'verification', label: 'categoryVerification' },
    { key: 'tools', label: 'tools' }
  ];

  const filteredTools = selectedCategory === 'all' 
    ? academicTools 
    : academicTools.filter(tool => tool.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      
      <main className="container mx-auto px-4 py-8">
        <PageHeader />
        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            {t('welcomeTitle')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-2">
            {t('welcomeSubtitle')}
          </p>
          <p className="text-sm sm:text-base text-foreground-secondary max-w-3xl mx-auto leading-relaxed">
            {t('welcomeDescription')}
          </p>
        </div>

        {/* Stats */}
        <AcademicStats />

        {/* Tools Section */}
        <div className="space-y-6">
          {/* Filters and View Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key)}
                  className={`text-xs sm:text-sm ${selectedCategory === category.key ? 'btn-academic-primary' : 'btn-academic-outline'}`}
                >
                  {t(category.label)}
                </Button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-1 border border-border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'btn-academic-primary' : 'btn-academic-outline'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'btn-academic-primary' : 'btn-academic-outline'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative flex-grow w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  className="input-academic pl-10 w-full"
                />
              </div>
            </div>
          </div>

          {/* Tools Grid/List */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredTools.map((tool, index) => (
              <AcademicToolCard
                key={index}
                title={t(tool.title)}
                description={t(tool.description)}
                icon={tool.icon}
                image={tool.image}
                category={t(tool.category)}
                isComingSoon={tool.isComingSoon}
                path={tool.path}
                onClick={() => {
                  if (!tool.isComingSoon) {
                    setCurrentTool(tool.title);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 sm:mt-12 card-academic p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
            {t('quickActionsTitle')}
          </h2>
          <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
            {t('quickActionsSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button className="btn-academic-primary relative overflow-hidden text-sm sm:text-base">
              <span className="relative z-10">{t('newArticle')}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
            </Button>
            <Button className="btn-academic-secondary relative overflow-hidden text-sm sm:text-base">
              <span className="relative z-10">{t('createReport')}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
            </Button>
            <Button className="btn-academic-outline relative overflow-hidden text-sm sm:text-base">
              <span className="relative z-10">{t('checkGrammar')}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;