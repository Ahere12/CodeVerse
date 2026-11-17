import type { Challenge } from '../content/challenges';
import { runJs, type RunResult } from './jsRunner';
import { runPython } from './pyRunner';
import { runSql, sameRows, type SqlResult } from './sqlRunner';

export interface CaseResult {
  label: string;
  ok: boolean;
  hidden: boolean;
  expected: string;
  actual?: string;
  error?: string;
}

export interface ChallengeResult {
  passed: boolean;
  cases: CaseResult[];
  run?: RunResult;
  sql?: SqlResult;
  ms: number;
}

/** Normalises JSON from JS or Python (which uses different spacing) for comparison. */
const canonical = (json: string | undefined) => {
  if (json === undefined) return undefined;
  try {
    return JSON.stringify(JSON.parse(json));
  } catch {
    return json;
  }
};

const show = (json: string | undefined) => (json === undefined ? 'undefined' : json);

/**
 * Grades a challenge. `includeHidden` = Submit (all tests) vs Run (visible tests only).
 */
export async function gradeChallenge(ch: Challenge, code: string, includeHidden: boolean): Promise<ChallengeResult> {
  const started = performance.now();

  if (ch.lang === 'sql') {
    const sql = await runSql(code, { expectedSql: ch.expectedSql });
    const actual = sql.results[sql.results.length - 1];
    const expected = sql.expected?.[sql.expected.length - 1];
    const ok = !sql.error && sameRows(actual, expected, ch.ordered);
    const describe = (t?: { columns: string[]; values: unknown[][] }) => (t ? `${t.values.length} row(s): ${t.columns.join(', ')}` : 'no rows');
    const cases: CaseResult[] = [
      {
        label: ch.ordered ? 'Returns the expected rows in the expected order' : 'Returns the expected rows',
        ok,
        hidden: false,
        expected: describe(expected),
        actual: sql.error ? undefined : describe(actual),
        error: sql.error,
      },
    ];
    return { passed: ok, cases, sql, ms: Math.round(performance.now() - started) };
  }

  const tests = (ch.tests ?? []).filter((t) => includeHidden || !t.hidden);
  const exprs = tests.map((t) => `${ch.fn}(${t.args})`);
  const run = ch.lang === 'python' ? await runPython(code, exprs) : await runJs(code, exprs);
  const cases: CaseResult[] = tests.map((t, i) => {
    const r = run.results[i];
    const expected = JSON.stringify(t.expected);
    const ok = !!r && r.error === undefined && canonical(r.json) === canonical(expected);
    return {
      label: `${ch.fn}(${t.args})`,
      ok,
      hidden: !!t.hidden,
      expected,
      actual: r?.error ? undefined : show(r?.json),
      error: r?.error,
    };
  });
  return { passed: !run.error && cases.length > 0 && cases.every((c) => c.ok), cases, run, ms: Math.round(performance.now() - started) };
}

/** The same challenge for everyone on a given day (local date), cycling through the list. */
export function dailyChallengeIndex(count: number, date = new Date()): number {
  const days = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  // Multiply by a prime so consecutive days jump around the list rather than going in order.
  return (days * 7919) % count;
}
