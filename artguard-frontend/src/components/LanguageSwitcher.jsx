import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'uk' ? 'en' : 'uk';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang); 
  };

  return (
    <button onClick={toggleLanguage} className="lang-btn">
      {i18n.language === 'uk' ? 'EN' : 'UA'}
    </button>
  );
}
