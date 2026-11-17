import { describe, expect, it } from 'vitest';
import { currentStreak, dayKey, addDays, levelInfo, longestStreak, xpForLevel, formatMinutes, type ActivityLog } from '../progress';

const day = (xp = 10) => ({ minutes: 5, xp, lessons: 0, challenges: 0 });
const today = new Date(2026, 10, 17, 12);
const k = (offset: number) => dayKey(addDays(today, offset));

describe('levels', () => {
  it('starts at level 1 with 0 xp', () => {
    expect(levelInfo(0)).toMatchObject({ level: 1, intoLevel: 0, toNext: 100 });
  });
  it('crosses thresholds exactly', () => {
    expect(xpForLevel(2)).toBe(100);
    expect(levelInfo(99).level).toBe(1);
    expect(levelInfo(100).level).toBe(2);
    expect(levelInfo(300).level).toBe(3);
  });
});

describe('streaks', () => {
  it('is 0 with no activity', () => {
    expect(currentStreak({}, today)).toBe(0);
  });
  it('does not break when today has no activity yet', () => {
    const log: ActivityLog = { [k(-1)]: day(), [k(-2)]: day() };
    expect(currentStreak(log, today)).toBe(2);
  });
  it('includes today when active', () => {
    const log: ActivityLog = { [k(0)]: day(), [k(-1)]: day() };
    expect(currentStreak(log, today)).toBe(2);
  });
  it('resets after a missed day', () => {
    const log: ActivityLog = { [k(0)]: day(), [k(-2)]: day(), [k(-3)]: day() };
    expect(currentStreak(log, today)).toBe(1);
    expect(longestStreak(log)).toBe(2);
  });
  it('ignores days with only idle minutes', () => {
    const log: ActivityLog = { [k(-1)]: { minutes: 3, xp: 0, lessons: 0, challenges: 0 } };
    expect(currentStreak(log, today)).toBe(0);
  });
  it('handles month boundaries', () => {
    const log: ActivityLog = { '2026-10-31': day(), '2026-11-01': day() };
    expect(longestStreak(log)).toBe(2);
  });
});

describe('formatMinutes', () => {
  it('formats', () => {
    expect(formatMinutes(0)).toBe('0m');
    expect(formatMinutes(75)).toBe('1h 15m');
    expect(formatMinutes(120)).toBe('2h');
  });
});
