import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp 
} from "lucide-react";

export const AcademicStats = () => {
  const stats = [
    {
      title: "پڕۆژەکانی ئەنجامدراو",
      titleEn: "Completed Projects",
      value: "24",
      icon: CheckCircle,
      progress: 85,
      color: "text-success"
    },
    {
      title: "بەڵگەکانی نووسراو",
      titleEn: "Documents Created", 
      value: "156",
      icon: FileText,
      progress: 72,
      color: "text-primary"
    },
    {
      title: "کاتی خوێندن",
      titleEn: "Study Hours",
      value: "342",
      icon: Clock,
      progress: 90,
      color: "text-accent"
    },
    {
      title: "پێشکەوتنی مانگانە",
      titleEn: "Monthly Progress",
      value: "94%",
      icon: TrendingUp,
      progress: 94,
      color: "text-secondary"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="card-academic p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${
              stat.color === 'text-success' ? 'from-success/10 to-success/5' :
              stat.color === 'text-primary' ? 'from-primary/10 to-primary/5' :
              stat.color === 'text-accent' ? 'from-accent/10 to-accent/5' :
              'from-secondary/10 to-secondary/5'
            }`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground sorani-text">
              {stat.title}
            </div>
            <div className="text-xs text-muted-foreground latin-text">
              {stat.titleEn}
            </div>
            <Progress 
              value={stat.progress} 
              className="h-2"
            />
          </div>
        </Card>
      ))}
    </div>
  );
};