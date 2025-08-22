import { AcademicHeader } from "@/components/AcademicHeader";
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
  Search
} from "lucide-react";
import { useState } from "react";
import { ArticleWriter } from "@/components/ArticleWriter";
import { GrammarChecker } from "@/components/GrammarChecker";
import { ReportGenerator } from "@/components/ReportGenerator";
import { TaskPlanner } from "@/components/TaskPlanner";
import { SummarizerParaphraser } from "@/components/SummarizerParaphraser";
import { MindMapGenerator } from "@/components/MindMapGenerator";

const Index = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  interface AcademicTool {
    title: string;
    titleKurdish: string;
    description: string;
    descriptionKurdish: string;
    icon: any;
    category: string;
    categoryKurdish: string;
    isComingSoon?: boolean;
    path?: string;
  }

  const academicTools: AcademicTool[] = [
    {
      title: "Article Writer",
      titleKurdish: "نووسەری بابەت",
      description: "Generate well-structured academic articles with citation support (APA, MLA, IEEE)",
      descriptionKurdish: "دروستکردنی بابەتی ئەکادیمی بە پێکهاتەیەکی باش لەگەڵ پاڵپشتی سەرچاوەکان",
      icon: PenTool,
      category: "writing",
      categoryKurdish: "نووسین",
      path: "/article-writer"
    },
    {
      title: "Report Generator",
      titleKurdish: "دروستکەری ڕاپۆرت",
      description: "Interactive system that guides you through creating comprehensive research reports",
      descriptionKurdish: "سیستەمێکی کارلێکەرانە کە ڕێنمایت دەکات بۆ دروستکردنی ڕاپۆرتی تەواو",
      icon: FileText,
      category: "writing",
      categoryKurdish: "نووسین",
      path: "/report-generator"
    },
    {
      title: "Grammar Checker",
      titleKurdish: "پشکنەری ڕێزمان",
      description: "Advanced grammar and style correction for Kurdish Sorani academic writing",
      descriptionKurdish: "ڕاستکردنەوەی ڕێزمان و ستایلی پێشکەوتوو بۆ نووسینی ئەکادیمی بە سۆرانی",
      icon: CheckSquare,
      category: "editing",
      categoryKurdish: "دەستکاری",
      path: "/grammar-checker"
    },
    {
      title: "Mind Map Generator",
      titleKurdish: "دروستکەری نەخشەی مێشک",
      description: "Transform your ideas into dynamic Kurdish mind maps for brainstorming",
      descriptionKurdish: "گۆڕینی بیرۆکەکانت بۆ نەخشەی مێشکی کوردی بۆ وەرگرتنی بیرۆکە",
      icon: Brain,
      category: "planning",
      categoryKurdish: "پلاندانان",
      path: "/mind-map-generator"
    },
    {
      title: "Summarizer & Paraphraser",
      titleKurdish: "کورتکەرەوە و نووسینەوە",
      description: "Academic-level summaries and paraphrasing while preserving meaning",
      descriptionKurdish: "کورتکردنەوە و نووسینەوەی ئاستی ئەکادیمی بە پاراستنی واتا",
      icon: BookOpen,
      category: "editing",
      categoryKurdish: "دەستکاری",
      path: "/summarizer-paraphraser"
    },
    {
      title: "Plagiarism Checker",
      titleKurdish: "پشکنەری دزینی نووسراو",
      description: "Identify duplicated text and suggest original alternatives in Kurdish",
      descriptionKurdish: "ناسینەوەی نووسینی دووبارەبووەوە و پێشنیارکردنی جیاوازی ڕەسەن",
      icon: Shield,
      category: "verification",
      categoryKurdish: "پشتڕاستکردنەوە",
      isComingSoon: true
    },
    {
      title: "Flashcard Generator",
      titleKurdish: "دروستکەری کارتی خوێندن",
      description: "Create study flashcards from your notes and textbooks",
      descriptionKurdish: "دروستکردنی کارتی خوێندن لە تێبینی و کتێبەکانتەوە",
      icon: CreditCard,
      category: "study",
      categoryKurdish: "خوێندن",
      path: "/flashcard-generator"
    },
    {
      title: "Quiz Generator",
      titleKurdish: "دروستکەری کویز",
      description: "Generate quizzes from your notes and textbooks",
      descriptionKurdish: "دروستکردنی کویز لە تێبینی و کتێبەکانتەوە",
      icon: FileText,
      category: "study",
      categoryKurdish: "خوێندن",
      path: "/quiz-generator"
    },
    {
      title: "Presentation Generator",
      titleKurdish: "دروستکەری پێشکەشکردن",
      description: "Create academic presentations with structured formatting",
      descriptionKurdish: "دروستکردنی پێشکەشکردنی ئەکادیمی بە پێکهاتەیەکی ڕێکخراو",
      icon: Presentation,
      category: "presentation",
      categoryKurdish: "پێشکەشکردن",
      path: "/presentation-generator"
    },
    {
      title: "Task & Research Planner",
      titleKurdish: "پلانەری ئەرک و تویژینەوە",
      description: "Timeline-based planner for assignments and research projects",
      descriptionKurdish: "پلانەری خێڵی کاتی بۆ ئەرکەکان و پڕۆژەی تویژینەوە",
      icon: Calendar,
      category: "planning",
      categoryKurdish: "پلاندانان",
      path: "/task-planner"
    },
    {
      title: "AI Writing Supervisor",
      titleKurdish: "سەرپەرشتیاری نووسینی زیرەک",
      description: "Get real-time feedback and suggestions as you write.",
      descriptionKurdish: "پێشنیار و تێبینی ڕاستەوخۆ وەربگرە لەکاتی نووسیندا.",
      icon: PenTool,
      category: "writing",
      categoryKurdish: "نووسین",
      path: "/writing-supervisor"
    }
  ];

  const categories = [
    { key: 'all', label: 'هەموو', labelEn: 'All' },
    { key: 'writing', label: 'نووسین', labelEn: 'Writing' },
    { key: 'editing', label: 'دەستکاری', labelEn: 'Editing' },
    { key: 'planning', label: 'پلاندانان', labelEn: 'Planning' },
    { key: 'study', label: 'خوێندن', labelEn: 'Study' },
    { key: 'presentation', label: 'پێشکەشکردن', labelEn: 'Presentation' },
    { key: 'verification', label: 'پشتڕاستکردنەوە', labelEn: 'Verification' }
  ];

  const filteredTools = selectedCategory === 'all' 
    ? academicTools 
    : academicTools.filter(tool => tool.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AcademicHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 sorani-text">
            بەخێربێیت بۆ کارەبای ئەکادیمی
          </h1>
          <p className="text-xl text-muted-foreground mb-2 latin-text">
            Welcome to Academic Assistant
          </p>
          <p className="text-lg text-foreground-secondary max-w-3xl mx-auto sorani-text leading-relaxed">
            ئامرازێکی تەواو بۆ پاڵپشتیکردنی خوێندکارانی زانکۆ و ئامادەیی بۆ نووسین، تویژینەوە و خوێندنی باشتر
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
                  className="text-sm"
                >
                  {category.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 border border-border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="گەڕان لە ئامرازەکاندا..."
                  className="input-academic pl-10 w-64"
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
                title={tool.title}
                titleKurdish={tool.titleKurdish}
                description={tool.description}
                descriptionKurdish={tool.descriptionKurdish}
                icon={tool.icon}
                category={tool.category}
                categoryKurdish={tool.categoryKurdish}
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
        <div className="mt-12 card-academic p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4 sorani-text">
            دەست بکە بە کارکردن
          </h2>
          <p className="text-muted-foreground mb-6 sorani-text">
            باشترین ئامرازەکان بۆ سەرکەوتنی ئەکادیمیت
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-academic-primary">
              نووسینی بابەتێکی نوێ
            </Button>
            <Button className="btn-academic-secondary">
              دروستکردنی ڕاپۆرت
            </Button>
            <Button className="btn-academic-outline">
              پشکنینی ڕێزمان
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;