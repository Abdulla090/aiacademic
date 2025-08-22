import { AcademicHeader } from "@/components/AcademicHeader";
import { QuizGenerator as QuizGeneratorComponent } from '@/components/QuizGenerator';
import { FileText } from "lucide-react";

const QuizGenerator = () => {
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
                  <FileText className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-bold text-foreground sorani-text">دروستکەری کویز</h1>
              </div>
              <p className="text-xl text-muted-foreground mb-6 sorani-text leading-relaxed">
                دروستکردنی کویز لە تێبینی و کتێبەکانتەوە
              </p>
              <p className="text-lg text-foreground-secondary mb-8 latin-text">
                Generate quizzes from your notes and textbooks
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="bg-card p-4 rounded-lg shadow-sm border">
                  <p className="text-sm text-muted-foreground sorani-text">فۆرماتەکان</p>
                  <p className="font-semibold">TXT, PDF, DOCX, MD</p>
                </div>
                <div className="bg-card p-4 rounded-lg shadow-sm border">
                  <p className="text-sm text-muted-foreground sorani-text">ئۆتۆماتیکی</p>
                  <p className="font-semibold">دروستکردنی خودکار</p>
                </div>
                <div className="bg-card p-4 rounded-lg shadow-sm border">
                  <p className="text-sm text-muted-foreground sorani-text">جۆرەکان</p>
                  <p className="font-semibold">هەڵبژاردن، کورتەکردنەوە</p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-primary rounded-2xl shadow-xl transform rotate-6"></div>
                <div className="w-64 h-64 bg-gradient-secondary rounded-2xl shadow-xl absolute top-4 -right-4 transform -rotate-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="h-16 w-16 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <QuizGeneratorComponent />
      </main>
    </div>
  );
};

export default QuizGenerator;