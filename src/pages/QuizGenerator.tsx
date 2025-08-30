import { QuizGenerator as QuizGeneratorComponent } from '@/components/QuizGenerator';
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";
import { useTranslation } from 'react-i18next';
import { FileText } from "lucide-react";

const QuizGenerator = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-subtle">
      
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <MobileSidebarTrigger />
        </div>
        <QuizGeneratorComponent />
      </main>
    </div>
  );
};

export default QuizGenerator;