import { describe, expect, it } from 'vitest';
import { mergeProgress, type SyncedState } from '../mergeProgress';

const base = (over: Partial<SyncedState> = {}): SyncedState => ({
  prefs: { theme: 'dark' },
  xp: 0,
  activity: {},
  lastVisited: null,
  onboarded: true,
  achievements: {},
  completedLessons: {},
  exercises: {},
  drafts: {},
  bookmarks: [],
  notes: {},
  placement: null,
  challenges: {},
  projects: {},
  ...over,
});

describe('mergeProgress', () => {
  it('returns local unchanged when there is no cloud copy', () => {
    const local = base({ xp: 10 });
    expect(mergeProgress(local, null)).toBe(local);
  });

  it('unions completed lessons keeping the earliest timestamp', () => {
    const m = mergeProgress(base({ completedLessons: { a: 5, b: 9 } }), base({ completedLessons: { a: 3, c: 7 } }));
    expect(m.completedLessons).toEqual({ a: 3, b: 9, c: 7 });
  });

  it('merges activity per day with field-wise max and recomputes XP floor', () => {
    const local = base({ xp: 30, activity: { '2026-11-16': { minutes: 10, xp: 30, lessons: 1, challenges: 0 } } });
    const remote = base({ xp: 40, activity: { '2026-11-15': { minutes: 5, xp: 40, lessons: 2, challenges: 0 } } });
    const m = mergeProgress(local, remote);
    expect(Object.keys(m.activity).sort()).toEqual(['2026-11-15', '2026-11-16']);
    expect(m.xp).toBe(70); // both devices' work counted
  });

  it('never lowers XP', () => {
    expect(mergeProgress(base({ xp: 500 }), base({ xp: 20 })).xp).toBe(500);
  });

  it('keeps an exercise passed if it was passed on either device', () => {
    const m = mergeProgress(base({ exercises: { e: { attempts: 3 } } }), base({ exercises: { e: { attempts: 1, passedAt: 42 } } }));
    expect(m.exercises.e).toEqual({ attempts: 3, passedAt: 42, revealed: false });
  });

  it('prefers this device’s notes but keeps cloud-only notes', () => {
    const m = mergeProgress(base({ notes: { a: 'local' } }), base({ notes: { a: 'cloud', b: 'only cloud' } }));
    expect(m.notes).toEqual({ a: 'local', b: 'only cloud' });
  });

  it('takes cloud preferences on a device that has not been set up', () => {
    const m = mergeProgress(base({ onboarded: false, prefs: { theme: 'dark' } }), base({ prefs: { theme: 'light', designStyle: 'terminal' } }));
    expect(m.prefs).toMatchObject({ theme: 'light', designStyle: 'terminal' });
    expect(m.onboarded).toBe(true);
  });

  it('keeps the most recently edited project and best challenge time', () => {
    const m = mergeProgress(
      base({ projects: { p: { updatedAt: 10, name: 'old' } }, challenges: { c: { attempts: 2, solvedAt: 9, bestMs: 5000 } } }),
      base({ projects: { p: { updatedAt: 20, name: 'new' } }, challenges: { c: { attempts: 1, solvedAt: 4, bestMs: 8000 } } }),
    );
    expect(m.projects!.p.name).toBe('new');
    expect(m.challenges!.c).toEqual({ attempts: 2, solvedAt: 4, bestMs: 5000 });
  });

  it('unions bookmarks without duplicates', () => {
    expect(mergeProgress(base({ bookmarks: ['a', 'b'] }), base({ bookmarks: ['b', 'c'] })).bookmarks.sort()).toEqual(['a', 'b', 'c']);
  });
});
