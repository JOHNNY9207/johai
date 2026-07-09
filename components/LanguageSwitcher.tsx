"use client";

import { languageLabels, languages } from "@/app/lib/i18n";
import { useI18n } from "@/components/I18nProvider";

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export default function LanguageSwitcher({ className = "", compact = false }: LanguageSwitcherProps) {
  const { language, mounted, setLanguage } = useI18n();
  const visibleLanguage = mounted ? language : "en";

  return (
    <div
      aria-label="Language selector"
      className={`inline-flex items-center rounded-full border border-white/60 bg-white/70 p-1 shadow-lg shadow-slate-900/5 backdrop-blur-xl ${className}`}
    >
      {languages.map((item) => {
        const active = item === visibleLanguage;

        return (
          <button
            key={item}
            type="button"
            onClick={() => setLanguage(item)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              active
                ? "bg-slate-950 text-white shadow-md shadow-slate-900/15"
                : "text-slate-600 hover:bg-white hover:text-slate-950"
            } ${compact ? "px-2" : ""}`}
            aria-pressed={active}
          >
            {languageLabels[item]}
          </button>
        );
      })}
    </div>
  );
}
