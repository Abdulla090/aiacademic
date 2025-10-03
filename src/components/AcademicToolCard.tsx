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

  const cardInnerContent = (
    <>
      <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg transition-all duration-300 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40">
            <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400 transition-all duration-300 group-hover:text-purple-800 dark:group-hover:text-purple-300" />
          </div>
          <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300 group-hover:text-purple-700 dark:group-hover:text-purple-300">{t(title)}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
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

        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-200">{t(description)}</p>
      </CardContent>
      <CardFooter className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        {isComingSoon ? (
          <Badge variant="outline" className="text-xs font-medium">
            {t('comingSoon')}
          </Badge>
        ) : (
          <div className="w-full flex justify-end">
            <Button variant="link" size="sm" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-all duration-300 transform group-hover:translate-x-1">
              {t('open')} &rarr;
            </Button>
          </div>
        )}
      </CardFooter>
      
    </>
  );

  const cardWrapperClass = "h-full flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700";

  const AnimatedCard = ({ children }: { children: React.ReactNode }) => (
    <Card className={`relative h-full overflow-hidden ${cardWrapperClass} animated-border-snake`}>
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