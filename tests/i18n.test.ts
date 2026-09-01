import { describe, it, expect } from 'vitest';
import es from '../src/i18n/es.json';
import en from '../src/i18n/en.json';
import zh from '../src/i18n/zh.json';
import hi from '../src/i18n/hi.json';
import ar from '../src/i18n/ar.json';
import bn from '../src/i18n/bn.json';
import pt from '../src/i18n/pt.json';
import ru from '../src/i18n/ru.json';
import fr from '../src/i18n/fr.json';
import ur from '../src/i18n/ur.json';

const languages = { es, en, zh, hi, ar, bn, pt, ru, fr, ur };

describe('i18n Top 10 World Languages Integrity', () => {
  it('should have all 10 language dictionaries loaded', () => {
    expect(Object.keys(languages)).toHaveLength(10);
    expect(Object.keys(languages)).toEqual(['es', 'en', 'zh', 'hi', 'ar', 'bn', 'pt', 'ru', 'fr', 'ur']);
  });

  it('should contain all essential navigation keys in every language', () => {
    const requiredNavKeys = ['about', 'projects', 'blog', 'contact', 'agenda', 'resources'];
    for (const [langCode, dict] of Object.entries(languages)) {
      expect(dict, `Language ${langCode} must have nav section`).toHaveProperty('nav');
      for (const key of requiredNavKeys) {
        expect(dict.nav, `Language ${langCode} nav must contain key "${key}"`).toHaveProperty(key);
        expect(typeof dict.nav[key], `Language ${langCode} nav.${key} must be a non-empty string`).toBe('string');
        expect(dict.nav[key].length).toBeGreaterThan(0);
      }
    }
  });

  it('should contain hero and footer sections in every language', () => {
    for (const [langCode, dict] of Object.entries(languages)) {
      expect(dict, `Language ${langCode} must have hero section`).toHaveProperty('hero');
      expect(dict, `Language ${langCode} must have footer section`).toHaveProperty('footer');
      expect(dict.hero).toHaveProperty('badge');
      expect(dict.footer).toHaveProperty('tagline');
    }
  });

  it('should contain agenda section keys in every language', () => {
    const essentialAgendaKeys = ['badge', 'title', 'subtitle'];
    for (const [langCode, dict] of Object.entries(languages)) {
      expect(dict, `Language ${langCode} must have agenda section`).toHaveProperty('agenda');
      for (const key of essentialAgendaKeys) {
        expect(dict.agenda, `Language ${langCode} agenda must contain key "${key}"`).toHaveProperty(key);
      }
    }
  });

  it('should contain translated key project deep dives in every language', () => {
    const coreProjects = ['photon-core', 'xavier2', 'gestalt'];
    for (const [langCode, dict] of Object.entries(languages)) {
      expect(dict, `Language ${langCode} must have projects section`).toHaveProperty('projects');
      for (const proj of coreProjects) {
        expect(dict.projects, `Language ${langCode} projects must have "${proj}"`).toHaveProperty(proj);
        expect(dict.projects[proj]).toHaveProperty('tagline');
        expect(dict.projects[proj]).toHaveProperty('description');
      }
    }
  });

  it('should contain complete dynamic agenda section keys in primary locales (es and en)', () => {
    const fullAgendaKeys = [
      'badgeHeader',
      'badgeFree',
      'noticeTitle',
      'noticeTextHtml',
      'track1Badge',
      'track1Price',
      'track2Badge',
      'track2Price',
      'track3Badge',
      'track3Price',
      'modalityLabel',
      'methodologyBadge',
      'm1Label',
      'm2Label',
      'm3Label',
      'm4Label',
      'formMsgPh',
      'meetFooterNote',
      'responseFooterNote',
      'mailSubject',
      'mailHeader',
      'mailArea',
      'mailFooter1',
      'mailFooter2',
    ];
    for (const langCode of ['es', 'en'] as const) {
      const dict = languages[langCode];
      for (const key of fullAgendaKeys) {
        expect(dict.agenda, `Language ${langCode} agenda must contain key "${key}"`).toHaveProperty(key);
      }
    }
  });
});
