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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/article-writer" element={<ArticleWriter />} />
          <Route path="/grammar-checker" element={<GrammarChecker />} />
          <Route path="/report-generator" element={<ReportGenerator />} />
          <Route path="/task-planner" element={<TaskPlanner />} />
          <Route path="/summarizer-paraphraser" element={<SummarizerParaphraser />} />
          <Route path="/mind-map-generator" element={<MindMapGenerator />} />
          <Route path="/flashcard-generator" element={<FlashcardGenerator />} />
          <Route path="/quiz-generator" element={<QuizGenerator />} />
          <Route path="/presentation-generator" element={<PresentationGenerator />} />
          <Route path="/writing-supervisor" element={<WritingSupervisor />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
