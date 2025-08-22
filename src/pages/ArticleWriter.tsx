import { AcademicHeader } from "@/components/AcademicHeader";
import { ArticleWriter as ArticleWriterComponent } from "@/components/ArticleWriter";
import { useState } from "react";

const ArticleWriter = () => {
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AcademicHeader />
      
      <main className="container mx-auto px-4 py-8">
        <ArticleWriterComponent />
      </main>
    </div>
  );
};

export default ArticleWriter;