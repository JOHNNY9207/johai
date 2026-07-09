"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  detectLanguage,
  dictionaries,
  isSupportedLanguage,
  type Language,
} from "@/app/lib/i18n";

type TranslationValue = string | TranslationTree;

type TranslationTree = {
  [key: string]: TranslationValue;
};

type I18nContextValue = {
  language: Language;
  mounted: boolean;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readNestedValue(source: TranslationTree, key: string): string | null {
  const value = key.split(".").reduce<TranslationValue | undefined>((current, part) => {
    if (!current || typeof current === "string") return undefined;
    return current[part];
  }, source);

  return typeof value === "string" ? value : null;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem("johai-language");
      const detected = isSupportedLanguage(stored)
        ? stored
        : detectLanguage(window.navigator.language);

      setLanguageState(detected);
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = language;
  }, [language, mounted]);

  const value = useMemo<I18nContextValue>(() => {
    function setLanguage(nextLanguage: Language) {
      setLanguageState(nextLanguage);
      window.localStorage.setItem("johai-language", nextLanguage);
      document.documentElement.lang = nextLanguage;
    }

    function t(key: string) {
      return (
        readNestedValue(dictionaries[language], key) ??
        readNestedValue(dictionaries.en, key) ??
        key
      );
    }

    return { language, mounted, setLanguage, t };
  }, [language, mounted]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}
