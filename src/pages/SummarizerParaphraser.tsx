import { AcademicHeader } from "@/components/AcademicHeader";
import { SummarizerParaphraser as SummarizerParaphraserComponent } from "@/components/SummarizerParaphraser";
import { useState } from "react";

const SummarizerParaphraser = () => {
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AcademicHeader />
      
      <main className="container mx-auto px-4 py-8">
        <SummarizerParaphraserComponent />
      </main>
    </div>
  );
};

export default SummarizerParaphraser;