import { GrammarChecker as GrammarCheckerComponent } from "@/components/GrammarChecker";
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckSquare } from "lucide-react";
import { LanguageSelection } from "@/components/LanguageSelection";

const GrammarChecker = () => {
  const { t } = useTranslation();
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  return (
    <div className="min-h-screen bg-gradient-subtle">
      
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <MobileSidebarTrigger />
          <LanguageSelection
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>
        <GrammarCheckerComponent language={selectedLanguage} />
      </main>
    </div>
  );
};

export default GrammarChecker;