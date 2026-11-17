# CodeVerse

An interactive platform for learning to code, from zero to professional.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (Vitest)
npm run build    # typecheck + production build
```

## Stack

| Concern | Choice | Why |
|---|---|---|
| UI | React 19 + TypeScript, Vite | Fast dev loop, type safety, no server needed for the core app |
| Routing | React Router 6 | Nested routes inside one app shell |
| State | Zustand + `persist` (localStorage) | Progress survives reloads with no account; one store to swap for a backend later |
| Editor | CodeMirror 6 | Small, accessible, extensible; lazy-loaded with lesson pages |
| Accounts & sync | Supabase (optional) | GitHub, Discord and Google sign-in plus a Postgres row per user with Row Level Security. See [SETUP-ACCOUNTS.md](SETUP-ACCOUNTS.md) |
| Python | Pyodide 0.27.5 (WebAssembly, from jsDelivr) | Real CPython in a worker, no server needed |
| SQL | sql.js (SQLite, WebAssembly, bundled) | Fresh seeded database on every run |
| Logos | simple-icons (CC0 data) | Official language logos; the trademarks belong to their owners |
| Icons | lucide-react | Consistent, tree-shaken |
| Styling | Plain CSS with design tokens (`src/styles/tokens.css`) | One token set drives dark/light themes, font scaling and reduced motion |

## Layout

```
src/
  styles/        tokens.css (colors, type, spacing) → base → components → layout
  store/         useAppStore (prefs, XP, activity log, achievements), useToasts
  lib/           progress.ts (pure XP/level/streak logic, unit-tested), hooks.ts, nav.ts
  data/          languages.ts, achievements.ts, glossary.ts
  components/    layout/ (AppShell, CommandPalette), ui/, code/ (CodeEditor, CodeBlock), lesson/ (blocks, Exercise)
  content/       courses/*.ts (lesson content), placement.ts, types.ts (content model)
  runtime/       jsRunner (Web Worker), checks (HTML/CSS/JS graders), PreviewFrame (sandboxed iframe)
  pages/         one file per route
```

## Accounts and saving

Progress is **only saved for signed-in learners**. Guests can use everything, but their progress lives in the browser tab (sessionStorage) and is merged into their account if they sign in. Signing out clears the device. See `src/lib/progressStorage.ts`.

## Brand

Logo files are in `public/brand/`: the mark (light and dark), the full logo (light and dark), and an app icon. The in-app logo is `src/components/ui/Logo.tsx`.

## Design styles

Learners choose one of three designs during first-run setup or in **Settings → Appearance**, each with light and dark modes:
- **Technical book**: serif headings, hairline rules, warm paper and ink.
- **Terminal**: monospace throughout, sharp boxes, amber accent.
- **Bright & friendly**: rounded and colourful, with a brand colour for each language.

Styles are tokens in `src/styles/tokens.css` (`data-style` × `data-theme`), plus structural tweaks in `src/styles/themes.css`.

## Writing a lesson

Lessons are typed data in `src/content/courses/`. Blocks: `text`, `heading`, `code` (optionally with a live preview or a Run button), `callout`, `quiz`, `exercise` (graded) and `playground` (ungraded). Text uses a small safe Markdown subset: `**bold**`, inline code, `[links](/path)` and `{term:id|label}` glossary tooltips.

Exercise checks:
- `html`: a test function on a DOMParser document (scripts never run)
- `css`: a test on the parsed stylesheet (`get(selector, prop)`)
- `js`: an expression evaluated after the learner's code in the sandboxed worker
- `output`: expected console lines (`'*'` matches any line)

**Videos:** curated free videos live in `src/content/videos.ts`. Each ID was checked against YouTube's oEmbed endpoint. Nothing loads from YouTube until a learner presses play, and then it loads from youtube-nocookie.com.

**Challenges** live in `src/content/challenges.ts` (JavaScript, Python, SQL). Each has visible and hidden tests (or a reference SQL query), hints and an explanation.

**QA:** `npm test` checks content structure and the sync merge logic. In dev, open `/dev/content-check` to run every exercise **and challenge** through the real graders: each solution must pass and each starter must fail.

## Code execution and security

- **JavaScript** runs in a fresh Web Worker per run. `fetch`, XHR, WebSocket, IndexedDB, caches and `importScripts` are removed first, and the worker is terminated after 2 s, so infinite loops can't freeze the app. Workers have no DOM, cookies or localStorage.
- **HTML/CSS previews** render in `<iframe sandbox="">` (no scripts at all). Graders parse code; they never execute it on the page.
- **Python** runs in a Pyodide worker. Network APIs are removed after it loads, each run gets a fresh namespace, and runs are stopped after 5 s.
- **SQL** runs in a module worker on a fresh in-memory SQLite database, stopped after 3 s.
- **Playground web previews** run in `<iframe sandbox="allow-scripts allow-modals allow-forms">`. That is an opaque origin with no access to CodeVerse, its storage or its cookies. Console output reaches the app through `postMessage`, and the source window is checked.
- **Share links** pack the project into the URL fragment (`#share=…`), which is never sent to any server.
- Nothing is executed on a server.

## Honesty rules baked into the code

- **Runtimes**: `data/languages.ts` has a `runtime.status` per language. The UI shows "Runs in browser" only when the status is `available`. Today that's HTML, CSS, JavaScript, Python and SQL.
- **Unbuilt sections**: nav items with a `phase` render `InDevelopment`, which lists what is planned. There is no fake content.
- **Learning time**: counted only while the tab is visible and the learner interacted within the last 90 seconds.
- **Streaks**: a missed day only resets the current streak. XP, badges and history are never taken away.

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | Inspect repo | Done (repo was empty, so this is a greenfield build) |
| 2 | Design system, shell, navigation, dashboard, settings | Done |
| 3 | Lessons, courses, placement quiz, notes, bookmarks, certificates | Done: 5 courses, 23 lessons, 23 graded exercises |
| 4 | Playground, Python and SQL runtimes, multi-file editor, challenges; plus 3 design styles, language logos, curated videos, Supabase accounts and sync | **Done** |
| 5 | AI tutor via a Supabase Edge Function (API key server-side only, signed-in users, daily limit) | **Built**: switch on with [SETUP-AI-TUTOR.md](SETUP-AI-TUTOR.md) |
| 6 | 11 career roadmaps, 7 guided projects, more achievements | **Done** |
| 7 | Docs centre, dev tools, community (needs accounts + DB) | Planned |
| 8 | Testing, accessibility, performance pass | Planned |
