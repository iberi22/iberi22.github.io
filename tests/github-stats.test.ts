// @vitest-environment node
import { describe, it, expect } from 'vitest';
// @ts-expect-error plain ESM script without type declarations
import { parseCalendar, cleanTag, parseVersion } from '../scripts/fetch-github-stats.mjs';
import stats from '../src/data/github-stats.json';

describe('github stats script', () => {
  it('parses the public contribution calendar into monthly totals', () => {
    const html = `
      <td data-date="2026-09-30" id="contribution-day-component-0-0" class="ContributionCalendar-day"></td>
      <td data-date="2026-10-01" id="contribution-day-component-1-0" class="ContributionCalendar-day"></td>
      <td data-date="2026-10-02" id="contribution-day-component-2-0" class="ContributionCalendar-day"></td>
      <tool-tip for="contribution-day-component-0-0" class="sr-only">1,204 contributions on September 30th.</tool-tip>
      <tool-tip for="contribution-day-component-1-0" class="sr-only">No contributions on October 1st.</tool-tip>
      <tool-tip for="contribution-day-component-2-0" class="sr-only">1 contribution on October 2nd.</tool-tip>`;
    const cal = parseCalendar(html);
    expect(cal.total).toBe(1205);
    expect(cal.activeDays).toBe(2);
    expect(cal.monthly).toEqual([
      { month: '2026-09', count: 1204 },
      { month: '2026-10', count: 1 },
    ]);
  });

  it('normalises version tags and ignores non-version tags', () => {
    expect(cleanTag('v1.0.0-432081f18034f959fc310c3e75ea49bf32572935')).toBe('v1.0.0');
    expect(cleanTag('v1.2.0-stable')).toBe('v1.2.0');
    expect(parseVersion('archive/2026-10-11/main')).toBeNull();
  });

  it('ships a snapshot with the fields the charts render', () => {
    expect(stats.contributions.monthly.length).toBeGreaterThan(0);
    expect(stats.languages.length).toBeGreaterThan(0);
    expect(stats.projects.xavier.version).toMatch(/^v\d+\.\d+\.\d+$/);
  });
});
