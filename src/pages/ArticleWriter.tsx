import { ArticleWriter as ArticleWriterComponent } from "@/components/ArticleWriter";
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PenTool } from "lucide-react";
import { LanguageSelection } from "@/components/LanguageSelection";

const ArticleWriter = () => {
  const { t } = useTranslation();
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        <ArticleWriterComponent language={selectedLanguage} />
      </main>
    </div>
  );
};

export default ArticleWriter;
