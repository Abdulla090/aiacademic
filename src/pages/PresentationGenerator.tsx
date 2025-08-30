import { PresentationGenerator as PresentationGeneratorComponent } from '@/components/PresentationGenerator';
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";
import { useTranslation } from 'react-i18next';
import { Presentation } from "lucide-react";

const PresentationGenerator = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-subtle">
      
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <MobileSidebarTrigger />
        </div>
        <PresentationGeneratorComponent />
      </main>
    </div>
  );
};

export default PresentationGenerator;