import { useState } from 'react';
import { ALL_LESSONS } from '../content';
import { grade } from '../runtime/checks';
import { CHALLENGES } from '../content/challenges';
import { gradeChallenge } from '../runtime/gradeChallenge';

interface Row {
  id: string;
  lesson: string;
  solutionPasses: boolean;
  starterFails: boolean;
  failing: string[];
}

/**
 * Development-only QA page (/dev/content-check).
 * Runs every exercise's solution and starter through the real graders:
 *  - the solution must pass every check
 *  - the starter must NOT pass (otherwise the exercise is a no-op)
 */
export default function ContentCheck() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    const out: Row[] = [];
    for (const { lesson } of ALL_LESSONS) {
      for (const b of lesson.blocks) {
        if (b.type !== 'exercise') continue;
        const sol = await grade(b.lang, b.solution, b.checks);
        const start = await grade(b.lang, b.starter, b.checks);
        out.push({
          id: b.id,
          lesson: lesson.title,
          solutionPasses: sol.passed,
          starterFails: !start.passed,
          failing: sol.outcomes.filter((o) => !o.ok).map((o) => o.desc + (o.detail ? ` — ${o.detail}` : '')).concat(sol.problem ? [sol.problem] : []),
        });
      }
    }
    for (const ch of CHALLENGES) {
      const sol = await gradeChallenge(ch, ch.solution, true);
      const start = await gradeChallenge(ch, ch.starter, true);
      out.push({
        id: ch.id,
        lesson: `Challenge (${ch.lang})`,
        solutionPasses: sol.passed,
        starterFails: !start.passed,
        failing: sol.cases.filter((c) => !c.ok).map((c) => `${c.label}: expected ${c.expected}, got ${c.actual ?? c.error}`).concat(sol.sql?.error ? [sol.sql.error] : []).concat(sol.run?.error ? [sol.run.error.message] : []),
      });
    }
    setRows(out);
    setRunning(false);
  };

  const bad = rows?.filter((r) => !r.solutionPasses || !r.starterFails) ?? [];

  return (
    <div className="page">
      <h1>Content check</h1>
      <p className="muted" style={{ margin: 'var(--sp-2) 0 var(--sp-4)' }}>Grades every exercise solution and starter with the real checkers.</p>
      <button className="btn btn-primary" onClick={run} disabled={running}>{running ? 'Running…' : 'Run all'}</button>
      {rows && (
        <div style={{ marginTop: 'var(--sp-5)' }}>
          <p id="content-check-summary" data-total={rows.length} data-bad={bad.length} style={{ fontWeight: 600, color: bad.length ? 'var(--critical)' : 'var(--good)' }}>
            {rows.length} exercises · {bad.length} problem{bad.length === 1 ? '' : 's'}
          </p>
          <table style={{ width: '100%', fontSize: 'var(--fs-sm)', borderCollapse: 'collapse', marginTop: 'var(--sp-3)' }}>
            <thead><tr style={{ textAlign: 'left' }}><th>Exercise</th><th>Lesson</th><th>Solution passes</th><th>Starter fails</th><th>Notes</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="mono">{r.id}</td>
                  <td>{r.lesson}</td>
                  <td>{r.solutionPasses ? '✓' : '✗'}</td>
                  <td>{r.starterFails ? '✓' : '✗'}</td>
                  <td className="subtle">{r.failing.join('; ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
