
import { en } from './translations/en';
import { ru } from './translations/ru';
import { create } from 'zustand';

type Language = 'en' | 'ru';

interface I18nStore {
  language: Language;
  translations: typeof en;
  setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nStore>((set) => ({
  language: 'en',
  translations: en,
  setLanguage: (lang) => set({ 
    language: lang, 
    translations: lang === 'en' ? en : ru 
  }),
}));
