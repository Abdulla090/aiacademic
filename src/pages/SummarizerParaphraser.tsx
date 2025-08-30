import { SummarizerParaphraser as SummarizerParaphraserComponent } from "@/components/SummarizerParaphraser";
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";

const SummarizerParaphraser = () => {
  const { t } = useTranslation();
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <MobileSidebarTrigger />
        </div>
        <SummarizerParaphraserComponent />
      </main>
    </div>
  );
};

export default SummarizerParaphraser;