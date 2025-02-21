
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useI18n } from '@/i18n/i18n';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { translations, language, setLanguage } = useI18n();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleToggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="p-4 flex justify-end">
        <Button onClick={handleToggleLanguage} variant="ghost">
          <Globe className="h-4 w-4" />
        </Button>
      </nav>
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{translations.notFound.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{translations.notFound.description}</p>
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            {translations.notFound.returnHome}
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
