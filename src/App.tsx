import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ArticleWriter from "./pages/ArticleWriter";
import FileConverter from "./pages/FileConverter";
import ImageConverter from "./pages/ImageConverter";
import Compressor from "./pages/Compressor";
import CitationGenerator from "./pages/CitationGenerator";
import GrammarChecker from "./pages/GrammarChecker";
import ReportGenerator from "./pages/ReportGenerator";
import TaskPlanner from "./pages/TaskPlanner";
import SummarizerParaphraser from "./pages/SummarizerParaphraser";
import MindMapGenerator from "./pages/MindMapGenerator";
import FlashcardGenerator from "./pages/FlashcardGenerator";
import QuizGenerator from "./pages/QuizGenerator";
import PresentationGenerator from "./pages/PresentationGenerator";
import KnowledgeGraphPage from "./pages/KnowledgeGraphPage";
import WritingSupervisor from "./pages/WritingSupervisor";
import withLoading from "./hocs/withLoading";
import ChatWithFile from "./pages/ChatWithFile";
import About from "./pages/About";
import { CustomSidebar } from "./components/CustomSidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "./components/ui/sidebar";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showSidebar = location.pathname !== '/';

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
 
  return (
    <SidebarProvider defaultOpen={true}>
      {showSidebar && <CustomSidebar />}
      <SidebarInset>
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
          <Route path="/about" element={<About />} />
          <Route path="/chat-with-file" element={<ChatWithFileWithLoading />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_relativeSplatPath: true }}>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
