import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Coins, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ToolHeaderProps {
  toolName: string;
  creditCost: number;
  icon?: React.ReactNode;
}

export const ToolHeader = ({ toolName, creditCost, icon }: ToolHeaderProps) => {
  const { credits } = useAuth();
  const canUse = credits >= creditCost;

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h2 className="text-xl md:text-2xl font-bold">{toolName}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-primary text-primary-foreground px-3 py-1.5">
            <Coins className="h-4 w-4 mr-1.5" />
            <span className="font-bold">{credits}</span>
            <span className="mx-1 opacity-75">کریدیت</span>
          </Badge>
          <Badge variant={canUse ? "secondary" : "destructive"} className="px-3 py-1.5">
            <span className="text-xs">تێچوو:</span>
            <span className="font-bold mx-1">{creditCost}</span>
            <Coins className="h-3 w-3" />
          </Badge>
        </div>
      </div>
      
      {!canUse && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            کریدیتت بەس نییە! پێویستت بە <span className="font-bold">{creditCost}</span> کریدیتە، بەڵام تەنها <span className="font-bold">{credits}</span> کریدیتت هەیە.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
