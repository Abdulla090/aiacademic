import { FlashcardGenerator as FlashcardGeneratorComponent } from '@/components/FlashcardGenerator';
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";
import { useTranslation } from 'react-i18next';
import { CreditCard } from "lucide-react";

const FlashcardGenerator = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mb-6">
          <MobileSidebarTrigger />
        </div>
        <FlashcardGeneratorComponent />
      </main>
    </div>
  );
};

export default FlashcardGenerator;