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
      <header className="py-4 px-8 flex justify-between items-center border-b border-border">
        <h1 className="text-2xl font-bold text-primary">{t('appName')}</h1>
        <Link to="/dashboard">
          <Button variant="outline">{t('quickActionsTitle')}</Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center py-20 px-4">
        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 animate-fade-in-down">
          {t('welcomeTitle')}
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl animate-fade-in-up">
          {t('welcomeDescription')}
        </p>
        <Link to="/dashboard">
          <Button size="lg" className="btn-academic-primary group">
            {t('quickActionsTitle')} <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </main>

      {/* Features Section */}
      <section className="py-20 bg-background-secondary">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12">{t('tools')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 rounded-lg border border-border bg-card shadow-lg text-center">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h4 className="text-2xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
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