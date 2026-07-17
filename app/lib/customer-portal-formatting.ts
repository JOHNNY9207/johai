export const portalDefaultLocale = "en-US";
export const portalDefaultTimeZone = "UTC";

const portalLocaleByLanguage: Readonly<Record<string, string>> = Object.freeze({
  ar: "ar-SA",
  de: "de-DE",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  hi: "hi-IN",
  it: "it-IT",
  ja: "ja-JP",
  ko: "ko-KR",
  nl: "nl-NL",
  pl: "pl-PL",
  pt: "pt-BR",
  ru: "ru-RU",
  tr: "tr-TR",
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-TW",
  zh: "zh-CN",
});

export function getPortalLocale(value: string | null | undefined) {
  if (!value?.trim()) return portalDefaultLocale;

  try {
    const [canonical] = Intl.getCanonicalLocales(value.trim().replaceAll("_", "-"));
    if (!canonical) return portalDefaultLocale;

    const locale = new Intl.Locale(canonical);
    if (locale.region) return locale.baseName;

    const languageWithScript = locale.script
      ? `${locale.language}-${locale.script}`
      : locale.language;
    return (
      portalLocaleByLanguage[languageWithScript] ??
      portalLocaleByLanguage[locale.language] ??
      portalDefaultLocale
    );
  } catch {
    return portalDefaultLocale;
  }
}

export function getSafeTimeZone(value: string | null | undefined) {
  const timeZone = value?.trim() || portalDefaultTimeZone;
  try {
    new Intl.DateTimeFormat(portalDefaultLocale, { timeZone }).format(new Date(0));
    return timeZone;
  } catch {
    return portalDefaultTimeZone;
  }
}

export function formatPortalDate(
  value: string,
  {
    includeTime = true,
    locale,
    timeZone,
  }: Readonly<{
    includeTime?: boolean;
    locale: string;
    timeZone: string;
  }>
) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat(getPortalLocale(locale), {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" as const } : {}),
    timeZone: getSafeTimeZone(timeZone),
  }).format(date);
}
