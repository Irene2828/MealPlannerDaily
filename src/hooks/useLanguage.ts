import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

export type Lang = 'uk' | 'en';

const STORAGE_KEY = 'family-menu-lang-v1';

export const useLanguage = () => {
  const [lang, setLangState] = useState<Lang>('uk');

  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'uk' || saved === 'en') {
          setLangState(saved);
        }
      } catch (e) {
        console.error('Failed to load language from localStorage', e);
      }
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(STORAGE_KEY, l);
      } catch (e) {
        console.error('Failed to save language to localStorage', e);
      }
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState(prev => {
      const next: Lang = prev === 'uk' ? 'en' : 'uk';
      if (Platform.OS === 'web') {
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch (e) {
          console.error('Failed to save language to localStorage', e);
        }
      }
      return next;
    });
  }, []);

  return { lang, setLang, toggleLang };
};
