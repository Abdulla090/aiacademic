import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AcademicToolCardProps {
  title: string;
  titleKurdish: string;
  description: string;
  descriptionKurdish: string;
  icon: LucideIcon;
  category: string;
  categoryKurdish: string;
  isComingSoon?: boolean;
  path?: string;
  onClick?: () => void;
}

export const AcademicToolCard = ({
  title,
  titleKurdish,
  description,
  descriptionKurdish,
  icon: Icon,
  category,
  categoryKurdish,
  isComingSoon = false,
  path,
  onClick
}: AcademicToolCardProps) => {
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
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-primary rounded-xl text-primary-foreground group-hover:scale-110 transition-transform duration-300">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-2 text-xs">
                {categoryKurdish}
              </Badge>
              <h3 className="text-lg font-semibold text-card-foreground mb-1">
                {titleKurdish}
              </h3>
              <p className="text-sm text-muted-foreground latin-text">
                {title}
              </p>
            </div>
          </div>
          {isComingSoon && (
            <Badge variant="outline" className="text-xs">
              بەزووی
            </Badge>
          )}
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-sm text-card-foreground sorani-text leading-relaxed">
            {descriptionKurdish}
          </p>
          <p className="text-xs text-muted-foreground latin-text">
            {description}
          </p>
        </div>

        <Button
          className={`w-full ${isComingSoon ? 'btn-academic-outline opacity-50' : 'btn-academic-primary'}`}
          disabled={isComingSoon}
        >
          {isComingSoon ? 'بەزووی دێت' : 'کردنەوە'}
        </Button>
      </div>
    </Card>
  );
};