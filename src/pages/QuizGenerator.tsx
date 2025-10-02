import { QuizGenerator as QuizGeneratorComponent } from '@/components/QuizGenerator';
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";
import { BackButton } from "@/components/BackButton";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

const QuizGenerator = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-subtle bg-purple-grid">
      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mb-6 sm:mb-8 flex justify-between items-center">
          <BackButton />
          <MobileSidebarTrigger />
        </div>
        <QuizGeneratorComponent />
      </main>
    </div>
  );
};

export default QuizGenerator;