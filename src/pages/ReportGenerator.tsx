import { AcademicHeader } from "@/components/AcademicHeader";
import { ReportGenerator as ReportGeneratorComponent } from "@/components/ReportGenerator";
import { useState } from "react";

const ReportGenerator = () => {
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AcademicHeader />
      
      <main className="container mx-auto px-4 py-8">
        <ReportGeneratorComponent />
      </main>
    </div>
  );
};

export default ReportGenerator;