"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import type { Language } from "@/app/lib/i18n";

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

const localeOptions: Array<{
  label: string;
  region: string;
  language: Language;
}> = [
  { label: "English", region: "United States", language: "en" },
  { label: "French", region: "France", language: "fr" },
  { label: "French", region: "Canada", language: "fr" },
  { label: "Spanish", region: "United States", language: "es" },
  { label: "Spanish", region: "Latin America", language: "es" },
  { label: "Portuguese", region: "Brazil", language: "pt" },
  { label: "Chinese", region: "Global", language: "zh" },
];

export default function LanguageSwitcher({ className = "", compact = false }: LanguageSwitcherProps) {
  const { language, mounted, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState(localeOptions[0]);
  const visibleLanguage = mounted ? language : "en";
  const selected =
    selectedLocale.language === visibleLanguage
      ? selectedLocale
      : localeOptions.find((option) => option.language === visibleLanguage) ?? localeOptions[0];

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-label="Language and region selector"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 text-sm font-bold text-slate-800 shadow-lg shadow-slate-900/5 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-white hover:shadow-xl ${
          compact ? "px-3 py-2" : "px-4 py-3"
        }`}
      >
        <Globe2 size={16} className="text-cyan-700" />
        <span className="hidden sm:inline">{selected.label}</span>
        <span className="text-slate-400">—</span>
        <span>{selected.region}</span>
        <ChevronDown
          size={15}
          className={`text-slate-500 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(8px)" }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-2 shadow-2xl shadow-slate-900/12 backdrop-blur-2xl"
          >
            <div className="px-3 py-2">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                Language + Region
              </p>
            </div>
            {localeOptions.map((option) => {
              const active =
                option.language === visibleLanguage && option.region === selected.region;

              return (
                <button
                  key={`${option.label}-${option.region}`}
                  type="button"
                  onClick={() => {
                    setSelectedLocale(option);
                    setLanguage(option.language);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-slate-100"
                >
                  <span>
                    <span className="block text-sm font-bold text-slate-900">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                      {option.region}
                    </span>
                  </span>
                  {active && <Check size={17} className="text-cyan-700" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
