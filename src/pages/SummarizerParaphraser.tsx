import { AcademicHeader } from "@/components/AcademicHeader";
import { SummarizerParaphraser as SummarizerParaphraserComponent } from "@/components/SummarizerParaphraser";
import { useState } from "react";
import { BookOpen } from "lucide-react";

const SummarizerParaphraser = () => {
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AcademicHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-right">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-primary rounded-xl text-primary-foreground">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-bold text-foreground sorani-text">کورتکەرەوە و نووسینەوە</h1>
              </div>
              <p className="text-xl text-muted-foreground mb-6 sorani-text leading-relaxed">
                کورتکردنەوە و نووسینەوەی ئاستی ئەکادیمی بە پاراستنی واتا
              </p>
              <p className="text-lg text-foreground-secondary mb-8 latin-text">
                Academic-level summaries and paraphrasing while preserving meaning
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="bg-card p-4 rounded-lg shadow-sm border">
                  <p className="text-sm text-muted-foreground sorani-text">کورتکردنەوە</p>
                  <p className="font-semibold">ئاستی ئەکادیمی</p>
                </div>
                <div className="bg-card p-4 rounded-lg shadow-sm border">
                  <p className="text-sm text-muted-foreground sorani-text">نووسینەوە</p>
                  <p className="font-semibold">پاراستنی واتا</p>
                </div>
                <div className="bg-card p-4 rounded-lg shadow-sm border">
                  <p className="text-sm text-muted-foreground sorani-text">فۆرمات</p>
                  <p className="font-semibold">TXT, PDF, DOCX</p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-primary rounded-2xl shadow-xl transform rotate-6"></div>
                <div className="w-64 h-64 bg-gradient-secondary rounded-2xl shadow-xl absolute top-4 -right-4 transform -rotate-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <SummarizerParaphraserComponent />
      </main>
    </div>
  );
};

export default SummarizerParaphraser;