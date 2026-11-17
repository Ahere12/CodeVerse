import type { Project, ProjectFile, ProjectKind } from '../store/useAppStore';
import type { CodeLang } from '../content/types';

export interface Template {
  id: string;
  name: string;
  description: string;
  kind: ProjectKind;
  files: ProjectFile[];
}

export const TEMPLATES: Template[] = [
  {
    id: 'web-blank',
    name: 'Web page',
    description: 'HTML, CSS and JavaScript with a live preview.',
    kind: 'web',
    files: [
      { name: 'index.html', content: '<main>\n  <h1>Hello!</h1>\n  <p>Edit the files and watch the preview update.</p>\n  <button id="btn">Click me</button>\n</main>\n' },
      { name: 'style.css', content: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 24px;\n}\n\nbutton {\n  padding: 8px 16px;\n  cursor: pointer;\n}\n' },
      { name: 'script.js', content: 'const btn = document.getElementById("btn");\nlet clicks = 0;\n\nbtn.addEventListener("click", () => {\n  clicks++;\n  btn.textContent = `Clicked ${clicks} time${clicks === 1 ? "" : "s"}`;\n  console.log("clicks:", clicks);\n});\n' },
    ],
  },
  {
    id: 'web-card',
    name: 'Profile card',
    description: 'A styled card layout using Flexbox.',
    kind: 'web',
    files: [
      { name: 'index.html', content: '<article class="card">\n  <div class="avatar">AL</div>\n  <div>\n    <h2>Ada Lovelace</h2>\n    <p>First programmer · London</p>\n    <a href="#" class="follow">Follow</a>\n  </div>\n</article>\n' },
      { name: 'style.css', content: 'body { font-family: system-ui, sans-serif; background: #f3f4f6; display: grid; place-items: center; min-height: 90vh; }\n.card { display: flex; gap: 16px; align-items: center; background: white; padding: 20px 24px; border-radius: 12px; box-shadow: 0 4px 16px rgb(0 0 0 / 0.08); }\n.avatar { width: 64px; height: 64px; border-radius: 50%; background: #e8552a; color: white; display: grid; place-items: center; font-weight: 700; font-size: 22px; }\nh2 { margin: 0; }\np { margin: 4px 0 10px; color: #666; }\n.follow { background: #111; color: white; padding: 6px 14px; border-radius: 999px; text-decoration: none; font-size: 14px; }\n' },
      { name: 'script.js', content: 'document.querySelector(".follow").addEventListener("click", (e) => {\n  e.preventDefault();\n  e.target.textContent = e.target.textContent === "Follow" ? "Following" : "Follow";\n});\n' },
    ],
  },
  {
    id: 'web-todo',
    name: 'To-do list',
    description: 'Add, complete and remove tasks with DOM events.',
    kind: 'web',
    files: [
      { name: 'index.html', content: '<h1>To-do</h1>\n<form id="form">\n  <input id="task" placeholder="What needs doing?" required>\n  <button>Add</button>\n</form>\n<ul id="list"></ul>\n' },
      { name: 'style.css', content: 'body { font-family: system-ui, sans-serif; max-width: 420px; margin: 32px auto; }\nform { display: flex; gap: 8px; }\ninput { flex: 1; padding: 8px; }\nli { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; cursor: pointer; }\nli.done span { text-decoration: line-through; color: #999; }\n' },
      { name: 'script.js', content: 'const form = document.getElementById("form");\nconst input = document.getElementById("task");\nconst list = document.getElementById("list");\n\nform.addEventListener("submit", (e) => {\n  e.preventDefault();\n  const li = document.createElement("li");\n  const text = document.createElement("span");\n  text.textContent = input.value;\n  const remove = document.createElement("button");\n  remove.textContent = "✕";\n  remove.onclick = (ev) => { ev.stopPropagation(); li.remove(); };\n  li.append(text, remove);\n  li.onclick = () => li.classList.toggle("done");\n  list.append(li);\n  input.value = "";\n});\n' },
    ],
  },
  {
    id: 'js-console',
    name: 'JavaScript',
    description: 'Plain JavaScript with a console. Great for practising logic.',
    kind: 'javascript',
    files: [{ name: 'main.js', content: 'const numbers = [4, 8, 15, 16, 23, 42];\n\nconst total = numbers.reduce((sum, n) => sum + n, 0);\nconsole.log("Total:", total);\nconsole.log("Evens:", numbers.filter((n) => n % 2 === 0));\n' }],
  },
  {
    id: 'python',
    name: 'Python',
    description: 'Python 3 (standard library) via WebAssembly.',
    kind: 'python',
    files: [{ name: 'main.py', content: 'def greet(name):\n    return f"Hello, {name}!"\n\nfor name in ["Ada", "Grace", "Linus"]:\n    print(greet(name))\n\nsquares = [n * n for n in range(1, 6)]\nprint("Squares:", squares)\n' }],
  },
  {
    id: 'sql',
    name: 'SQL',
    description: 'Query a sample shop database (customers, products, orders).',
    kind: 'sql',
    files: [{ name: 'query.sql', content: '-- Tables: customers, products, orders\nSELECT c.name, p.name AS product, o.quantity\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nJOIN products p ON p.id = o.product_id\nORDER BY o.ordered_at\nLIMIT 10;\n' }],
  },
];

export const langOfFile = (name: string): CodeLang => {
  const ext = name.split('.').pop()?.toLowerCase();
  return ext === 'html' ? 'html' : ext === 'css' ? 'css' : ext === 'js' || ext === 'mjs' ? 'javascript' : ext === 'py' ? 'python' : ext === 'sql' ? 'sql' : 'text';
};

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function fromTemplate(t: Template, name = t.name): Project {
  const now = Date.now();
  return { id: newId(), name, kind: t.kind, files: t.files.map((f) => ({ ...f })), createdAt: now, updatedAt: now };
}

/** Combines a web project into one HTML document: index.html + every .css + every .js. */
export function buildWebDocument(p: Pick<Project, 'files'>, consoleShim = ''): string {
  const html = p.files.find((f) => f.name === 'index.html')?.content ?? '';
  const css = p.files.filter((f) => f.name.endsWith('.css')).map((f) => `/* ${f.name} */\n${f.content}`).join('\n');
  // One <script> per file, named with sourceURL so errors report "script.js:2" rather than a line in the combined page.
  const scripts = p.files
    .filter((f) => /\.m?js$/.test(f.name))
    .map((f) => `<script>${f.content.replace(/<\/script/gi, '<\\/script')}\n//# sourceURL=${f.name}\n</` + 'script>')
    .join('\n');
  const PLACEHOLDER = '__CV_OFFSETS__';
  const offsetsTag = consoleShim ? `<script>window.__cvOffsets=${PLACEHOLDER}</` + 'script>\n' : '';
  const doc = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<style>\n${css}\n</style>\n${offsetsTag}${consoleShim}</head>\n<body>\n${html}\n${scripts}\n</body>\n</html>\n`;
  if (!consoleShim) return doc;
  // Line where each file's code starts, so the console can report lines relative to the file.
  const offsets: Record<string, number> = {};
  for (const f of p.files.filter((x) => /\.m?js$/.test(x.name))) {
    const at = doc.indexOf(`<script>${f.content.replace(/<\/script/gi, '<\\/script')}\n//# sourceURL=${f.name}`);
    if (at >= 0) offsets[f.name] = doc.slice(0, at).split('\n').length - 1;
  }
  return doc.replace(PLACEHOLDER, JSON.stringify(offsets));
}

export function downloadText(filename: string, text: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Share links: project compressed into the URL hash (never sent to a server) ---------- */

const toB64Url = (bytes: Uint8Array) => {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64Url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Response(new Blob([data]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

export const MAX_SHARE_LENGTH = 16_000;

export async function encodeShare(p: Pick<Project, 'name' | 'kind' | 'files'>): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify({ n: p.name, k: p.kind, f: p.files.map((f) => [f.name, f.content]) }));
  return toB64Url(await pipe(json, new CompressionStream('deflate-raw')));
}

export async function decodeShare(s: string): Promise<Pick<Project, 'name' | 'kind' | 'files'> | null> {
  try {
    const bytes = await pipe(fromB64Url(s), new DecompressionStream('deflate-raw'));
    const d = JSON.parse(new TextDecoder().decode(bytes));
    const kinds: ProjectKind[] = ['web', 'javascript', 'python', 'sql'];
    if (!kinds.includes(d.k) || !Array.isArray(d.f)) return null;
    const files = (d.f as unknown[])
      .filter((f): f is [string, string] => Array.isArray(f) && typeof f[0] === 'string' && typeof f[1] === 'string')
      .slice(0, 20)
      .map(([name, content]) => ({ name: name.slice(0, 60), content: content.slice(0, 100_000) }));
    return files.length ? { name: String(d.n ?? 'Shared project').slice(0, 80), kind: d.k, files } : null;
  } catch {
    return null;
  }
}

/** Injected into web previews: forwards console output and errors to the parent page. */
export const CONSOLE_SHIM = `<script>
(function () {
  var send = function (level, args) {
    try {
      parent.postMessage({ __cv: 1, level: level, text: Array.prototype.map.call(args, function (a) {
        if (typeof a === 'string') return a;
        try { return JSON.stringify(a); } catch (e) { return String(a); }
      }).join(' ') }, '*');
    } catch (e) {}
  };
  ['log', 'info', 'warn', 'error'].forEach(function (l) {
    var orig = console[l];
    console[l] = function () { send(l, arguments); orig.apply(console, arguments); };
  });
  window.addEventListener('error', function (e) {
    var file = e.filename ? String(e.filename).split('/').pop() : '';
    var offs = window.__cvOffsets || {};
    var known = file && Object.prototype.hasOwnProperty.call(offs, file);
    var line = known && e.lineno > offs[file] ? e.lineno - offs[file] : e.lineno;
    var where = known ? file + ':' + line : 'line ' + e.lineno;
    send('error', [e.message + (e.lineno ? ' (' + where + ')' : '')]);
  });
  window.addEventListener('unhandledrejection', function (e) { send('error', ['Unhandled promise rejection: ' + (e.reason && e.reason.message || e.reason)]); });
})();
</` + `script>`;
