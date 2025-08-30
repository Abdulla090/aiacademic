import { Compressor as CompressorComponent } from '../components/Compressor';
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";
import { useTranslation } from 'react-i18next';
import { Minimize } from "lucide-react";

const Compressor = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-subtle">
      
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <MobileSidebarTrigger />
        </div>
        <CompressorComponent />
      </main>
    </div>
  );
};

export default Compressor;