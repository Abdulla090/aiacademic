import { AcademicHeader } from "@/components/AcademicHeader";
import { MindMapGenerator as MindMapGeneratorComponent } from "@/components/MindMapGenerator";
import { useState } from "react";

const MindMapGenerator = () => {
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AcademicHeader />
      
      <main className="container mx-auto px-4 py-8">
        <MindMapGeneratorComponent />
      </main>
    </div>
  );
};

export default MindMapGenerator;