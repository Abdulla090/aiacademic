import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface LanguageSelectionProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export const LanguageSelection = ({ selectedLanguage, onLanguageChange }: LanguageSelectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="text-sm font-medium text-muted-foreground">
        {t('responseLanguage')}
      </label>
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger id="language-select" className="w-full">
          <SelectValue placeholder={t('selectLanguage')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="ku">Kurdish</SelectItem>
          <SelectItem value="ar">Arabic</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};