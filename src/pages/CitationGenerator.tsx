import { CitationGenerator as CitationGeneratorComponent } from '../components/CitationGenerator';
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";
import { useTranslation } from 'react-i18next';
import { BookOpen } from "lucide-react";

const CitationGenerator = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-subtle">
      
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <MobileSidebarTrigger />
        </div>
        <CitationGeneratorComponent />
      </main>
    </div>
  );
};

export default CitationGenerator;