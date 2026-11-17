import type { Check, CssQuery } from '../content/types';
import { runJs, type RunResult } from './jsRunner';

export interface CheckOutcome {
  desc: string;
  ok: boolean;
  detail?: string;
}

export interface GradeResult {
  passed: boolean;
  outcomes: CheckOutcome[];
  /** Problem with the code itself (syntax error, crash), in plain language. */
  problem?: string;
  run?: RunResult;
}

const norm = (sel: string) => sel.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\s*([>+~,])\s*/g, '$1');

/** Parses CSS without applying it anywhere. */
export function cssQuery(css: string): { query: CssQuery; problem?: string } {
  let problem: string | undefined;
  const opens = (css.match(/{/g) || []).length;
  const closes = (css.match(/}/g) || []).length;
  if (opens !== closes) problem = opens > closes ? 'A rule is missing its closing } brace.' : 'There’s an extra } brace.';

  const rules: CSSStyleRule[] = [];
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    const walk = (list: CSSRuleList) => {
      for (const r of Array.from(list)) {
        if (r instanceof CSSStyleRule) rules.push(r);
        else if ('cssRules' in r) walk((r as CSSGroupingRule).cssRules);
      }
    };
    walk(sheet.cssRules);
  } catch {
    problem ??= 'This CSS could not be read.';
  }
  const query: CssQuery = {
    selectors: rules.map((r) => norm(r.selectorText)),
    hasRule: (s) => rules.some((r) => norm(r.selectorText) === norm(s)),
    get: (s, prop) => {
      for (let i = rules.length - 1; i >= 0; i--) {
        if (norm(rules[i].selectorText) === norm(s)) {
          const v = rules[i].style.getPropertyValue(prop);
          if (v) return v.trim();
        }
      }
      return '';
    },
  };
  return { query, problem };
}

export function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

/** Light checks for common HTML slips, reported as gentle warnings. */
export function htmlWarnings(html: string): string[] {
  const out: string[] = [];
  const opens = html.match(/<([a-z][a-z0-9]*)\b[^>]*>/gi) ?? [];
  const voids = new Set(['br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'area', 'base', 'col', 'embed', 'track', 'wbr']);
  const counts = new Map<string, number>();
  for (const t of opens) {
    const name = /<([a-z0-9]+)/i.exec(t)![1].toLowerCase();
    if (!voids.has(name) && !t.endsWith('/>')) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  for (const t of html.match(/<\/([a-z][a-z0-9]*)\s*>/gi) ?? []) {
    const name = /<\/([a-z0-9]+)/i.exec(t)![1].toLowerCase();
    counts.set(name, (counts.get(name) ?? 0) - 1);
  }
  for (const [name, n] of counts) {
    if (n > 0) out.push(`It looks like a <${name}> tag was opened but not closed with </${name}>.`);
    if (n < 0) out.push(`There’s a closing </${name}> without a matching opening <${name}>.`);
  }
  return out;
}

export async function grade(lang: 'html' | 'css' | 'javascript', code: string, checks: Check[]): Promise<GradeResult> {
  if (lang === 'html') {
    const doc = parseHtml(code);
    const outcomes = checks.map((c) => {
      if (c.kind !== 'html') return { desc: c.desc, ok: false, detail: 'Misconfigured check' };
      try {
        return { desc: c.desc, ok: !!c.test(doc) };
      } catch {
        return { desc: c.desc, ok: false };
      }
    });
    const warnings = htmlWarnings(code);
    return { passed: outcomes.every((o) => o.ok), outcomes, problem: warnings[0] };
  }

  if (lang === 'css') {
    const { query, problem } = cssQuery(code);
    const outcomes = checks.map((c) => {
      if (c.kind !== 'css') return { desc: c.desc, ok: false, detail: 'Misconfigured check' };
      try {
        return { desc: c.desc, ok: !!c.test(query) };
      } catch {
        return { desc: c.desc, ok: false };
      }
    });
    return { passed: outcomes.every((o) => o.ok), outcomes, problem };
  }

  // JavaScript
  const exprChecks = checks.filter((c): c is Extract<Check, { kind: 'js' }> => c.kind === 'js');
  const run = await runJs(code, exprChecks.map((c) => c.expr));
  const printed = run.logs.map((l) => l.text.trim());
  let ei = 0;
  const outcomes: CheckOutcome[] = checks.map((c) => {
    if (c.kind === 'js') {
      const r = run.results[ei++];
      return { desc: c.desc, ok: !!r?.ok, detail: r?.error };
    }
    if (c.kind === 'output') {
      // '*' in expected output matches any non-empty line.
      const ok = c.expected.length === printed.length && c.expected.every((e, i) => (e === '*' ? printed[i].length > 0 : e.trim() === printed[i]));
      return {
        desc: c.desc,
        ok,
        detail: ok ? undefined : `Expected ${c.expected.length} line(s): ${c.expected.map((e) => (e === '*' ? '(any text)' : `"${e}"`)).join(', ')} — got ${printed.length ? printed.map((p) => `"${p}"`).join(', ') : 'nothing'}.`,
      };
    }
    return { desc: c.desc, ok: false, detail: 'Misconfigured check' };
  });
  return {
    passed: !run.error && outcomes.every((o) => o.ok),
    outcomes,
    problem: run.error ? `${run.error.name}: ${run.error.message}${run.error.line ? ` (line ${run.error.line})` : ''}` : undefined,
    run,
  };
}
