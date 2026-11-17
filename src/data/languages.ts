/**
 * Language catalog.
 *
 * `runtime` is the honest source of truth for what can execute in CodeVerse.
 *  - kind: how code would run (in a sandboxed iframe, a Web Worker, WebAssembly, or not at all)
 *  - status: 'available' only once the runtime is actually wired up and tested.
 * The UI must read `status` and never imply execution for anything else.
 */

export type LanguageCategory = 'web' | 'general' | 'data' | 'other';
export type RuntimeKind = 'live-preview' | 'browser-js' | 'wasm' | 'none';
export type RuntimeStatus = 'available' | 'planned' | 'unsupported';

export interface Language {
  id: string;
  name: string;
  category: LanguageCategory;
  /** Two/three-letter mark shown in the language tile. */
  mark: string;
  tagline: string;
  /** What people actually build with it — shown to beginners. */
  usedFor: string[];
  /** Rough beginner-friendliness, 1 (gentle) – 3 (steep). */
  learningCurve: 1 | 2 | 3;
  runtime: { kind: RuntimeKind; status: RuntimeStatus; note: string };
  /** Suggested language to learn first, if any. */
  prerequisite?: string;
}

/** Runtime built and tested — used in lessons today. */
const live = (kind: RuntimeKind, note: string) => ({ kind, status: 'available' as const, note });
const js = (note: string) => ({ kind: 'browser-js' as const, status: 'planned' as const, note });
const wasm = (note: string) => ({ kind: 'wasm' as const, status: 'planned' as const, note });
const none = (note = 'Read, learn and practise. Code does not run in the browser.') => ({
  kind: 'none' as const,
  status: 'unsupported' as const,
  note,
});

export const LANGUAGES: Language[] = [
  // ---------- Web ----------
  { id: 'html', name: 'HTML', category: 'web', mark: 'HT', tagline: 'The structure of every web page.', usedFor: ['Web pages', 'Emails', 'Documentation'], learningCurve: 1, runtime: live('live-preview', 'Live preview in a sandboxed frame with scripts disabled.') },
  { id: 'css', name: 'CSS', category: 'web', mark: 'CS', tagline: 'Colors, layout and style for the web.', usedFor: ['Page design', 'Responsive layouts', 'Animations'], learningCurve: 1, runtime: live('live-preview', 'Live preview in a sandboxed frame; exercises are checked by parsing your CSS.'), prerequisite: 'html' },
  { id: 'javascript', name: 'JavaScript', category: 'web', mark: 'JS', tagline: 'Make web pages interactive.', usedFor: ['Interactive sites', 'Web apps', 'Servers (Node.js)'], learningCurve: 2, runtime: live('browser-js', 'Runs in an isolated Web Worker with no network or storage access, stopped after 2 seconds.'), prerequisite: 'html' },
  { id: 'typescript', name: 'TypeScript', category: 'web', mark: 'TS', tagline: 'JavaScript with types that catch mistakes early.', usedFor: ['Large web apps', 'Tooling', 'APIs'], learningCurve: 2, runtime: js('Transpiled in the browser, then run like JavaScript.'), prerequisite: 'javascript' },
  { id: 'react', name: 'React', category: 'web', mark: 'Re', tagline: 'Build user interfaces from components.', usedFor: ['Single-page apps', 'Dashboards', 'Mobile (React Native)'], learningCurve: 2, runtime: js('Live preview using an in-browser JSX transform.'), prerequisite: 'javascript' },
  { id: 'nextjs', name: 'Next.js', category: 'web', mark: 'Nx', tagline: 'Full-stack React framework.', usedFor: ['Production websites', 'Full-stack apps', 'Blogs'], learningCurve: 3, runtime: none('Needs a Node server — learn concepts here, run locally.'), prerequisite: 'react' },
  { id: 'nodejs', name: 'Node.js', category: 'web', mark: 'No', tagline: 'Run JavaScript on servers and your computer.', usedFor: ['APIs', 'CLI tools', 'Real-time apps'], learningCurve: 2, runtime: none('Server APIs (files, network) are not available in the browser.'), prerequisite: 'javascript' },

  // ---------- General purpose ----------
  { id: 'python', name: 'Python', category: 'general', mark: 'Py', tagline: 'Readable, versatile and great for beginners.', usedFor: ['Automation', 'Data science', 'AI', 'Web backends'], learningCurve: 1, runtime: live('wasm', 'Python 3 (standard library) via Pyodide/WebAssembly in an isolated worker. Downloads ~10 MB the first time.') },
  { id: 'java', name: 'Java', category: 'general', mark: 'Jv', tagline: 'Portable, strongly-typed, enterprise-proven.', usedFor: ['Android apps', 'Enterprise systems', 'Big data'], learningCurve: 2, runtime: none() },
  { id: 'c', name: 'C', category: 'general', mark: 'C', tagline: 'Close to the hardware; the root of many languages.', usedFor: ['Operating systems', 'Embedded devices', 'Performance code'], learningCurve: 3, runtime: none() },
  { id: 'cpp', name: 'C++', category: 'general', mark: 'C++', tagline: 'High performance with powerful abstractions.', usedFor: ['Games', 'Browsers', 'Trading systems'], learningCurve: 3, runtime: none(), prerequisite: 'c' },
  { id: 'csharp', name: 'C#', category: 'general', mark: 'C#', tagline: 'Modern, typed language from Microsoft.', usedFor: ['Unity games', 'Windows apps', 'Web APIs'], learningCurve: 2, runtime: none() },
  { id: 'go', name: 'Go', category: 'general', mark: 'Go', tagline: 'Simple, fast, built for servers.', usedFor: ['Cloud services', 'CLIs', 'DevOps tools'], learningCurve: 2, runtime: none() },
  { id: 'rust', name: 'Rust', category: 'general', mark: 'Rs', tagline: 'Speed and memory safety without a garbage collector.', usedFor: ['Systems code', 'WebAssembly', 'CLIs'], learningCurve: 3, runtime: none() },
  { id: 'ruby', name: 'Ruby', category: 'general', mark: 'Rb', tagline: 'Expressive and developer-friendly.', usedFor: ['Web apps (Rails)', 'Scripting', 'Automation'], learningCurve: 1, runtime: none() },
  { id: 'php', name: 'PHP', category: 'general', mark: 'PHP', tagline: 'Powers a large share of the web.', usedFor: ['WordPress', 'Web backends', 'CMS'], learningCurve: 1, runtime: none() },
  { id: 'kotlin', name: 'Kotlin', category: 'general', mark: 'Kt', tagline: 'Concise, modern language for the JVM and Android.', usedFor: ['Android apps', 'Backends', 'Multiplatform'], learningCurve: 2, runtime: none() },
  { id: 'swift', name: 'Swift', category: 'general', mark: 'Sw', tagline: "Apple's language for iOS and macOS.", usedFor: ['iOS apps', 'macOS apps', 'watchOS'], learningCurve: 2, runtime: none() },
  { id: 'dart', name: 'Dart', category: 'general', mark: 'Dt', tagline: 'The language behind Flutter.', usedFor: ['Cross-platform apps', 'Flutter UIs', 'Web'], learningCurve: 2, runtime: none() },

  // ---------- Data ----------
  { id: 'sql', name: 'SQL', category: 'data', mark: 'SQL', tagline: 'Ask questions of data in tables.', usedFor: ['Reporting', 'Analytics', 'App databases'], learningCurve: 1, runtime: live('wasm', 'Runs on an in-browser SQLite database (sql.js) with a sample shop dataset.') },
  { id: 'postgresql', name: 'PostgreSQL', category: 'data', mark: 'PG', tagline: 'Powerful open-source relational database.', usedFor: ['Production apps', 'Geospatial', 'Analytics'], learningCurve: 2, runtime: none('PostgreSQL-specific features need a real server. Core SQL runs in the SQL playground.'), prerequisite: 'sql' },
  { id: 'mysql', name: 'MySQL', category: 'data', mark: 'My', tagline: 'Popular relational database for the web.', usedFor: ['Web apps', 'WordPress', 'E-commerce'], learningCurve: 2, runtime: none('MySQL-specific features need a real server. Core SQL runs in the SQL playground.'), prerequisite: 'sql' },
  { id: 'mongodb', name: 'MongoDB', category: 'data', mark: 'Mg', tagline: 'Document database storing JSON-like data.', usedFor: ['Flexible schemas', 'Prototypes', 'Content apps'], learningCurve: 2, runtime: none(), prerequisite: 'javascript' },

  // ---------- Other ----------
  { id: 'bash', name: 'Bash', category: 'other', mark: '$_', tagline: 'Talk to Linux and macOS through the terminal.', usedFor: ['Automation', 'Servers', 'DevOps'], learningCurve: 2, runtime: none('A simulated terminal for core commands is planned.') },
  { id: 'powershell', name: 'PowerShell', category: 'other', mark: 'PS', tagline: 'Object-based shell and scripting for Windows.', usedFor: ['Windows admin', 'Automation', 'Cloud ops'], learningCurve: 2, runtime: none() },
  { id: 'lua', name: 'Lua', category: 'other', mark: 'Lu', tagline: 'Tiny, embeddable scripting language.', usedFor: ['Game scripting', 'Roblox', 'Neovim config'], learningCurve: 1, runtime: wasm('Runs via a WebAssembly Lua interpreter (planned).') },
  { id: 'assembly', name: 'Assembly', category: 'other', mark: 'ASM', tagline: 'Instructions the CPU executes directly.', usedFor: ['Reverse engineering', 'Drivers', 'Understanding computers'], learningCurve: 3, runtime: none(), prerequisite: 'c' },
  { id: 'solidity', name: 'Solidity', category: 'other', mark: 'Sol', tagline: 'Smart contracts for Ethereum.', usedFor: ['Smart contracts', 'Tokens', 'DeFi'], learningCurve: 3, runtime: none(), prerequisite: 'javascript' },
  { id: 'r', name: 'R', category: 'other', mark: 'R', tagline: 'Statistics and data visualisation.', usedFor: ['Statistics', 'Research', 'Data visualisation'], learningCurve: 2, runtime: none() },
  { id: 'matlab', name: 'MATLAB', category: 'other', mark: 'ML', tagline: 'Numerical computing for engineering.', usedFor: ['Engineering', 'Signal processing', 'Simulation'], learningCurve: 2, runtime: none('MATLAB is proprietary; no in-browser runtime.') },
];

export const CATEGORY_LABELS: Record<LanguageCategory, string> = {
  web: 'Web development',
  general: 'General programming',
  data: 'Databases & queries',
  other: 'Other technologies',
};

export const getLanguage = (id: string) => LANGUAGES.find((l) => l.id === id);

export const RUNTIME_LABEL: Record<RuntimeStatus, string> = {
  available: 'Runs in browser',
  planned: 'Runtime planned',
  unsupported: 'Learn & reference',
};
