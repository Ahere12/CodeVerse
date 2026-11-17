import type { Course } from '../types';

export const jsData: Course = {
  id: 'js-working-with-data',
  languageId: 'javascript',
  level: 'intermediate',
  title: 'JavaScript: Working with Data',
  description: 'Transform data like a professional: map, filter, reduce, destructuring, spread and JSON.',
  outcomes: ['Transform arrays with map and filter', 'Summarise data with reduce', 'Use destructuring and spread for cleaner code', 'Convert between objects and JSON'],
  prerequisites: ['js-foundations'],
  lessons: [
    {
      id: 'jsd-map-filter',
      title: 'map and filter',
      minutes: 11,
      goal: 'Create new arrays by transforming or selecting items without writing loops by hand.',
      blocks: [
        {
          type: 'text',
          md: `Loops work, but most real code uses **array methods** that say *what* you want instead of *how* to loop:

- \`.map(fn)\` — a new array where every item is transformed by \`fn\`
- \`.filter(fn)\` — a new array with only the items where \`fn\` returns \`true\`

Neither changes the original array. That makes bugs rarer, because data isn't modified behind your back.`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `const prices = [10, 25, 4, 60];

const withTax = prices.map((p) => p * 1.2);
const expensive = prices.filter((p) => p > 20);

console.log(withTax);
console.log(expensive);
console.log(prices); // unchanged`,
        },
        {
          type: 'text',
          md: `They **chain** well, reading top to bottom like a pipeline:`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `const users = [
  { name: "Ana", active: true },
  { name: "Ben", active: false },
  { name: "Cy", active: true },
];

const activeNames = users
  .filter((u) => u.active)
  .map((u) => u.name.toUpperCase());

console.log(activeNames);`,
        },
        {
          type: 'quiz',
          id: 'jsd-q-map',
          question: 'What is `[1, 2, 3].map((n) => n > 1)`?',
          options: ['`[2, 3]`', '`[false, true, true]`', '`[1, 2, 3]`', '`true`'],
          answer: 1,
          explain: '`map` always returns an array of the **same length**, with each item replaced by the function’s result. Here the result is a boolean. To keep only some items, use `filter`.',
        },
        {
          type: 'exercise',
          id: 'jsd-ex-map-filter',
          lang: 'javascript',
          title: 'Passed students',
          prompt: `Write \`passedNames(students)\` that returns the **names** of students whose \`score\` is 50 or more, using \`filter\` and \`map\`.`,
          starter: `function passedNames(students) {\n  \n}\n\nconsole.log(passedNames([\n  { name: "Ira", score: 81 },\n  { name: "Jo", score: 45 },\n  { name: "Lu", score: 50 },\n]));\n`,
          solution: `function passedNames(students) {\n  return students\n    .filter((s) => s.score >= 50)\n    .map((s) => s.name);\n}`,
          checks: [
            { kind: 'js', desc: 'Returns `["Ira", "Lu"]` for the example', expr: 'JSON.stringify(passedNames([{ name: "Ira", score: 81 }, { name: "Jo", score: 45 }, { name: "Lu", score: 50 }])) === \'["Ira","Lu"]\'' },
            { kind: 'js', desc: 'Returns `[]` when nobody passed', expr: 'JSON.stringify(passedNames([{ name: "X", score: 3 }])) === "[]"' },
            { kind: 'js', desc: 'Doesn’t modify the input array', expr: '(() => { const a = [{ name: "A", score: 1 }]; passedNames(a); return a.length === 1; })()' },
          ],
          hints: ['First `filter` with `(s) => s.score >= 50`.', 'Then `.map((s) => s.name)`.', 'Remember to `return` the result of the chain.'],
        },
      ],
      summary: ['`map` transforms every item (same length).', '`filter` keeps items where the test is true.', 'Both return new arrays and can be chained.'],
    },
    {
      id: 'jsd-reduce',
      title: 'reduce',
      minutes: 12,
      goal: 'Combine all items of an array into a single value with reduce.',
      blocks: [
        {
          type: 'text',
          md: `\`.reduce(fn, start)\` walks through an array carrying an **accumulator** — a running result. For each item, \`fn(accumulator, item)\` returns the new accumulator. The final accumulator is the answer.`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `const cart = [
  { item: "Book", price: 12, qty: 2 },
  { item: "Pen", price: 1.5, qty: 4 },
];

const total = cart.reduce((sum, line) => sum + line.price * line.qty, 0);
console.log(total);`,
        },
        {
          type: 'text',
          md: `Step by step: the accumulator starts at \`0\` → after Book it's \`24\` → after Pen it's \`30\`.

The accumulator can be anything — including an object. That makes \`reduce\` great for **counting and grouping**:`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `const votes = ["cat", "dog", "cat", "fish", "cat"];

const counts = votes.reduce((acc, animal) => {
  acc[animal] = (acc[animal] || 0) + 1;
  return acc;
}, {});

console.log(counts);`,
        },
        {
          type: 'callout',
          tone: 'tip',
          md: `Always pass the starting value (the second argument). Without it, \`reduce\` uses the first item as the start and throws an error on an empty array.`,
        },
        {
          type: 'exercise',
          id: 'jsd-ex-reduce',
          lang: 'javascript',
          title: 'Word lengths',
          prompt: `Write \`countByLength(words)\` that returns an object mapping each word length to how many words have it. Use \`reduce\`.

Example: \`countByLength(["hi", "yo", "cat"])\` → \`{ 2: 2, 3: 1 }\``,
          starter: `function countByLength(words) {\n  return words.reduce((acc, word) => {\n    // update acc here\n    return acc;\n  }, {});\n}\n`,
          solution: `function countByLength(words) {\n  return words.reduce((acc, word) => {\n    acc[word.length] = (acc[word.length] || 0) + 1;\n    return acc;\n  }, {});\n}`,
          checks: [
            { kind: 'js', desc: 'Example gives `{ 2: 2, 3: 1 }`', expr: '(() => { const r = countByLength(["hi", "yo", "cat"]); return r[2] === 2 && r[3] === 1 && Object.keys(r).length === 2; })()' },
            { kind: 'js', desc: 'Empty array gives `{}`', expr: 'Object.keys(countByLength([])).length === 0' },
            { kind: 'js', desc: 'Works for longer lists', expr: 'countByLength(["a", "bb", "cc", "dd", "eee"])[2] === 3' },
          ],
          hints: ['The key is `word.length`.', '`acc[key] = (acc[key] || 0) + 1;` starts a count at 0 if it doesn’t exist yet.'],
        },
      ],
      summary: ['`reduce(fn, start)` folds an array into one value.', 'The accumulator can be a number, string, array or object.', 'Always provide a starting value.'],
    },
    {
      id: 'jsd-destructuring',
      title: 'Destructuring and spread',
      minutes: 10,
      goal: 'Unpack values from objects and arrays, and copy or merge them with spread.',
      blocks: [
        {
          type: 'text',
          md: `**Destructuring** pulls values out of objects and arrays into variables in one line:`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `const user = { name: "Rae", email: "rae@example.com", plan: "pro" };

const { name, plan } = user;           // object: by key
console.log(name, plan);

const [first, second] = ["gold", "silver", "bronze"]; // array: by position
console.log(first, second);

// Works in function parameters too:
function label({ name, plan = "free" }) {
  return name + " (" + plan + ")";
}
console.log(label({ name: "Tom" }));`,
        },
        {
          type: 'text',
          md: `The **spread** operator \`...\` expands an array or object into another one. It's the standard way to **copy** and **merge** without changing the original:`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `const base = { theme: "dark", fontSize: 14 };
const settings = { ...base, fontSize: 16 };   // later keys win

const a = [1, 2];
const b = [...a, 3, 4];

console.log(settings, base);
console.log(b, a);`,
        },
        {
          type: 'callout',
          tone: 'real-world',
          md: `React and most modern front-end code rely on this pattern: never edit state directly — create an updated copy with spread. You've seen it in CodeVerse's own source: \`{ ...prefs, ...patch }\`.`,
        },
        {
          type: 'quiz',
          id: 'jsd-q-spread',
          question: 'What is `{ ...{ a: 1, b: 2 }, b: 3 }`?',
          options: ['`{ a: 1, b: 2 }`', '`{ a: 1, b: 3 }`', '`{ a: 1, b: 2, b: 3 }`', 'An error'],
          answer: 1,
          explain: 'Keys are copied in order and later ones overwrite earlier ones, so `b` ends up as 3.',
        },
        {
          type: 'exercise',
          id: 'jsd-ex-spread',
          lang: 'javascript',
          title: 'Update without mutating',
          prompt: `Write \`withEmail(user, email)\` that returns a **new** user object with the email replaced, leaving the original untouched. Then write \`fullName({ first, last })\` using destructuring in the parameter, returning \`"first last"\`.`,
          starter: `function withEmail(user, email) {\n  \n}\n\nfunction fullName(person) {\n  \n}\n`,
          solution: `function withEmail(user, email) {\n  return { ...user, email };\n}\n\nfunction fullName({ first, last }) {\n  return first + " " + last;\n}`,
          checks: [
            { kind: 'js', desc: '`withEmail` sets the new email', expr: 'withEmail({ name: "A", email: "old@x.io" }, "new@x.io").email === "new@x.io"' },
            { kind: 'js', desc: '`withEmail` keeps other fields', expr: 'withEmail({ name: "A", email: "o" }, "n").name === "A"' },
            { kind: 'js', desc: '`withEmail` does not change the original', expr: '(() => { const u = { email: "o" }; const r = withEmail(u, "n"); return u.email === "o" && r !== u; })()' },
            { kind: 'js', desc: '`fullName({ first: "Ada", last: "Lovelace" })` is "Ada Lovelace"', expr: 'fullName({ first: "Ada", last: "Lovelace" }) === "Ada Lovelace"' },
          ],
          hints: ['`return { ...user, email: email };` — or the shorthand `{ ...user, email }`.', 'Change the parameter to `{ first, last }`.'],
        },
      ],
      summary: ['Destructuring unpacks: `const { a } = obj`, `const [x] = arr`.', 'Spread `...` copies and merges; later keys win.', 'Prefer copying over mutating shared data.'],
    },
    {
      id: 'jsd-json',
      title: 'JSON',
      minutes: 9,
      goal: 'Convert data to and from JSON and handle invalid JSON safely.',
      blocks: [
        {
          type: 'text',
          md: `**JSON** (JavaScript Object Notation) is the text format the web uses to send data between programs. It looks like JavaScript objects, with stricter rules: keys must be in double quotes, and there are no functions or comments.

- \`JSON.stringify(value)\` — object → JSON text
- \`JSON.parse(text)\` — JSON text → object`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `const order = { id: 7, items: ["tea", "scone"], paid: true };

const text = JSON.stringify(order);
console.log(text);
console.log(typeof text);

const back = JSON.parse(text);
console.log(back.items[1]);`,
        },
        {
          type: 'text',
          md: `\`JSON.parse\` **throws an error** on invalid input — and data from the outside world is often invalid. Wrap it in \`try...catch\` so one bad message doesn't crash your app:`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.log("Bad JSON:", error.message);
    return null;
  }
}

console.log(safeParse('{"ok": true}'));
console.log(safeParse("{ok: true}"));`,
        },
        {
          type: 'quiz',
          id: 'jsd-q-json',
          question: 'Which is valid JSON?',
          options: ["`{ name: 'Ana' }`", '`{ "name": "Ana" }`', "`{ 'name': 'Ana' }`", '`{ "name": "Ana", }`'],
          answer: 1,
          explain: 'JSON needs double-quoted keys and strings, and no trailing comma.',
        },
        {
          type: 'exercise',
          id: 'jsd-ex-json',
          lang: 'javascript',
          title: 'Read settings safely',
          prompt: `Write \`readTheme(json)\` that parses a JSON string and returns its \`theme\` property. If the JSON is invalid **or** has no theme, return \`"light"\`.`,
          starter: `function readTheme(json) {\n  \n}\n`,
          solution: `function readTheme(json) {\n  try {\n    const data = JSON.parse(json);\n    return (data && data.theme) || "light";\n  } catch {\n    return "light";\n  }\n}`,
          checks: [
            { kind: 'js', desc: 'Reads `"dark"` from valid JSON', expr: 'readTheme(\'{"theme":"dark"}\') === "dark"' },
            { kind: 'js', desc: 'Invalid JSON returns "light"', expr: 'readTheme("{theme: dark}") === "light"' },
            { kind: 'js', desc: 'Missing theme returns "light"', expr: 'readTheme(\'{"fontSize":14}\') === "light"' },
            { kind: 'js', desc: '`"null"` returns "light"', expr: 'readTheme("null") === "light"' },
          ],
          hints: ['Put `JSON.parse` inside `try { }` and return `"light"` in `catch { }`.', '`JSON.parse("null")` gives `null` — check the result exists before reading `.theme`.'],
        },
      ],
      summary: ['JSON is text: double-quoted keys, no functions or comments.', '`JSON.stringify` and `JSON.parse` convert back and forth.', 'Always guard `JSON.parse` with `try...catch` for outside data.'],
    },
  ],
};
