import { useAuth } from '@/contexts/AuthContext';
import { Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const CreditDisplay = () => {
  const { credits, loading } = useAuth();

  if (loading) return null;

  return (
    <Badge className="bg-gradient-primary text-primary-foreground px-3 py-1.5">
      <Coins className="h-4 w-4 mr-1.5" />
      <span className="font-bold">{credits}</span>
      <span className="mx-1 opacity-75">کریدیت</span>
    </Badge>
  );
};
