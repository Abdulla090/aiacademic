import { useTranslation } from "react-i18next";
import { GraduationCap, Shield, Users, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <PageHeader />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-10 sm:py-12 mb-8 sm:mb-12 rounded-2xl">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-2xl text-primary-foreground mb-4 sm:mb-6">
              <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">{t('about')}</h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('aboutSubtitle')}
            </p>
          </div>
        </div>

        {/* About Content */}
        <div className="max-w-4xl mx-auto">
          <div className="card-academic p-6 sm:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">{t('ourMission')}</h2>
            <div className="prose prose-base sm:prose-lg text-foreground-secondary max-w-none">
              <p className="mb-4 sm:mb-6 leading-relaxed">
                {t('aboutMission')}
              </p>
              <p className="mb-4 sm:mb-6 leading-relaxed">
                {t('aboutCreator')}
              </p>
              <p className="leading-relaxed">
                {t('aboutVision')}
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="card-academic p-5 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-primary-foreground">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{t('freeAccess')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{t('freeAccessDescription')}</p>
            </div>
            
            <div className="card-academic p-5 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-secondary-foreground">
                <Users className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{t('community')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{t('communityDescription')}</p>
            </div>
            
            <div className="card-academic p-5 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-accent-foreground">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{t('knowledge')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{t('knowledgeDescription')}</p>
            </div>
          </div>

          {/* Creator Message */}
          <div className="card-academic p-6 sm:p-8 bg-gradient-subtle border-primary/20">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">{t('creatorsMessage')}</h2>
            <div className="prose prose-base sm:prose-lg text-foreground-secondary max-w-none">
              <p className="mb-4 sm:mb-6 leading-relaxed italic">
                "{t('creatorsMessageText')}"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mr-3 sm:mr-4 text-sm sm:text-base">
                  AA
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm sm:text-base">Abdulla Aziz</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">{t('creatorTitle')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;