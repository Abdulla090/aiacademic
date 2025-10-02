import { useTranslation } from 'react-i18next';
import { TextStructureFixer } from '@/components/TextStructureFixer';
import { BackButton } from '@/components/BackButton';
import { useNavigate } from "react-router-dom";

const TextStructureFixerPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-subtle bg-purple-grid">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <BackButton />
        </div>
        <TextStructureFixer />
      </main>
    </div>
  );
};

export default TextStructureFixerPage;