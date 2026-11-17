import type { Level } from './types';
import type { ProjectFile } from '../store/useAppStore';

export interface ProjectStep {
  title: string;
  /** Markdown subset (lib/markdown). */
  md: string;
  /** What "done" looks like — the learner ticks it off. */
  check: string;
}

export interface GuidedProject {
  id: string;
  title: string;
  summary: string;
  difficulty: Level;
  technologies: string[];
  objectives: string[];
  minutes: number;
  /** Course that teaches what's needed. */
  recommended?: string;
  starter: ProjectFile[];
  solution: ProjectFile[];
  steps: ProjectStep[];
}

const f = (name: string, content: string): ProjectFile => ({ name, content });

export const GUIDED_PROJECTS: GuidedProject[] = [
  {
    id: 'portfolio',
    title: 'Personal portfolio',
    summary: 'A one-page site about you: intro, skills, projects and contact links.',
    difficulty: 'beginner',
    technologies: ['HTML', 'CSS'],
    objectives: ['Structure a real page with semantic HTML', 'Style it with a consistent colour and font', 'Lay out cards with Flexbox', 'Make it work on phones'],
    minutes: 45,
    recommended: 'css-foundations',
    starter: [
      f('index.html', '<header>\n  <!-- Step 1: your name and a one-line intro -->\n</header>\n\n<main>\n  <!-- Steps 2–3: skills and projects -->\n</main>\n\n<footer>\n  <!-- Step 4: contact links -->\n</footer>\n'),
      f('style.css', 'body {\n  font-family: system-ui, sans-serif;\n  margin: 0;\n}\n'),
    ],
    solution: [
      f('index.html', '<header class="hero">\n  <h1>Hi, I\'m Ada 👋</h1>\n  <p>I\'m learning to build websites with HTML, CSS and JavaScript.</p>\n</header>\n\n<main>\n  <section>\n    <h2>Skills</h2>\n    <ul class="skills">\n      <li>HTML</li>\n      <li>CSS</li>\n      <li>JavaScript</li>\n    </ul>\n  </section>\n\n  <section>\n    <h2>Projects</h2>\n    <div class="cards">\n      <article class="card">\n        <h3>To-do app</h3>\n        <p>Add, complete and remove tasks.</p>\n      </article>\n      <article class="card">\n        <h3>Calculator</h3>\n        <p>A working calculator with a clean layout.</p>\n      </article>\n    </div>\n  </section>\n</main>\n\n<footer>\n  <a href="mailto:ada@example.com">Email</a> ·\n  <a href="https://github.com/">GitHub</a>\n</footer>\n'),
      f('style.css', ':root { --accent: #b0502a; --ink: #1c1a16; }\n* { box-sizing: border-box; }\nbody { font-family: system-ui, sans-serif; margin: 0; color: var(--ink); line-height: 1.6; }\n.hero { padding: 64px 24px; background: #f4f1ea; text-align: center; }\n.hero h1 { margin: 0 0 8px; font-size: 2.4rem; }\nmain { max-width: 820px; margin: 0 auto; padding: 24px; }\nh2 { border-bottom: 2px solid var(--accent); display: inline-block; }\n.skills { display: flex; gap: 8px; padding: 0; list-style: none; flex-wrap: wrap; }\n.skills li { background: var(--accent); color: white; padding: 4px 12px; border-radius: 999px; }\n.cards { display: flex; gap: 16px; flex-wrap: wrap; }\n.card { flex: 1 1 240px; border: 1px solid #ddd; border-radius: 10px; padding: 16px; }\nfooter { text-align: center; padding: 24px; }\na { color: var(--accent); }\n'),
    ],
    steps: [
      { title: 'Introduce yourself', md: 'In the `<header>`, add an `<h1>` with your name and a `<p>` with one sentence about you. Use your real name or a made-up one.', check: 'The header shows a heading and a short intro.' },
      { title: 'List your skills', md: 'In `<main>`, add a `<section>` with an `<h2>Skills</h2>` and a `<ul>` of 3+ skills. Then in CSS, make the list horizontal with `display: flex; gap: 8px;` and remove bullets with `list-style: none`.', check: 'Skills appear side by side as tags.' },
      { title: 'Show projects as cards', md: 'Add a second `<section>` with `<h2>Projects</h2>` and two or more `<article class="card">` elements, each with an `<h3>` and a `<p>`. Wrap them in `<div class="cards">` and give `.cards` `display: flex; flex-wrap: wrap; gap: 16px`.', check: 'Project cards sit in a row and wrap on narrow screens.' },
      { title: 'Add contact links', md: 'In the `<footer>`, add links: a `mailto:` email link and a link to your GitHub profile.', check: 'Footer has working links.' },
      { title: 'Give it a style', md: 'Pick **one** accent colour and store it in a CSS variable: `:root { --accent: #b0502a; }`. Use `var(--accent)` for headings, tags and links. Add a coloured `.hero` header with padding.', check: 'The page uses one consistent accent colour.' },
      { title: 'Check on a phone', md: 'Make the preview panel narrow (drag the divider). Nothing should overflow sideways. Use `max-width` on `main` and `flex-wrap` where needed.', check: 'The page looks good at narrow widths.' },
    ],
  },
  {
    id: 'landing-page',
    title: 'Product landing page',
    summary: 'A marketing page with a hero, features grid, pricing and a sign-up form.',
    difficulty: 'beginner',
    technologies: ['HTML', 'CSS'],
    objectives: ['Build a hero with a call to action', 'Create a responsive features grid', 'Style an accessible form'],
    minutes: 50,
    recommended: 'css-foundations',
    starter: [
      f('index.html', '<header class="hero">\n  <h1>Product name</h1>\n  <p>One sentence about what it does.</p>\n</header>\n'),
      f('style.css', 'body { font-family: system-ui, sans-serif; margin: 0; }\n'),
    ],
    solution: [
      f('index.html', '<header class="hero">\n  <h1>FocusFlow</h1>\n  <p>The timer that helps you study in calm, focused sessions.</p>\n  <a class="cta" href="#signup">Get early access</a>\n</header>\n\n<section class="features">\n  <article><h3>⏱ Focus timer</h3><p>25-minute sessions with gentle breaks.</p></article>\n  <article><h3>📊 Progress</h3><p>See how much you studied each week.</p></article>\n  <article><h3>🔕 Quiet mode</h3><p>Hides distractions while you work.</p></article>\n</section>\n\n<section id="signup" class="signup">\n  <h2>Join the waitlist</h2>\n  <form>\n    <label for="email">Email</label>\n    <input id="email" type="email" required placeholder="you@example.com">\n    <button>Notify me</button>\n  </form>\n</section>\n'),
      f('style.css', '* { box-sizing: border-box; }\nbody { font-family: system-ui, sans-serif; margin: 0; color: #161a2c; }\n.hero { text-align: center; padding: 80px 24px; background: linear-gradient(#fff, #eef1fb); }\n.hero h1 { font-size: 3rem; margin: 0; }\n.cta { display: inline-block; margin-top: 16px; background: #e8552a; color: white; padding: 12px 22px; border-radius: 999px; text-decoration: none; font-weight: 600; }\n.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; max-width: 900px; margin: 40px auto; padding: 0 24px; }\n.features article { border: 1px solid #e4e7f0; border-radius: 12px; padding: 16px; }\n.signup { text-align: center; padding: 40px 24px; }\nform { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; align-items: center; }\ninput { padding: 10px; border: 1px solid #cdd3e1; border-radius: 8px; min-width: 240px; }\nbutton { padding: 10px 18px; border: 0; border-radius: 8px; background: #161a2c; color: white; cursor: pointer; }\n'),
    ],
    steps: [
      { title: 'Hero section', md: 'Fill the hero with a product name, a one-line promise and a call-to-action link: `<a class="cta" href="#signup">`. Style `.cta` like a button.', check: 'A clear headline and a button-like link.' },
      { title: 'Features grid', md: 'Add a `<section class="features">` with three `<article>`s. Use CSS Grid: `display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;` — it wraps automatically.', check: 'Three feature boxes that reflow on small screens.' },
      { title: 'Sign-up form', md: 'Add `<section id="signup">` with a `<form>`: a labelled email input (`for`/`id`), `required`, and a button. Clicking the hero CTA should scroll here.', check: 'Form is labelled, required, and the CTA jumps to it.' },
      { title: 'Polish', md: 'Add spacing, a max-width for content, and hover styles for the button. Make sure text contrast is easy to read.', check: 'The page feels balanced and readable.' },
    ],
  },
  {
    id: 'calculator',
    title: 'Calculator',
    summary: 'A working calculator with buttons, a display and keyboard support.',
    difficulty: 'intermediate',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    objectives: ['Lay out buttons with CSS Grid', 'Handle clicks with event delegation', 'Keep app state in variables', 'Guard against bad input'],
    minutes: 60,
    recommended: 'js-foundations',
    starter: [
      f('index.html', '<div class="calc">\n  <output id="display">0</output>\n  <div class="keys">\n    <!-- Step 1: add buttons 0-9, + − × ÷, =, C and . -->\n  </div>\n</div>\n'),
      f('style.css', 'body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 90vh; }\n'),
      f('script.js', 'const display = document.getElementById("display");\n\n// Step 2: listen for button clicks\n'),
    ],
    solution: [
      f('index.html', '<div class="calc">\n  <output id="display">0</output>\n  <div class="keys">\n    <button data-key="C" class="fn">C</button><button data-key="/" class="op">÷</button><button data-key="*" class="op">×</button><button data-key="-" class="op">−</button>\n    <button data-key="7">7</button><button data-key="8">8</button><button data-key="9">9</button><button data-key="+" class="op">+</button>\n    <button data-key="4">4</button><button data-key="5">5</button><button data-key="6">6</button><button data-key="=" class="eq">=</button>\n    <button data-key="1">1</button><button data-key="2">2</button><button data-key="3">3</button><button data-key=".">.</button>\n    <button data-key="0" class="zero">0</button>\n  </div>\n</div>\n'),
      f('style.css', 'body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 90vh; background: #f3f4f6; }\n.calc { width: 260px; background: #1c1a16; padding: 16px; border-radius: 16px; }\n#display { display: block; background: #0d0c0a; color: #f3e9dc; font-size: 2rem; text-align: right; padding: 12px; border-radius: 8px; margin-bottom: 12px; overflow: hidden; }\n.keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }\nbutton { padding: 16px 0; font-size: 1.1rem; border: 0; border-radius: 8px; background: #3a352e; color: white; cursor: pointer; }\nbutton:active { transform: scale(0.97); }\n.op { background: #b0502a; }\n.eq { background: #e2875a; grid-row: span 2; }\n.fn { background: #6b645a; }\n.zero { grid-column: span 3; }\n'),
      f('script.js', 'const display = document.getElementById("display");\nlet expression = "";\n\nfunction show(text) {\n  display.textContent = text || "0";\n}\n\nfunction press(key) {\n  if (key === "C") {\n    expression = "";\n  } else if (key === "=") {\n    expression = calculate(expression);\n  } else {\n    const last = expression.slice(-1);\n    const isOp = "+-*/".includes(key);\n    if (isOp && "+-*/".includes(last)) expression = expression.slice(0, -1); // replace operator\n    if (isOp && expression === "") return;\n    expression += key;\n  }\n  show(expression);\n}\n\n// Safe evaluation: only digits, operators and dots are allowed.\nfunction calculate(expr) {\n  if (!/^[0-9+\\-*/.]+$/.test(expr)) return "";\n  try {\n    const result = Function(`"use strict"; return (${expr})`)();\n    if (!Number.isFinite(result)) return "Error";\n    return String(Math.round(result * 1e10) / 1e10);\n  } catch {\n    return "Error";\n  }\n}\n\ndocument.querySelector(".keys").addEventListener("click", (e) => {\n  const key = e.target.dataset.key;\n  if (key) press(key);\n});\n\ndocument.addEventListener("keydown", (e) => {\n  if ("0123456789+-*/.".includes(e.key)) press(e.key);\n  if (e.key === "Enter") press("=");\n  if (e.key === "Escape" || e.key === "Backspace") press("C");\n});\n'),
    ],
    steps: [
      { title: 'Buttons and grid', md: 'Add a `<button>` for each key with a `data-key` attribute, e.g. `<button data-key="7">7</button>` and `<button data-key="*">×</button>`. In CSS, give `.keys` `display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;`.', check: 'All keys appear in a 4-column grid.' },
      { title: 'One click handler', md: 'Instead of one listener per button, add **one** listener on `.keys` and read `e.target.dataset.key`. This is called *event delegation*. Log the key with `console.log` to test.', check: 'Clicking any button logs its key in the console.' },
      { title: 'Build the expression', md: 'Keep a variable `let expression = ""`. Append each pressed key and show it in `#display`. `C` clears it.', check: 'The display shows what you type; C clears it.' },
      { title: 'Calculate safely', md: 'On `=`, first check the text only contains digits, operators and dots with a regular expression: `/^[0-9+\\-*/.]+$/`. Then compute it. Show `Error` for things like division by zero.', check: '`12+3*2` gives `18`, and `5/0` shows Error.' },
      { title: 'Keyboard support', md: 'Listen to `keydown` on `document`: digits and operators press keys, `Enter` is `=`, `Escape` is `C`.', check: 'The calculator works from the keyboard.' },
    ],
  },
  {
    id: 'todo',
    title: 'To-do app',
    summary: 'Add, complete, filter and delete tasks — saved in the browser.',
    difficulty: 'intermediate',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    objectives: ['Handle form submits', 'Create and remove DOM elements', 'Keep state in an array and re-render', 'Save data with localStorage'],
    minutes: 60,
    recommended: 'js-foundations',
    starter: [
      f('index.html', '<h1>To-do</h1>\n<form id="form">\n  <input id="task" placeholder="What needs doing?" required>\n  <button>Add</button>\n</form>\n<ul id="list"></ul>\n'),
      f('style.css', 'body { font-family: system-ui, sans-serif; max-width: 420px; margin: 32px auto; }\n'),
      f('script.js', 'const form = document.getElementById("form");\nconst input = document.getElementById("task");\nconst list = document.getElementById("list");\n\nlet todos = []; // { id, text, done }\n'),
    ],
    solution: [
      f('index.html', '<h1>To-do</h1>\n<form id="form">\n  <input id="task" placeholder="What needs doing?" required aria-label="New task">\n  <button>Add</button>\n</form>\n<div class="filters">\n  <button data-filter="all" class="on">All</button>\n  <button data-filter="active">Active</button>\n  <button data-filter="done">Done</button>\n</div>\n<ul id="list"></ul>\n<p id="count"></p>\n'),
      f('style.css', 'body { font-family: system-ui, sans-serif; max-width: 420px; margin: 32px auto; padding: 0 16px; }\nform { display: flex; gap: 8px; }\ninput { flex: 1; padding: 8px; }\nul { list-style: none; padding: 0; }\nli { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #eee; }\nli.done span { text-decoration: line-through; color: #999; }\nli span { flex: 1; }\n.filters { display: flex; gap: 6px; margin: 12px 0; }\n.filters .on { font-weight: 700; }\n'),
      f('script.js', 'const form = document.getElementById("form");\nconst input = document.getElementById("task");\nconst list = document.getElementById("list");\nconst count = document.getElementById("count");\n\nlet todos = load();\nlet filter = "all";\n\nfunction load() {\n  try {\n    return JSON.parse(localStorage.getItem("todos")) || [];\n  } catch {\n    return [];\n  }\n}\n\nfunction save() {\n  try { localStorage.setItem("todos", JSON.stringify(todos)); } catch {}\n}\n\nfunction render() {\n  list.innerHTML = "";\n  const visible = todos.filter((t) => filter === "all" || (filter === "done" ? t.done : !t.done));\n  for (const todo of visible) {\n    const li = document.createElement("li");\n    li.className = todo.done ? "done" : "";\n    const box = document.createElement("input");\n    box.type = "checkbox";\n    box.checked = todo.done;\n    box.onchange = () => { todo.done = box.checked; update(); };\n    const text = document.createElement("span");\n    text.textContent = todo.text; // textContent, never innerHTML, for user text\n    const del = document.createElement("button");\n    del.textContent = "✕";\n    del.setAttribute("aria-label", `Delete ${todo.text}`);\n    del.onclick = () => { todos = todos.filter((t) => t.id !== todo.id); update(); };\n    li.append(box, text, del);\n    list.append(li);\n  }\n  const left = todos.filter((t) => !t.done).length;\n  count.textContent = `${left} task${left === 1 ? "" : "s"} left`;\n}\n\nfunction update() {\n  save();\n  render();\n}\n\nform.addEventListener("submit", (e) => {\n  e.preventDefault();\n  const text = input.value.trim();\n  if (!text) return;\n  todos.push({ id: Date.now(), text, done: false });\n  input.value = "";\n  update();\n});\n\ndocument.querySelector(".filters").addEventListener("click", (e) => {\n  if (!e.target.dataset.filter) return;\n  filter = e.target.dataset.filter;\n  document.querySelectorAll(".filters button").forEach((b) => b.classList.toggle("on", b === e.target));\n  render();\n});\n\nrender();\n'),
    ],
    steps: [
      { title: 'Add tasks', md: 'Listen for the form’s `submit` event. Call `e.preventDefault()` so the page doesn’t reload, then push `{ id: Date.now(), text, done: false }` into `todos`.', check: 'Submitting adds an item to the `todos` array (log it).' },
      { title: 'Render the list', md: 'Write a `render()` function that clears `list` and creates an `<li>` per todo. Use `textContent` (not `innerHTML`) for the text — it’s safe against injected HTML.', check: 'Tasks appear under the form.' },
      { title: 'Complete and delete', md: 'Give each item a checkbox that toggles `done` and a ✕ button that removes it. After every change, call `render()` again.', check: 'You can tick off and delete tasks.' },
      { title: 'Filters', md: 'Add All / Active / Done buttons. Keep a `filter` variable and use `todos.filter(...)` inside `render()`.', check: 'Filters show the right tasks.' },
      { title: 'Save between visits', md: 'Save with `localStorage.setItem("todos", JSON.stringify(todos))` after each change, and load with `JSON.parse(localStorage.getItem("todos"))` at the start. Wrap both in `try/catch`.', check: 'Tasks survive a page refresh (press Run again).' },
    ],
  },
  {
    id: 'weather',
    title: 'Weather app',
    summary: 'Search a city and show the current weather from a free public API.',
    difficulty: 'intermediate',
    technologies: ['HTML', 'CSS', 'JavaScript', 'APIs'],
    objectives: ['Call a real API with fetch', 'Use async/await', 'Handle loading and errors', 'Display JSON data'],
    minutes: 60,
    recommended: 'js-working-with-data',
    starter: [
      f('index.html', '<h1>Weather</h1>\n<form id="form">\n  <input id="city" placeholder="City, e.g. London" required>\n  <button>Search</button>\n</form>\n<div id="result"></div>\n'),
      f('style.css', 'body { font-family: system-ui, sans-serif; max-width: 420px; margin: 32px auto; padding: 0 16px; }\n'),
      f('script.js', '// Open-Meteo is free and needs no API key.\n// 1) City → coordinates: https://geocoding-api.open-meteo.com/v1/search?name=London&count=1\n// 2) Weather: https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.12&current=temperature_2m,wind_speed_10m\n'),
    ],
    solution: [
      f('index.html', '<h1>Weather</h1>\n<form id="form">\n  <input id="city" placeholder="City, e.g. London" required aria-label="City">\n  <button>Search</button>\n</form>\n<div id="result" aria-live="polite"></div>\n'),
      f('style.css', 'body { font-family: system-ui, sans-serif; max-width: 420px; margin: 32px auto; padding: 0 16px; }\nform { display: flex; gap: 8px; }\ninput { flex: 1; padding: 8px; }\n.card { margin-top: 16px; padding: 16px; border-radius: 12px; background: #eef4ff; }\n.temp { font-size: 2.5rem; font-weight: 700; }\n.error { color: #c8392f; }\n'),
      f('script.js', 'const form = document.getElementById("form");\nconst input = document.getElementById("city");\nconst result = document.getElementById("result");\n\nasync function getJSON(url) {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error(`Request failed (${res.status})`);\n  return res.json();\n}\n\nasync function showWeather(city) {\n  result.textContent = "Loading…";\n  try {\n    const geo = await getJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);\n    const place = geo.results?.[0];\n    if (!place) {\n      result.innerHTML = "";\n      result.textContent = `No city called “${city}” found.`;\n      return;\n    }\n    const data = await getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,wind_speed_10m`);\n    const { temperature_2m, wind_speed_10m } = data.current;\n    result.innerHTML = "";\n    const card = document.createElement("div");\n    card.className = "card";\n    card.innerHTML = `<div class="temp"></div><div class="place"></div><div class="wind"></div>`;\n    card.querySelector(".temp").textContent = `${Math.round(temperature_2m)}°C`;\n    card.querySelector(".place").textContent = `${place.name}, ${place.country}`;\n    card.querySelector(".wind").textContent = `Wind ${wind_speed_10m} km/h`;\n    result.append(card);\n  } catch (err) {\n    result.innerHTML = `<p class="error"></p>`;\n    result.querySelector(".error").textContent = `Couldn’t load the weather: ${err.message}`;\n  }\n}\n\nform.addEventListener("submit", (e) => {\n  e.preventDefault();\n  showWeather(input.value.trim());\n});\n'),
    ],
    steps: [
      { title: 'Find the city', md: 'On submit, call the geocoding API with `fetch`. Use `await res.json()` and log `results[0]` to see the latitude and longitude. Use `encodeURIComponent(city)` in the URL.', check: 'Searching “London” logs its coordinates.' },
      { title: 'Get the weather', md: 'Use the coordinates to call the forecast API with `current=temperature_2m,wind_speed_10m`. Log `data.current`.', check: 'The current temperature appears in the console.' },
      { title: 'Show it', md: 'Display the temperature, place name and wind speed in `#result`. Use `textContent` for any text that came from the API.', check: 'A weather card appears after searching.' },
      { title: 'Loading and errors', md: 'Show “Loading…” while waiting. Wrap everything in `try/catch` and show a friendly message for unknown cities or network problems. Check `res.ok`.', check: 'Typos and offline mode show a helpful message.' },
    ],
  },
  {
    id: 'notes',
    title: 'Notes app',
    summary: 'Create, search, edit and delete notes with autosave.',
    difficulty: 'advanced',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    objectives: ['Two-pane layout', 'Select and edit items', 'Search with filter', 'Debounced autosave'],
    minutes: 90,
    recommended: 'js-working-with-data',
    starter: [
      f('index.html', '<div class="app">\n  <aside>\n    <button id="new">+ New note</button>\n    <input id="search" placeholder="Search notes">\n    <ul id="list"></ul>\n  </aside>\n  <main>\n    <textarea id="editor" placeholder="Select or create a note"></textarea>\n  </main>\n</div>\n'),
      f('style.css', 'body { font-family: system-ui, sans-serif; margin: 0; }\n'),
      f('script.js', 'let notes = []; // { id, text, updated }\nlet currentId = null;\n'),
    ],
    solution: [
      f('index.html', '<div class="app">\n  <aside>\n    <button id="new">+ New note</button>\n    <input id="search" placeholder="Search notes" aria-label="Search notes">\n    <ul id="list"></ul>\n  </aside>\n  <main>\n    <textarea id="editor" placeholder="Select or create a note" aria-label="Note text" disabled></textarea>\n    <div class="bar"><span id="status"></span><button id="delete" disabled>Delete</button></div>\n  </main>\n</div>\n'),
      f('style.css', 'body { font-family: system-ui, sans-serif; margin: 0; }\n.app { display: flex; height: 100vh; }\naside { width: 220px; border-right: 1px solid #ddd; padding: 12px; display: flex; flex-direction: column; gap: 8px; }\naside ul { list-style: none; padding: 0; margin: 0; overflow-y: auto; }\naside li { padding: 8px; border-radius: 6px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\naside li.on { background: #f4f1ea; font-weight: 600; }\nmain { flex: 1; display: flex; flex-direction: column; }\ntextarea { flex: 1; border: 0; padding: 16px; font: inherit; font-size: 1rem; resize: none; outline: none; }\n.bar { display: flex; justify-content: space-between; padding: 8px 16px; border-top: 1px solid #eee; color: #777; font-size: 0.85rem; }\n'),
      f('script.js', 'const listEl = document.getElementById("list");\nconst editor = document.getElementById("editor");\nconst search = document.getElementById("search");\nconst statusEl = document.getElementById("status");\nconst del = document.getElementById("delete");\n\nlet notes = load();\nlet currentId = null;\nlet saveTimer;\n\nfunction load() {\n  try { return JSON.parse(localStorage.getItem("notes")) || []; } catch { return []; }\n}\nfunction persist() {\n  try { localStorage.setItem("notes", JSON.stringify(notes)); } catch {}\n}\n\nconst titleOf = (n) => n.text.split("\\n")[0].trim() || "Untitled";\n\nfunction renderList() {\n  const q = search.value.toLowerCase();\n  listEl.innerHTML = "";\n  notes\n    .filter((n) => n.text.toLowerCase().includes(q))\n    .sort((a, b) => b.updated - a.updated)\n    .forEach((n) => {\n      const li = document.createElement("li");\n      li.textContent = titleOf(n);\n      li.className = n.id === currentId ? "on" : "";\n      li.onclick = () => select(n.id);\n      listEl.append(li);\n    });\n}\n\nfunction select(id) {\n  currentId = id;\n  const note = notes.find((n) => n.id === id);\n  editor.disabled = !note;\n  del.disabled = !note;\n  editor.value = note ? note.text : "";\n  if (note) editor.focus();\n  renderList();\n}\n\ndocument.getElementById("new").onclick = () => {\n  const note = { id: Date.now(), text: "", updated: Date.now() };\n  notes.push(note);\n  persist();\n  select(note.id);\n};\n\neditor.addEventListener("input", () => {\n  const note = notes.find((n) => n.id === currentId);\n  if (!note) return;\n  note.text = editor.value;\n  note.updated = Date.now();\n  statusEl.textContent = "Saving…";\n  clearTimeout(saveTimer); // debounce: save 400 ms after typing stops\n  saveTimer = setTimeout(() => {\n    persist();\n    statusEl.textContent = "Saved";\n    renderList();\n  }, 400);\n});\n\ndel.onclick = () => {\n  if (!confirm("Delete this note?")) return;\n  notes = notes.filter((n) => n.id !== currentId);\n  persist();\n  select(null);\n};\n\nsearch.addEventListener("input", renderList);\nrenderList();\n'),
    ],
    steps: [
      { title: 'Two-pane layout', md: 'Use Flexbox on `.app` so the sidebar (220px) and editor (`flex: 1`) sit side by side at full height (`height: 100vh`).', check: 'Sidebar on the left, big editor on the right.' },
      { title: 'Create and list notes', md: '“New note” pushes `{ id, text: "", updated }` and selects it. `renderList()` shows each note’s first line as its title.', check: 'New notes appear in the list.' },
      { title: 'Edit the selected note', md: 'On `input` in the textarea, update the current note’s `text` and `updated`. Clicking a list item selects it and loads its text.', check: 'You can switch between notes and edit them.' },
      { title: 'Autosave with a debounce', md: 'Don’t save on every keystroke. Use `clearTimeout` + `setTimeout` to save 400ms after typing stops, and show “Saving… / Saved”.', check: 'Notes survive a refresh; status shows Saved.' },
      { title: 'Search and delete', md: 'Filter the list by the search box text. Add a Delete button with a `confirm()` prompt.', check: 'Search narrows the list; delete asks first.' },
    ],
  },
  {
    id: 'game',
    title: 'Click-the-target game',
    summary: 'A 30-second reflex game with a score, timer and high score.',
    difficulty: 'intermediate',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    objectives: ['Position elements randomly', 'Use timers (setInterval)', 'Track game state', 'Store a high score'],
    minutes: 45,
    recommended: 'js-foundations',
    starter: [
      f('index.html', '<div class="hud">Score: <span id="score">0</span> · Time: <span id="time">30</span>s</div>\n<div id="arena">\n  <button id="target" aria-label="Target"></button>\n</div>\n<button id="start">Start</button>\n'),
      f('style.css', 'body { font-family: system-ui, sans-serif; text-align: center; }\n#arena { position: relative; width: 320px; height: 320px; margin: 12px auto; background: #eee; }\n'),
      f('script.js', 'const target = document.getElementById("target");\nconst arena = document.getElementById("arena");\nlet score = 0;\n'),
    ],
    solution: [
      f('index.html', '<div class="hud">Score: <span id="score">0</span> · Time: <span id="time">30</span>s · Best: <span id="best">0</span></div>\n<div id="arena">\n  <button id="target" aria-label="Target" hidden></button>\n</div>\n<button id="start">Start</button>\n'),
      f('style.css', 'body { font-family: system-ui, sans-serif; text-align: center; }\n#arena { position: relative; width: 320px; height: 320px; margin: 12px auto; background: #1c1a16; border-radius: 12px; }\n#target { position: absolute; width: 36px; height: 36px; border-radius: 50%; border: 0; background: #e2875a; cursor: pointer; }\n#target:active { transform: scale(0.9); }\n#start { padding: 8px 20px; }\n'),
      f('script.js', 'const target = document.getElementById("target");\nconst arena = document.getElementById("arena");\nconst scoreEl = document.getElementById("score");\nconst timeEl = document.getElementById("time");\nconst bestEl = document.getElementById("best");\nconst startBtn = document.getElementById("start");\n\nlet score = 0;\nlet timeLeft = 30;\nlet timer = null;\nlet best = Number(localStorage.getItem("best") || 0);\nbestEl.textContent = best;\n\nfunction moveTarget() {\n  const max = arena.clientWidth - target.offsetWidth;\n  target.style.left = Math.random() * max + "px";\n  target.style.top = Math.random() * (arena.clientHeight - target.offsetHeight) + "px";\n}\n\nfunction start() {\n  score = 0;\n  timeLeft = 30;\n  scoreEl.textContent = score;\n  timeEl.textContent = timeLeft;\n  target.hidden = false;\n  startBtn.disabled = true;\n  moveTarget();\n  timer = setInterval(() => {\n    timeLeft--;\n    timeEl.textContent = timeLeft;\n    if (timeLeft <= 0) end();\n  }, 1000);\n}\n\nfunction end() {\n  clearInterval(timer);\n  target.hidden = true;\n  startBtn.disabled = false;\n  if (score > best) {\n    best = score;\n    try { localStorage.setItem("best", best); } catch {}\n    bestEl.textContent = best;\n  }\n  console.log(`Game over! You scored ${score}.`);\n}\n\ntarget.addEventListener("click", () => {\n  score++;\n  scoreEl.textContent = score;\n  moveTarget();\n});\n\nstartBtn.addEventListener("click", start);\n'),
    ],
    steps: [
      { title: 'Style the arena and target', md: 'Make `#arena` `position: relative` and the target `position: absolute`, round (`border-radius: 50%`) and colourful.', check: 'A round target sits inside a box.' },
      { title: 'Move the target', md: 'Write `moveTarget()` that sets `target.style.left` and `top` to random pixel values inside the arena: `Math.random() * (arena.clientWidth - target.offsetWidth)`.', check: 'Calling it puts the target somewhere new.' },
      { title: 'Score', md: 'On target click: add 1 to `score`, update `#score`, and move the target.', check: 'Clicking increases the score.' },
      { title: 'A 30-second timer', md: 'Start button: reset score and time, then `setInterval` every 1000ms to count down. At 0, `clearInterval` and hide the target.', check: 'The game ends after 30 seconds.' },
      { title: 'High score', md: 'Save the best score in `localStorage` and show it in the HUD.', check: 'Your best score is remembered.' },
    ],
  },
];

export const getGuidedProject = (id: string) => GUIDED_PROJECTS.find((p) => p.id === id);
