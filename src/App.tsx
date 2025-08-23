import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ArticleWriter from "./pages/ArticleWriter";
import GrammarChecker from "./pages/GrammarChecker";
import ReportGenerator from "./pages/ReportGenerator";
import TaskPlanner from "./pages/TaskPlanner";
import SummarizerParaphraser from "./pages/SummarizerParaphraser";
import MindMapGenerator from "./pages/MindMapGenerator";
import FlashcardGenerator from "./pages/FlashcardGenerator";
import QuizGenerator from "./pages/QuizGenerator";
import PresentationGenerator from "./pages/PresentationGenerator";
import WritingSupervisor from "./pages/WritingSupervisor";
import withLoading from "./hocs/withLoading";

const queryClient = new QueryClient();

const App = () => {
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

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
