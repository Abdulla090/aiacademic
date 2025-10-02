import { ImageConverter as ImageConverterComponent } from '../components/ImageConverter';
import { MobileSidebarTrigger } from "@/components/MobileSidebarTrigger";
import { BackButton } from "@/components/BackButton";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { Image } from "lucide-react";

const ImageConverter = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-subtle bg-purple-grid">
      
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <BackButton />
          <MobileSidebarTrigger />
        </div>
        <ImageConverterComponent />
      </main>
    </div>
  );
};

export default ImageConverter;