import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, BrainCircuit } from "lucide-react";

const LandingPage = () => {
  const { t } = useTranslation();

  const features = [
    { title: t('articleWriter'), description: t('articleWriterDescription'), icon: <BrainCircuit className="h-8 w-8 text-primary" /> },
    { title: t('grammarChecker'), description: t('grammarCheckerDescription'), icon: <CheckCircle className="h-8 w-8 text-primary" /> },
    { title: t('mindMapGenerator'), description: t('mindMapGeneratorDescription'), icon: <BrainCircuit className="h-8 w-8 text-primary" /> },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="py-3 sm:py-4 px-4 sm:px-8 flex justify-between items-center border-b border-border">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{t('appName')}</h1>
        <Link to="/dashboard">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">{t('quickActionsTitle')}</Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center py-12 sm:py-16 md:py-20 px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 animate-fade-in-down">
          {t('welcomeTitle')}
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl animate-fade-in-up">
          {t('welcomeDescription')}
        </p>
        <Link to="/dashboard">
          <Button size="lg" className="btn-academic-primary group text-sm sm:text-base">
            {t('quickActionsTitle')} <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </main>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background-secondary">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">{t('tools')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-5 sm:p-6 md:p-8 rounded-lg border border-border bg-card shadow-lg text-center">
                <div className="flex justify-center mb-3 sm:mb-4">{feature.icon}</div>
                <h4 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {t('appName')}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;