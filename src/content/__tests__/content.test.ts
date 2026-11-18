import { describe, expect, it } from 'vitest';
import { ALL_LESSONS, COURSES, getCourse, lessonXp } from '..';
import { PLACEMENT, placementRecommendation } from '../placement';
import { GLOSSARY } from '../../data/glossary';
import { LANGUAGES } from '../../data/languages';

const allBlocks = ALL_LESSONS.flatMap(({ lesson }) => lesson.blocks.map((b) => ({ lesson, b })));
const allText = ALL_LESSONS.flatMap(({ lesson }) => [
  lesson.goal,
  ...lesson.summary,
  ...lesson.blocks.flatMap((b) => ('md' in b ? [b.md] : 'prompt' in b ? [b.prompt] : [])),
]);

describe('course content', () => {
  it('has unique course, lesson, quiz and exercise ids', () => {
    const ids = [
      ...COURSES.map((c) => c.id),
      ...ALL_LESSONS.map(({ lesson }) => lesson.id),
      ...allBlocks.flatMap(({ b }) => ('id' in b ? [b.id] : [])),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every course links to a real language and real prerequisites', () => {
    for (const c of COURSES) {
      expect(c.languageId === 'concepts' || LANGUAGES.some((l) => l.id === c.languageId), c.id).toBe(true);
      for (const p of c.prerequisites) expect(getCourse(p), `${c.id} → ${p}`).toBeDefined();
      expect(c.lessons.length).toBeGreaterThan(0);
    }
  });

  it('every lesson has a goal, a summary and at least one knowledge check', () => {
    for (const { lesson } of ALL_LESSONS) {
      expect(lesson.goal.length, lesson.id).toBeGreaterThan(10);
      expect(lesson.summary.length, lesson.id).toBeGreaterThanOrEqual(2);
      expect(lesson.blocks.some((b) => b.type === 'quiz' || b.type === 'exercise'), lesson.id).toBe(true);
    }
  });

  it('quiz answers point at a real option', () => {
    for (const { b } of allBlocks) {
      if (b.type !== 'quiz') continue;
      expect(b.answer, b.id).toBeGreaterThanOrEqual(0);
      expect(b.answer, b.id).toBeLessThan(b.options.length);
    }
  });

  it('exercises have checks, hints, and a solution different from the starter', () => {
    for (const { b } of allBlocks) {
      if (b.type !== 'exercise') continue;
      expect(b.checks.length, b.id).toBeGreaterThan(0);
      expect(b.hints.length, b.id).toBeGreaterThan(0);
      expect(b.solution.trim(), b.id).not.toBe(b.starter.trim());
      for (const c of b.checks) expect(c.kind === 'css' ? b.lang === 'css' : c.kind === 'html' ? b.lang === 'html' : b.lang === 'javascript', `${b.id}: ${c.desc}`).toBe(true);
    }
  });

  it('glossary references in text exist', () => {
    for (const t of allText) {
      for (const m of t.matchAll(/\{term:([a-z-]+)/g)) expect(GLOSSARY[m[1]], m[1]).toBeDefined();
    }
  });

  it('inline code spans are balanced', () => {
    for (const t of allText) expect((t.match(/`/g) ?? []).length % 2, t.slice(0, 60)).toBe(0);
  });

  it('awards more XP for lessons with exercises', () => {
    const withEx = ALL_LESSONS.find(({ lesson }) => lesson.blocks.some((b) => b.type === 'exercise'))!.lesson;
    expect(lessonXp(withEx)).toBeGreaterThan(20);
  });
});

describe('placement', () => {
  it('has valid answers and recommends real courses for every score', () => {
    for (const q of PLACEMENT) expect(q.answer).toBeLessThan(q.options.length);
    for (let s = 0; s <= PLACEMENT.length; s++) expect(getCourse(placementRecommendation(s).courseId)).toBeDefined();
  });
});

import { LESSON_VIDEOS, LANGUAGE_VIDEOS } from '../videos';
describe('videos', () => {
  it('only reference real lessons and languages, with well-formed YouTube ids', () => {
    const lessonIds = new Set(ALL_LESSONS.map(({ lesson }) => lesson.id));
    for (const [id, vids] of Object.entries(LESSON_VIDEOS)) {
      expect(lessonIds.has(id), id).toBe(true);
      for (const v of vids) expect(v.id).toMatch(/^[A-Za-z0-9_-]{11}$/);
    }
    for (const id of Object.keys(LANGUAGE_VIDEOS)) expect(LANGUAGES.some((l) => l.id === id), id).toBe(true);
  });
});

import { CHALLENGES } from '../challenges';
import { dailyChallengeIndex } from '../../runtime/gradeChallenge';
describe('challenges', () => {
  it('have unique ids, hints, and tests (or a reference query)', () => {
    expect(new Set(CHALLENGES.map((c) => c.id)).size).toBe(CHALLENGES.length);
    for (const c of CHALLENGES) {
      expect(c.hints.length, c.id).toBeGreaterThan(0);
      if (c.lang === 'sql') expect(c.expectedSql, c.id).toBeTruthy();
      else {
        expect(c.fn, c.id).toBeTruthy();
        expect(c.tests!.some((t) => !t.hidden), `${c.id} visible`).toBe(true);
        expect(c.tests!.some((t) => t.hidden), `${c.id} hidden`).toBe(true);
        expect(c.solution, c.id).toContain(c.lang === 'python' ? `def ${c.fn}` : `function ${c.fn}`);
      }
    }
  });
  it('picks a valid daily challenge for every day of a year', () => {
    for (let d = 0; d < 366; d++) {
      const i = dailyChallengeIndex(CHALLENGES.length, new Date(2026, 0, 1 + d));
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(CHALLENGES.length);
    }
  });
});

import { ROADMAPS } from '../roadmaps';
import { GUIDED_PROJECTS } from '../guidedProjects';
describe('roadmaps and projects', () => {
  it('roadmap links point at things that exist', () => {
    for (const r of ROADMAPS) {
      expect(new Set(r.milestones.map((m) => m.id)).size, r.id).toBe(r.milestones.length);
      for (const m of r.milestones) {
        m.courses?.forEach((id) => expect(getCourse(id), `${r.id}/${m.id} course ${id}`).toBeDefined());
        m.projects?.forEach((id) => expect(GUIDED_PROJECTS.some((p) => p.id === id), `${r.id}/${m.id} project ${id}`).toBe(true));
        m.challenges?.forEach((id) => expect(CHALLENGES.some((c) => c.id === id), `${r.id}/${m.id} challenge ${id}`).toBe(true));
        m.languages?.forEach((id) => expect(LANGUAGES.some((l) => l.id === id), `${r.id}/${m.id} language ${id}`).toBe(true));
        m.external?.forEach((e) => expect(e.url).toMatch(/^https:\/\//));
      }
    }
  });
  it('guided projects have steps, an index.html, and a different finished version', () => {
    for (const p of GUIDED_PROJECTS) {
      expect(p.steps.length, p.id).toBeGreaterThan(2);
      expect(p.starter.some((f) => f.name === 'index.html'), p.id).toBe(true);
      expect(p.solution.some((f) => f.name === 'index.html'), p.id).toBe(true);
      expect(JSON.stringify(p.solution), p.id).not.toBe(JSON.stringify(p.starter));
      if (p.recommended) expect(getCourse(p.recommended), p.id).toBeDefined();
    }
  });
});

import { DOCS } from '../docs';
describe('docs', () => {
  it('have unique ids, examples and valid lesson links', () => {
    expect(new Set(DOCS.map((e) => e.id)).size).toBe(DOCS.length);
    const lessonPaths = new Set(ALL_LESSONS.map(({ course, lesson }) => `/courses/${course.id}/${lesson.id}`));
    for (const e of DOCS) {
      expect(e.example.trim().length, e.id).toBeGreaterThan(0);
      if (e.lesson) expect(lessonPaths.has(e.lesson), `${e.id} -> ${e.lesson}`).toBe(true);
    }
  });
});
