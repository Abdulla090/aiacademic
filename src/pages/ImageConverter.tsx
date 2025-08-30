import { ImageConverter as ImageConverterComponent } from '../components/ImageConverter';
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";
import { useTranslation } from 'react-i18next';
import { Image } from "lucide-react";

const ImageConverter = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-subtle">
      
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <MobileSidebarTrigger />
        </div>
        <ImageConverterComponent />
      </main>
    </div>
  );
};

export default ImageConverter;