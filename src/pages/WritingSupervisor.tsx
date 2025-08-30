import { WritingSupervisor as WritingSupervisorComponent } from '@/components/WritingSupervisor';
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";
import { useTranslation } from 'react-i18next';
import { PenTool } from "lucide-react";

const WritingSupervisor = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-subtle">
      
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <MobileSidebarTrigger />
        </div>
        <WritingSupervisorComponent />
      </main>
    </div>
  );
};

export default WritingSupervisor;