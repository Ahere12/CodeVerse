/**
 * Python via Pyodide (CPython compiled to WebAssembly), running in a dedicated Web Worker.
 *
 * - Downloaded once from jsDelivr (~10 MB) the first time Python runs, then cached by the browser.
 * - After loading, network APIs are removed from the worker; only the standard library is available.
 * - Each run uses a fresh namespace, so variables don't leak between runs.
 * - Runs longer than the timeout terminate the worker (a new one is started next time).
 */
import type { LogLine, RunError, RunResult } from './jsRunner';

export const PYODIDE_VERSION = '0.27.5';
const CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

const WORKER_SOURCE = String.raw`
importScripts('${CDN}pyodide.js');
let py;
const ready = (async () => {
  py = await loadPyodide({ indexURL: '${CDN}' });
  for (const k of ['fetch','XMLHttpRequest','WebSocket','EventSource','indexedDB','caches','importScripts']) {
    try { Object.defineProperty(self, k, { value: undefined, configurable: false }); } catch (e) {}
  }
  postMessage({ type: 'ready' });
})().catch((e) => postMessage({ type: 'load-error', message: String(e && e.message || e) }));

function parseError(msg) {
  const lines = String(msg).trim().split('\n');
  const last = lines[lines.length - 1] || 'Error';
  const m = /^(\w+(?:Error|Exception|Interrupt|Exit)?):\s*(.*)$/.exec(last);
  let line;
  for (const l of lines) { const lm = /File "<exec>", line (\d+)/.exec(l); if (lm) line = Number(lm[1]); }
  return { name: m ? m[1] : 'Error', message: m ? m[2] : last, line };
}

onmessage = async (e) => {
  await ready;
  const { id, code, tests } = e.data;
  const logs = [];
  py.setStdout({ batched: (s) => logs.length < 1000 && logs.push({ level: 'log', text: s }) });
  py.setStderr({ batched: (s) => logs.length < 1000 && logs.push({ level: 'error', text: s }) });
  py.setStdin({ stdin: () => { throw new Error('input() is not available here. Set the value in your code instead, e.g. name = "Ada"'); } });
  const ns = py.globals.get('dict')();
  let error, results = [];
  try {
    await py.runPythonAsync(code, { globals: ns, filename: '<exec>' });
    for (const t of tests) {
      try {
        const json = py.runPython('__import__("json").dumps(' + t + ', default=str)', { globals: ns });
        results.push({ ok: true, json });
      } catch (err) {
        results.push({ ok: false, error: parseError(err.message).name + ': ' + parseError(err.message).message });
      }
    }
  } catch (err) {
    error = parseError(err.message);
    results = tests.map(() => ({ ok: false, error: 'Your code stopped with an error before this could be checked.' }));
  }
  ns.destroy();
  postMessage({ type: 'result', id, logs, error, results });
};
`;

type Status = 'idle' | 'loading' | 'ready' | 'error';
let worker: Worker | null = null;
let readyPromise: Promise<void> | null = null;
let status: Status = 'idle';
const listeners = new Set<(s: Status) => void>();
const setStatus = (s: Status) => {
  status = s;
  listeners.forEach((l) => l(s));
};

export const pythonStatus = () => status;
export function onPythonStatus(fn: (s: Status) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function boot(): Promise<void> {
  if (readyPromise) return readyPromise;
  setStatus('loading');
  const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }));
  worker = new Worker(url);
  readyPromise = new Promise((resolve, reject) => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === 'ready') {
        worker!.removeEventListener('message', onMsg);
        setStatus('ready');
        resolve();
      } else if (e.data?.type === 'load-error') {
        setStatus('error');
        reset();
        reject(new Error(`Python could not be downloaded (${e.data.message}). Check your internet connection and try again.`));
      }
    };
    worker!.addEventListener('message', onMsg);
  });
  return readyPromise;
}

function reset() {
  worker?.terminate();
  worker = null;
  readyPromise = null;
}

/** Starts downloading Python in the background (e.g. when a Python editor opens). */
export const preloadPython = () => boot().catch(() => {});

let nextId = 1;

export async function runPython(code: string, tests: string[] = [], timeoutMs = 5000): Promise<RunResult> {
  try {
    await boot();
  } catch (e) {
    return { logs: [], error: { name: 'LoadError', message: (e as Error).message }, results: tests.map(() => ({ ok: false })), timedOut: false, ms: 0 };
  }
  const id = nextId++;
  const started = performance.now();
  return new Promise((resolve) => {
    const w = worker!;
    const timer = window.setTimeout(() => {
      w.removeEventListener('message', onMsg);
      reset();
      setStatus('idle');
      resolve({
        logs: [],
        timedOut: true,
        error: { name: 'Timeout', message: `Your code ran for more than ${timeoutMs / 1000}s and was stopped. Is there a loop that never ends?` },
        results: tests.map(() => ({ ok: false, error: 'Timed out' })),
        ms: timeoutMs,
      });
    }, timeoutMs);
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type !== 'result' || e.data.id !== id) return;
      window.clearTimeout(timer);
      w.removeEventListener('message', onMsg);
      const { logs, error, results } = e.data as { logs: LogLine[]; error?: RunError; results: RunResult['results'] };
      // Pyodide prints each line separately; keep them as console lines.
      resolve({ logs, error, results, timedOut: false, ms: Math.round(performance.now() - started) });
    };
    w.addEventListener('message', onMsg);
    w.postMessage({ id, code, tests });
  });
}

/** Plain-language help for common Python errors. */
export function explainPythonError(err: RunError): string | undefined {
  switch (err.name) {
    case 'NameError':
      return 'Python doesn’t know that name. Check the spelling and that you created the variable before using it.';
    case 'IndentationError':
      return 'Python uses indentation (spaces at the start of a line) to group code. Make sure lines inside an `if`, `for` or `def` are indented consistently.';
    case 'SyntaxError':
      return 'The code isn’t valid Python yet. Look for a missing colon `:` after `if`/`for`/`def`, or an unclosed bracket or quote.';
    case 'TypeError':
      return 'An operation got the wrong kind of value — for example adding a number to a string. Convert with `str()` or `int()`.';
    case 'ModuleNotFoundError':
      return 'Only Python’s built-in standard library is available here, so packages like numpy can’t be imported.';
    case 'ZeroDivisionError':
      return 'You divided by zero. Check the value before dividing.';
    case 'IndexError':
      return 'You asked for a position that isn’t in the list. Remember the first item is at index 0.';
    case 'KeyError':
      return 'That key isn’t in the dictionary. Use `.get(key)` to avoid the error, or check with `in` first.';
  }
  return undefined;
}
