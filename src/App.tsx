import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import withLoading from "./hocs/withLoading";
import { CustomSidebar } from "./components/CustomSidebar";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { MobileSettingsModal } from "./components/MobileSettingsModal";
import { useIsMobile } from "./hooks/use-mobile";
import { TransitionProvider, useTransition } from "./contexts/TransitionContext";
import { LoadingTransition } from "./components/LoadingTransition";
import ErrorBoundary from "./components/ErrorBoundary";
import { PageLoading } from "./components/LoadingSpinner";

// Eager load essential pages
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import About from "./pages/About";

// Lazy load feature pages for better performance
const ArticleWriter = lazy(() => import("./pages/ArticleWriter"));
const FileConverter = lazy(() => import("./pages/FileConverter"));
const ImageConverter = lazy(() => import("./pages/ImageConverter"));
const Compressor = lazy(() => import("./pages/Compressor"));
const CitationGenerator = lazy(() => import("./pages/CitationGenerator"));
const GrammarChecker = lazy(() => import("./pages/GrammarChecker"));
const ReportGenerator = lazy(() => import("./pages/ReportGenerator"));
const TaskPlanner = lazy(() => import("./pages/TaskPlanner"));
const SummarizerParaphraser = lazy(() => import("./pages/SummarizerParaphraser"));
const MindMapGenerator = lazy(() => import("./pages/MindMapGenerator"));
const FlashcardGenerator = lazy(() => import("./pages/FlashcardGenerator"));
const QuizGenerator = lazy(() => import("./pages/QuizGenerator"));
const PresentationGenerator = lazy(() => import("./pages/PresentationGenerator"));
const KnowledgeGraphPage = lazy(() => import("./pages/KnowledgeGraphPage"));
const WritingSupervisor = lazy(() => import("./pages/WritingSupervisor"));
const OCRExtractor = lazy(() => import("./pages/OCRExtractor"));
const ChatWithFile = lazy(() => import("./pages/ChatWithFile"));
const KurdishDialectTranslator = lazy(() => import("./pages/KurdishDialectTranslator"));
const StudyAnalyticsDashboard = lazy(() => import("./pages/StudyAnalyticsDashboard"));
const AIResearchAssistant = lazy(() => import("./pages/AIResearchAssistant"));
const TextStructureFixerPage = lazy(() => import("./pages/TextStructureFixer"));
const AIContentHumanizer = lazy(() => import("./pages/AIContentHumanizer"));
const KurdishFontTest = lazy(() => import("./pages/KurdishFontTest"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoadingFallback = () => (
  <PageLoading text="Loading page..." className="py-20" />
);

const AppContent = ({ i18n }: { i18n: any }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const { showLoadingTransition, setShowLoadingTransition } = useTransition();
  const showSidebar = location.pathname !== '/' && !isMobile;

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
    document.body.classList.toggle('rtl', i18n.dir() === 'rtl');
  }, [i18n, i18n.language]);



  const ArticleWriterWithLoading = withLoading(ArticleWriter);
  const GrammarCheckerWithLoading = withLoading(GrammarChecker);
  const ReportGeneratorWithLoading = withLoading(ReportGenerator);
  const TaskPlannerWithLoading = withLoading(TaskPlanner);
  const SummarizerParaphraserWithLoading = withLoading(SummarizerParaphraser);
  const MindMapGeneratorWithLoading = withLoading(MindMapGenerator);
  const FlashcardGeneratorWithLoading = withLoading(FlashcardGenerator);
  const QuizGeneratorWithLoading = withLoading(QuizGenerator);
  const PresentationGeneratorWithLoading = withLoading(PresentationGenerator);
  const WritingSupervisorWithLoading = withLoading(WritingSupervisor);
  const FileConverterWithLoading = withLoading(FileConverter);
  const ImageConverterWithLoading = withLoading(ImageConverter);
  const CompressorWithLoading = withLoading(Compressor);
  const CitationGeneratorWithLoading = withLoading(CitationGenerator);
  const KnowledgeGraphPageWithLoading = withLoading(KnowledgeGraphPage);
  const ChatWithFileWithLoading = withLoading(ChatWithFile);
  const OCRExtractorWithLoading = withLoading(OCRExtractor);
  const KurdishDialectTranslatorWithLoading = withLoading(KurdishDialectTranslator);
  const StudyAnalyticsDashboardWithLoading = withLoading(StudyAnalyticsDashboard);
  const AIResearchAssistantWithLoading = withLoading(AIResearchAssistant);
  const TextStructureFixerWithLoading = withLoading(TextStructureFixerPage);
  const AIContentHumanizerWithLoading = withLoading(AIContentHumanizer);
  const KurdishFontTestWithLoading = withLoading(KurdishFontTest);
 
  return (
    <>
      {showLoadingTransition && (
        <LoadingTransition
          onComplete={() => setShowLoadingTransition(false)}
        />
      )}
      <SidebarProvider defaultOpen={false}>
        {showSidebar && <CustomSidebar />}
        <SidebarInset className={isMobile ? 'pb-16' : ''}>
        <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/file-converter" element={<FileConverterWithLoading />} />
          <Route path="/image-converter" element={<ImageConverterWithLoading />} />
          <Route path="/compressor" element={<CompressorWithLoading />} />
          <Route path="/citation-generator" element={<CitationGeneratorWithLoading />} />
          <Route path="/article-writer" element={<ArticleWriterWithLoading />} />
          <Route path="/grammar-checker" element={<GrammarCheckerWithLoading />} />
          <Route path="/report-generator" element={<ReportGeneratorWithLoading />} />
          <Route path="/task-planner" element={<TaskPlannerWithLoading />} />
          <Route path="/summarizer-paraphraser" element={<SummarizerParaphraserWithLoading />} />
          <Route path="/mind-map-generator" element={<MindMapGeneratorWithLoading />} />
          <Route path="/flashcard-generator" element={<FlashcardGeneratorWithLoading />} />
          <Route path="/quiz-generator" element={<QuizGeneratorWithLoading />} />
          <Route path="/presentation-generator" element={<PresentationGeneratorWithLoading />} />
          <Route path="/writing-supervisor" element={<WritingSupervisorWithLoading />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraphPageWithLoading />} />
          <Route path="/ocr-extractor" element={<OCRExtractorWithLoading />} />
          <Route path="/kurdish-dialect-translator" element={<KurdishDialectTranslatorWithLoading />} />
          <Route path="/study-analytics-dashboard" element={<StudyAnalyticsDashboardWithLoading />} />
          <Route path="/ai-research-assistant" element={<AIResearchAssistantWithLoading />} />
          <Route path="/text-structure-fixer" element={<TextStructureFixerWithLoading />} />
          <Route path="/ai-content-humanizer" element={<AIContentHumanizerWithLoading />} />
          <Route path="/kurdish-font-test" element={<KurdishFontTestWithLoading />} />
          <Route path="/about" element={<About />} />
          <Route path="/chat-with-file" element={<ChatWithFileWithLoading />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        
        {/* Mobile Bottom Navigation */}
        {isMobile && location.pathname !== '/' && (
          <MobileBottomNav 
            onSettingsClick={() => setShowMobileSettings(true)}
          />
        )}
        
        {/* Mobile Settings Modal */}
        <MobileSettingsModal 
          isOpen={showMobileSettings}
          onClose={() => setShowMobileSettings(false)}
        />
      </SidebarInset>
    </SidebarProvider>
    </>
  );
};

const App = () => {
  const { i18n } = useTranslation();
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true
          }}>
            <TransitionProvider>
              <AppContent key={i18n.language} i18n={i18n} />
            </TransitionProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
