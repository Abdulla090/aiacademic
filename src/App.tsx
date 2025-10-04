import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CustomSidebar } from "./components/CustomSidebar";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { MobileSettingsModal } from "./components/MobileSettingsModal";
import { ScrollToTop } from "./components/ScrollToTop";
import { useIsMobile } from "./hooks/use-mobile";
import { TransitionProvider, useTransition } from "./contexts/TransitionContext";
import { LoadingTransition } from "./components/LoadingTransition";
import ErrorBoundary from "./components/ErrorBoundary";
import { PageLoading } from "./components/LoadingSpinner";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
// Eager load essential pages
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/file-converter" element={<ProtectedRoute><FileConverter /></ProtectedRoute>} />
          <Route path="/image-converter" element={<ProtectedRoute><ImageConverter /></ProtectedRoute>} />
          <Route path="/compressor" element={<ProtectedRoute><Compressor /></ProtectedRoute>} />
          <Route path="/citation-generator" element={<ProtectedRoute><CitationGenerator /></ProtectedRoute>} />
          <Route path="/article-writer" element={<ProtectedRoute><ArticleWriter /></ProtectedRoute>} />
          <Route path="/grammar-checker" element={<ProtectedRoute><GrammarChecker /></ProtectedRoute>} />
          <Route path="/report-generator" element={<ProtectedRoute><ReportGenerator /></ProtectedRoute>} />
          <Route path="/task-planner" element={<ProtectedRoute><TaskPlanner /></ProtectedRoute>} />
          <Route path="/summarizer-paraphraser" element={<ProtectedRoute><SummarizerParaphraser /></ProtectedRoute>} />
          <Route path="/mind-map-generator" element={<ProtectedRoute><MindMapGenerator /></ProtectedRoute>} />
          <Route path="/flashcard-generator" element={<ProtectedRoute><FlashcardGenerator /></ProtectedRoute>} />
          <Route path="/quiz-generator" element={<ProtectedRoute><QuizGenerator /></ProtectedRoute>} />
          <Route path="/presentation-generator" element={<ProtectedRoute><PresentationGenerator /></ProtectedRoute>} />
          <Route path="/writing-supervisor" element={<ProtectedRoute><WritingSupervisor /></ProtectedRoute>} />
          <Route path="/knowledge-graph" element={<ProtectedRoute><KnowledgeGraphPage /></ProtectedRoute>} />
          <Route path="/ocr-extractor" element={<ProtectedRoute><OCRExtractor /></ProtectedRoute>} />
          <Route path="/kurdish-dialect-translator" element={<ProtectedRoute><KurdishDialectTranslator /></ProtectedRoute>} />
          <Route path="/study-analytics-dashboard" element={<ProtectedRoute><StudyAnalyticsDashboard /></ProtectedRoute>} />
          <Route path="/ai-research-assistant" element={<ProtectedRoute><AIResearchAssistant /></ProtectedRoute>} />
          <Route path="/text-structure-fixer" element={<ProtectedRoute><TextStructureFixerPage /></ProtectedRoute>} />
          <Route path="/ai-content-humanizer" element={<ProtectedRoute><AIContentHumanizer /></ProtectedRoute>} />
          <Route path="/kurdish-font-test" element={<ProtectedRoute><KurdishFontTest /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/chat-with-file" element={<ProtectedRoute><ChatWithFile /></ProtectedRoute>} />
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
            <ScrollToTop />
            <AuthProvider>
              <TransitionProvider>
                <AppContent key={i18n.language} i18n={i18n} />
              </TransitionProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
