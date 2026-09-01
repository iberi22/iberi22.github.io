import en from './en.json';
import es from './es.json';
import zh from './zh.json';
import hi from './hi.json';
import ar from './ar.json';
import fr from './fr.json';
import pt from './pt.json';
import bn from './bn.json';
import ru from './ru.json';
import ur from './ur.json';

const locales = { en, es, zh, hi, ar, fr, pt, bn, ru, ur };

export type Locale = keyof typeof locales;

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
  hi: 'हिन्दी',
  ar: 'العربية',
  fr: 'Français',
  pt: 'Português',
  bn: 'বাংলা',
  ru: 'Русский',
  ur: 'اردو',
};

export const rtlLocales: Locale[] = ['ar', 'ur'];

export function isRTL(locale?: Locale): boolean {
  const l = locale ?? current;
  return rtlLocales.includes(l);
}

export function updateDocumentDirection(locale?: Locale) {
  if (typeof document === 'undefined') return;
  const l = locale ?? current;
  document.documentElement.lang = l;
  if (isRTL(l)) {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.classList.add('rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.classList.remove('rtl');
  }
}

/** Detect browser language or fall back to localStorage -> es / en */
export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = (localStorage.getItem('portfolio_lang') || localStorage.getItem('swal-locale')) as Locale | null;
  if (stored && stored in locales) return stored;

  const nav = navigator.languages?.map(l => l.split('-')[0].toLowerCase()) ?? [navigator.language?.split('-')[0].toLowerCase()];
  for (const code of nav) {
    if (code in locales) return code as Locale;
  }
  return 'en';
}

export function setLocale(locale: Locale) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('portfolio_lang', locale);
    localStorage.setItem('swal-locale', locale);
    updateDocumentDirection(locale);
  }
}

let current: Locale = detectLocale();

if (typeof document !== 'undefined') {
  updateDocumentDirection(current);
}

function getNested(obj: any, keys: string[]): any {
  let curr = obj;
  for (const k of keys) {
    if (curr && typeof curr === 'object' && k in curr) {
      curr = curr[k];
    } else {
      return undefined;
    }
  }
  return curr;
}

export function tRaw(key: string, locale?: Locale): any {
  const keys = key.split('.');
  const l = locale ?? current;

  // Fuerza técnico a inglés: toda interconexión de conocimientos en inglés
  // agenda, projects, about (stack/specialties), simulator, hero técnico
  const technicalPrefixes = ['agenda.', 'projects.', 'about.specialties', 'about.stackCategories', 'about.competencies', 'about.stackIndex', 'simulator.', 'hero.tagline', 'hero.badge'];
  if (technicalPrefixes.some(p => key.startsWith(p))) {
    const enVal = getNested(locales['en'], keys);
    if (enVal !== undefined) return enVal;
  }

  let val = getNested(locales[l], keys);
  if (val !== undefined) return val;

  val = getNested(locales['en'], keys);
  if (val !== undefined) return val;

  val = getNested(locales['es'], keys);
  if (val !== undefined) return val;

  return null;
}

export function t(key: string, locale?: Locale): string {
  const val = tRaw(key, locale);
  return typeof val === 'string' ? val : key;
}

export function tArray<T = any>(key: string, locale?: Locale): T[] {
  const res = tRaw(key, locale);
  return Array.isArray(res) ? res : [];
}

export function tObject<T = Record<string, any>>(key: string, locale?: Locale): T {
  const res = tRaw(key, locale);
  return res && typeof res === 'object' && !Array.isArray(res) ? res : ({} as T);
}

export function getCurrentLocale(): Locale {
  return current;
}

export function setCurrentLocale(locale: Locale) {
  current = locale;
  setLocale(locale);
}
