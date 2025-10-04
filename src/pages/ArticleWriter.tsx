import { ArticleWriter as ArticleWriterComponent } from "@/components/ArticleWriter";
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";
import { BackButton } from "@/components/BackButton";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PenTool } from "lucide-react";
const ArticleWriter = () => {
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
        <ArticleWriterComponent />
      </main>
    </div>
  );
};

export default ArticleWriter;
