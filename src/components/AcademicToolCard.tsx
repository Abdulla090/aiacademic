import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { OptimizedImage } from "./OptimizedImage";


interface AcademicToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  image?: string;
  category?: string;
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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const cardInnerContent = (
    <>
      <CardHeader className="p-4 border-b border-border">
        <div style={{ textAlign: isRTL ? 'right' : 'left', width: '100%' }}>
          <CardTitle className="text-base font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">{t(title)}</CardTitle>
          {category && (
            <Badge variant="secondary" className="text-xs mt-1 bg-secondary/10 text-primary border-secondary/20">
              {t(category)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4" style={{ textAlign: isRTL ? 'right' : 'left' }}>
        {image ? (
          <div className="mb-4 rounded-lg overflow-hidden aspect-video">
            <OptimizedImage
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              placeholderClassName="w-full h-full"
              lazy={true}
            />
          </div>
        ) : null}

        <p className="text-sm text-muted-foreground leading-relaxed transition-colors duration-300 group-hover:text-foreground" style={{ textAlign: isRTL ? 'right' : 'left' }}>{t(description)}</p>
      </CardContent>
      <CardFooter className="p-4 bg-background-secondary border-t border-border">
        {isComingSoon ? (
          <div className={`w-full flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
            <Badge variant="outline" className="text-xs font-medium">
              {t('comingSoon')}
            </Badge>
          </div>
        ) : (
          <div className={`w-full flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
            <Button size="sm" className="btn-3d-primary font-semibold">
              {t('open')}
            </Button>
          </div>
        )}
      </CardFooter>
      
    </>
  );

  const cardWrapperClass = "h-full flex-col bg-card rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300";

  const AnimatedCard = ({ children }: { children: React.ReactNode }) => (
    <Card 
      className={`relative h-full overflow-hidden ${cardWrapperClass} animated-border-snake`}
      style={{
        borderColor: 'hsl(265 60% 50% / 0.7)',
        borderWidth: '2px'
      }}
    >
      <span></span>
      <span></span>
      {children}
    </Card>
  );

  if (isComingSoon || !path) {
    return (
      <div onClick={onClick} className="relative h-full group transition-transform duration-300 hover:-translate-y-1">
        <AnimatedCard>{cardInnerContent}</AnimatedCard>
      </div>
    );
  }

  return (
    <Link to={path} className="relative h-full block group transition-transform duration-300 hover:-translate-y-1">
      <AnimatedCard>{cardInnerContent}</AnimatedCard>
    </Link>
  );
};