import CustomError from '@/components/CustomError';
import { useLoadingPopupStore } from '@repo/ui/store/loading.store';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const Error404Page: React.FC = () => {
  const { loadingPopup, setLoadingPopup } = useLoadingPopupStore();
  const {
    i18n: { changeLanguage, language },
  } = useTranslation();
  const [languageUrl, setLanguageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { pathname } = window.location;
      const lang = pathname.split('/')[1];
      setLanguageUrl(lang);
    }
  }, []);

  useEffect(() => {
    if (languageUrl) changeLanguage(languageUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, languageUrl]);

  useEffect(() => {
    if (loadingPopup) setLoadingPopup(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingPopup]);

  return <CustomError error="404_pages" withLayout />;
};

export default Error404Page;
