/**
 * Runs learner JavaScript in a throwaway Web Worker.
 *
 * Isolation:
 *  - A Worker has no DOM, no access to the page, cookies or localStorage.
 *  - Network and storage APIs (fetch, XHR, WebSocket, indexedDB, caches, importScripts…)
 *    are removed before learner code runs.
 *  - Each run gets a fresh worker that is terminated afterwards, or after `timeoutMs`
 *    (so `while (true) {}` can't freeze the app).
 */

export interface LogLine {
  level: 'log' | 'info' | 'warn' | 'error';
  text: string;
}

export interface RunError {
  name: string;
  message: string;
  /** 1-based line in the learner's code, when it can be determined. */
  line?: number;
}

export interface RunResult {
  logs: LogLine[];
  error?: RunError;
  /** One entry per expression passed in `exprs`. */
  /** ok = truthy result; json = the value as JSON (for comparing with expected values). */
  results: { ok: boolean; error?: string; json?: string }[];
  timedOut: boolean;
  ms: number;
}

const WORKER_SOURCE = String.raw`
for (const k of ['fetch','XMLHttpRequest','WebSocket','EventSource','indexedDB','caches','importScripts','BroadcastChannel','Worker','SharedWorker']) {
  try { Object.defineProperty(self, k, { value: undefined, writable: false, configurable: false }); } catch (e) {}
}

function fmt(v, depth) {
  depth = depth || 0;
  if (typeof v === 'string') return depth ? JSON.stringify(v) : v;
  if (typeof v === 'function') return '[Function ' + (v.name || 'anonymous') + ']';
  if (typeof v === 'undefined') return 'undefined';
  if (typeof v === 'bigint') return v + 'n';
  if (typeof v === 'symbol') return v.toString();
  if (v === null || typeof v !== 'object') return String(v);
  if (v instanceof Error) return v.name + ': ' + v.message;
  if (depth > 3) return Array.isArray(v) ? '[Array]' : '[Object]';
  if (Array.isArray(v)) return '[ ' + v.map(x => fmt(x, depth + 1)).join(', ') + ' ]';
  if (v instanceof Map) return 'Map(' + v.size + ') { ' + [...v].map(([k, x]) => fmt(k, depth + 1) + ' => ' + fmt(x, depth + 1)).join(', ') + ' }';
  if (v instanceof Set) return 'Set(' + v.size + ') { ' + [...v].map(x => fmt(x, depth + 1)).join(', ') + ' }';
  const keys = Object.keys(v);
  if (!keys.length) return '{}';
  return '{ ' + keys.map(k => k + ': ' + fmt(v[k], depth + 1)).join(', ') + ' }';
}

// Function() wraps the body in 2 header lines, plus our "use strict" line.
const LINE_OFFSET = 3;
function lineOf(err) {
  const m = /<anonymous>:(\d+):\d+/.exec(String(err && err.stack));
  if (!m) return undefined;
  const n = Number(m[1]) - LINE_OFFSET;
  return n > 0 ? n : undefined;
}

self.onmessage = async (e) => {
  const { code, exprs } = e.data;
  const logs = [];
  const push = (level) => (...args) => { if (logs.length < 500) logs.push({ level, text: args.map(a => fmt(a)).join(' ') }); };
  const con = { log: push('log'), info: push('info'), warn: push('warn'), error: push('error'), debug: push('log'), table: push('log') };
  self.console = con;
  let error, results = [];
  try {
    const fn = new Function('console', '"use strict";\n' + code + '\n;return [' + exprs.map(x => '() => (' + x + ')').join(',') + '];');
    const tests = fn(con);
    results = tests.map(t => { try { const v = t(); let json; try { json = JSON.stringify(v); } catch (e) {} return { ok: !!v, json }; } catch (err) { return { ok: false, error: err && err.message }; } });
  } catch (err) {
    error = { name: (err && err.name) || 'Error', message: (err && err.message) || String(err), line: lineOf(err) };
    results = exprs.map(() => ({ ok: false, error: 'Your code stopped with an error before this could be checked.' }));
  }
  // Let promise callbacks and zero-delay timers print before reporting.
  await new Promise(r => setTimeout(r, 30));
  postMessage({ logs, error, results });
};
`;

let workerUrl: string | null = null;
const getWorkerUrl = () => (workerUrl ??= URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' })));

export function runJs(code: string, exprs: string[] = [], timeoutMs = 2000): Promise<RunResult> {
  const started = performance.now();
  return new Promise((resolve) => {
    const worker = new Worker(getWorkerUrl());
    const timer = window.setTimeout(() => {
      worker.terminate();
      resolve({
        logs: [],
        timedOut: true,
        error: { name: 'Timeout', message: `Your code ran for more than ${timeoutMs / 1000}s and was stopped. Is there a loop that never ends?` },
        results: exprs.map(() => ({ ok: false, error: 'Timed out' })),
        ms: timeoutMs,
      });
    }, timeoutMs);
    worker.onmessage = (e) => {
      window.clearTimeout(timer);
      worker.terminate();
      resolve({ ...e.data, timedOut: false, ms: Math.round(performance.now() - started) });
    };
    worker.onerror = (e) => {
      e.preventDefault();
      window.clearTimeout(timer);
      worker.terminate();
      resolve({ logs: [], error: { name: 'Error', message: e.message }, results: exprs.map(() => ({ ok: false })), timedOut: false, ms: 0 });
    };
    worker.postMessage({ code, exprs });
  });
}

/** Beginner-friendly explanations for the most common JS errors. */
export function explainError(err: RunError): string | undefined {
  const m = err.message;
  if (err.name === 'ReferenceError' && /is not defined/.test(m)) {
    const name = m.split(' ')[0];
    return `JavaScript doesn't know anything called \`${name}\`. Check the spelling (capital letters matter) and that you created it with let, const or function before using it.`;
  }
  if (err.name === 'SyntaxError') {
    if (/Unexpected end of input/.test(m)) return 'The code ends too early — usually a missing closing bracket } or ).';
    if (/Unexpected token/.test(m)) return 'Something is in a place JavaScript didn’t expect. Look for a missing comma, bracket or quote.';
    if (/Invalid or unexpected token/.test(m)) return 'There’s a character JavaScript can’t read — often an unclosed quote or a “smart quote” pasted from a document.';
    if (/missing \) after argument list/.test(m)) return 'A function call is missing its closing ). Count your brackets.';
    return 'The code isn’t valid JavaScript yet. Check brackets, quotes and commas.';
  }
  if (err.name === 'TypeError') {
    if (/is not a function/.test(m)) return 'You tried to call something with () that isn’t a function. Check the name and what it holds.';
    if (/Cannot read properties of (undefined|null)/.test(m)) return 'You asked for a property of something that is empty (undefined/null). Check the value exists first.';
    if (/Assignment to constant variable/.test(m)) return 'A const can’t be given a new value. Use let if the value needs to change.';
  }
  return undefined;
}
