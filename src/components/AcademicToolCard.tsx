import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { OptimizedImage } from "./OptimizedImage";

interface AcademicToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  image?: string;
  category: string;
  isComingSoon?: boolean;
  path?: string;
  onClick?: () => void;
}

export const AcademicToolCard = ({
  title,
  description,
  icon: Icon,
  image,
  category,
  isComingSoon = false,
  path,
  onClick
}: AcademicToolCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (isComingSoon) return;
    
    if (path) {
      navigate(path);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Card className="card-academic group cursor-pointer hover:scale-[1.02] transition-all duration-300" onClick={handleClick}>
      <div className="p-6">
        {image ? (
          <>
            <div className="mb-4 rounded-lg overflow-hidden aspect-video">
              <OptimizedImage
                src={image}
                alt={title}
                className="w-full h-full object-cover"
                placeholderClassName="w-full h-full"
                lazy={true}
              />
            </div>
            <div className="space-y-2 mb-4">
              <Badge variant="secondary" className="mb-2 text-xs">
                {t(category)}
              </Badge>
              <h3 className="text-lg font-semibold text-card-foreground mb-1">
                {t(title)}
              </h3>
              <p className="text-sm text-card-foreground sorani-text leading-relaxed">
                {t(description)}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-primary rounded-xl text-primary-foreground group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {t(category)}
                  </Badge>
                  <h3 className="text-lg font-semibold text-card-foreground mb-1">
                    {t(title)}
                  </h3>
                  <p className="text-sm text-muted-foreground latin-text">
                    {t(title)}
                  </p>
                </div>
              </div>
              {isComingSoon && (
                <Badge variant="outline" className="text-xs">
                  {t('comingSoon')}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-card-foreground sorani-text leading-relaxed">
                {t(description)}
              </p>
              <p className="text-xs text-muted-foreground latin-text">
                {t(description)}
              </p>
            </div>
          </>
        )}

        <Button
          className={`w-full ${isComingSoon ? 'btn-3d-outline opacity-50' : 'btn-3d-primary'}`}
          disabled={isComingSoon}
        >
          <span className="relative z-10">{isComingSoon ? t('comingSoon') : t('open')}</span>
        </Button>
      </div>
    </Card>
  );
};