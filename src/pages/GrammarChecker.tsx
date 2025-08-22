import { AcademicHeader } from "@/components/AcademicHeader";
import { GrammarChecker as GrammarCheckerComponent } from "@/components/GrammarChecker";
import { useState } from "react";

const GrammarChecker = () => {
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AcademicHeader />
      
      <main className="container mx-auto px-4 py-8">
        <GrammarCheckerComponent />
      </main>
    </div>
  );
};

export default GrammarChecker;