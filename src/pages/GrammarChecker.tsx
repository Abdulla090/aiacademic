import { GrammarChecker as GrammarCheckerComponent } from "@/components/GrammarChecker";
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";
import { BackButton } from "@/components/BackButton";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CheckSquare } from "lucide-react";
import { LanguageSelection } from "@/components/LanguageSelection";

const GrammarChecker = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-subtle bg-purple-grid">
      
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <BackButton />
          <MobileSidebarTrigger />
        </div>
        <GrammarCheckerComponent />
      </main>
    </div>
  );
};

export default GrammarChecker;