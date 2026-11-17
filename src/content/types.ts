/**
 * Lesson content model.
 *
 * Text fields use a tiny Markdown subset (see `lib/markdown.tsx`):
 *   **bold**, `code`, [link](/path), {term:id|label} glossary terms,
 *   "- " bullet lists and blank-line separated paragraphs.
 */

export type CodeLang = 'html' | 'css' | 'javascript' | 'python' | 'sql' | 'text';
export type Level = 'beginner' | 'intermediate' | 'advanced';

/** A check runs against learner code. Each must have a plain-language description. */
export type Check =
  /** Parsed with DOMParser — scripts never execute. */
  | { kind: 'html'; desc: string; test: (doc: Document) => boolean }
  /** CSS parsed into a constructable stylesheet — nothing is applied to the page. */
  | { kind: 'css'; desc: string; test: (css: CssQuery) => boolean }
  /** JS expression evaluated in a sandboxed Web Worker after the learner's code, in the same scope. */
  | { kind: 'js'; desc: string; expr: string }
  /** Compares everything the program printed with console.log (trimmed, line by line). '*' matches any non-empty line. */
  | { kind: 'output'; desc: string; expected: string[] };

/** Helper handed to CSS checks. */
export interface CssQuery {
  /** Value of `prop` in the last rule whose selector text equals `selector` (normalised), or ''. */
  get(selector: string, prop: string): string;
  hasRule(selector: string): boolean;
  /** All selector texts in the sheet. */
  selectors: string[];
}

export type Block =
  | { type: 'text'; md: string }
  | { type: 'heading'; text: string }
  | {
      type: 'code';
      lang: CodeLang;
      code: string;
      caption?: string;
      /** Show a rendered result next to the code (HTML/CSS) or a Run button (JS). */
      preview?: boolean;
      /** For CSS examples: the HTML the CSS applies to. */
      html?: string;
    }
  | { type: 'callout'; tone: 'tip' | 'warning' | 'info' | 'real-world'; title?: string; md: string }
  | { type: 'quiz'; id: string; question: string; code?: { lang: CodeLang; code: string }; options: string[]; answer: number; explain: string }
  | {
      type: 'exercise';
      id: string;
      lang: 'html' | 'css' | 'javascript';
      title: string;
      prompt: string;
      starter: string;
      solution: string;
      /** For CSS exercises: fixed HTML the learner styles. */
      html?: string;
      checks: Check[];
      hints: string[];
    }
  /** Free-play editor with live preview — no grading. */
  | { type: 'playground'; lang: 'html' | 'css' | 'javascript'; title?: string; starter: string; html?: string };

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  /** One sentence: what the learner can do afterwards. */
  goal: string;
  blocks: Block[];
  /** 2–4 bullet takeaways shown at the end. */
  summary: string[];
}

export interface Course {
  id: string;
  /** Language id from data/languages, or 'concepts' for language-agnostic fundamentals. */
  languageId: string;
  level: Level;
  title: string;
  description: string;
  outcomes: string[];
  /** Course ids recommended before this one. */
  prerequisites: string[];
  lessons: Lesson[];
}
