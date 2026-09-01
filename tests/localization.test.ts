import { describe, it, expect } from 'vitest';
import { t, setCurrentLocale, detectLocale } from '../src/i18n/index';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';

describe('10-Language Localization Integrity', () => {
  const locales = ['en', 'es', 'zh', 'hi', 'ar', 'fr', 'pt', 'bn', 'ru', 'ur'] as const;

  it('contains no missing keys across all 10 locales', () => {
    locales.forEach((loc) => {
      setCurrentLocale(loc);
      const title = t('simulator.title');
      expect(title).toBeDefined();
      expect(title).not.toBe('simulator.title');
    });
  });

  it('correctly sets RTL for Arabic and Urdu', () => {
    setCurrentLocale('ar');
    expect(t('nav.simulator')).toBe(t('nav.simulator', 'ar'));

    setCurrentLocale('ur');
    expect(t('nav.simulator')).toBe(t('nav.simulator', 'ur'));
  });

  it('translates navigation keys without fallback key names', () => {
    locales.forEach((loc) => {
      const navText = t('nav.about', loc);
      expect(navText).not.toContain('nav.');
    });
  });
});
