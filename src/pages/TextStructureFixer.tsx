import { useTranslation } from 'react-i18next';
import { TextStructureFixer } from '@/components/TextStructureFixer';

const TextStructureFixerPage = () => {
  const { i18n } = useTranslation();
  
  return <TextStructureFixer language={i18n.language} />;
};

export default TextStructureFixerPage;