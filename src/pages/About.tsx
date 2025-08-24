import { useTranslation } from "react-i18next";
import { GraduationCap } from "lucide-react";
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <MobileSidebarTrigger />
        </div>
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12 mb-12 rounded-2xl">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-2xl text-primary-foreground mb-6">
              <GraduationCap className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">{t('about')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('aboutSubtitle')}
            </p>
          </div>
        </div>

        {/* About Content */}
        <div className="max-w-4xl mx-auto">
          <div className="card-academic p-8 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">{t('ourMission')}</h2>
            <div className="prose prose-lg text-foreground-secondary max-w-none">
              <p className="mb-6 leading-relaxed">
                {t('aboutMission')}
              </p>
              <p className="mb-6 leading-relaxed">
                {t('aboutCreator')}
              </p>
              <p className="leading-relaxed">
                {t('aboutVision')}
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card-academic p-6 text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('freeAccess')}</h3>
              <p className="text-muted-foreground">{t('freeAccessDescription')}</p>
            </div>
            
            <div className="card-academic p-6 text-center">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('community')}</h3>
              <p className="text-muted-foreground">{t('communityDescription')}</p>
            </div>
            
            <div className="card-academic p-6 text-center">
              <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 0 0 1 6.5 2H20v20H6.5a2.5 0 0 1 0-5H20"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('knowledge')}</h3>
              <p className="text-muted-foreground">{t('knowledgeDescription')}</p>
            </div>
          </div>

          {/* Creator Message */}
          <div className="card-academic p-8 bg-gradient-subtle border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-6">{t('creatorsMessage')}</h2>
            <div className="prose prose-lg text-foreground-secondary max-w-none">
              <p className="mb-6 leading-relaxed italic">
                "{t('creatorsMessageText')}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mr-4">
                  AA
                </div>
                <div>
                  <p className="font-semibold text-foreground">Abdulla Aziz</p>
                  <p className="text-muted-foreground">{t('creatorTitle')}</p>
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