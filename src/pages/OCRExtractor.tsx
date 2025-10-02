import { OCRExtractor } from '@/components/OCRExtractor';
import { BackButton } from '@/components/BackButton';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";

export default function OCRExtractorPage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-subtle bg-purple-grid">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <BackButton />
        </div>
        <OCRExtractor />
      </main>
    </div>
  );
}
