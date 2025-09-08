import { OCRExtractor } from '@/components/OCRExtractor';
import { useTranslation } from 'react-i18next';

export default function OCRExtractorPage() {
  const { i18n } = useTranslation();
  
  return <OCRExtractor language={i18n.language} />;
}
