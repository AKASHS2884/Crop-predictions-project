import { useState, useRef, useEffect } from 'react';
import { LANGUAGES } from './i18n';

export default function LanguageSwitcher({ lang, setLang, isMobile = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    setIsOpen(false);
  };

  const currentLanguage = LANGUAGES[lang] || LANGUAGES.en;

  if (isMobile) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
      