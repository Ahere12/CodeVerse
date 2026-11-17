import type { Course } from '../types';

export const jsFoundations: Course = {
  id: 'js-foundations',
  languageId: 'javascript',
  level: 'beginner',
  title: 'JavaScript Foundations',
  description: 'Learn to think like a programmer: values, variables, decisions, functions, loops, arrays and objects.',
  outcomes: ['Store and change data with variables', 'Make decisions with if/else', 'Write reusable functions', 'Repeat work with loops', 'Organise data with arrays and objects'],
  prerequisites: ['start-here'],
  lessons: [
    {
      id: 'js-values',
      title: 'Values and types',
      minutes: 8,
      goal: 'Recognise strings, numbers and booleans, and combine them.',
      blocks: [
        {
          type: 'text',
          md: `Programs work with **values**. Each value has a **type**, which decides what you can do with it:

- **string** — text in quotes: \`"hello"\` or \`'hello'\`
- **number** — \`42\`, \`3.14\`, \`-7\`
- **boolean** — \`true\` or \`false\`, the answer to a yes/no question

\`typeof\` tells you a value's type.`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `console.log(typeof "pizza");
console.log(typeof 12);
console.log(typeof true);

console.log(10 + 5);        // maths
console.log("10" + "5");    // joining text!
console.log(10 > 5);        // comparison gives a boolean`,
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'The "10" + "5" trap',
          md: `With strings, \`+\` **joins** text instead of adding: \`"10" + "5"\` is \`"105"\`. Numbers typed into forms arrive as strings, so this surprises everyone at least once. \`Number("10")\` converts text to a number.`,
        },
        {
          type: 'text',
          md: `Text after \`//\` is a **comment**. JavaScript ignores it — it's a note for humans.`,
        },
        {
          type: 'quiz',
          id: 'js-q-types',
          question: 'What does this print?',
          code: { lang: 'javascript', code: `console.log("3" + 4);` },
          options: ['7', '"34"', '34', 'An error'],
          answer: 2,
          explain: 'One side is a string, so `+` joins them into the text `34`. The console shows strings without quotes.',
        },
        {
          type: 'exercise',
          id: 'js-ex-values',
          lang: 'javascript',
          title: 'Calculator warm-up',
          prompt: `Print three lines:
1. the result of \`15 * 4\`
2. whether \`100\` is greater than \`99\` (a boolean)
3. the words "Code" and "Verse" joined into \`CodeVerse\``,
          starter: `// 1.\n\n// 2.\n\n// 3.\n`,
          solution: `console.log(15 * 4);\nconsole.log(100 > 99);\nconsole.log("Code" + "Verse");`,
          checks: [{ kind: 'output', desc: 'Prints `60`, `true`, `CodeVerse` on three lines', expected: ['60', 'true', 'CodeVerse'] }],
          hints: ['Use one `console.log(...)` per line.', 'Comparisons like `100 > 99` produce `true` or `false`.', 'Join strings with `+`: `"Code" + "Verse"`.'],
        },
      ],
      summary: ['Main types: string, number, boolean.', '`+` adds numbers but joins strings.', 'Comments (`//`) are notes for humans.'],
    },
    {
      id: 'js-variables',
      title: 'Variables',
      minutes: 9,
      goal: 'Store values in variables with let and const, and update them.',
      blocks: [
        {
          type: 'text',
          md: `A **variable** is a named box that holds a value, so you can use it later.

- \`const\` — a box whose value **won't be replaced**. Use this by default.
- \`let\` — a box whose value **can change**.

(You may see \`var\` in older code. It behaves in surprising ways — prefer \`let\` and \`const\`.)`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `const name = "Maya";
let score = 0;

score = score + 10;   // take the old value, add 10, store it back
score += 5;           // shorthand for the same idea

console.log(name + " has " + score + " points");`,
        },
        {
          type: 'text',
          md: `Naming rules: names can contain letters, digits, \`_\` and \`$\`, can't start with a digit, and are **case-sensitive** (\`score\` ≠ \`Score\`). JavaScript developers write multi-word names in **camelCase**: \`totalPrice\`, \`isLoggedIn\`.

**Template literals** make mixing text and values easier. Use backticks and \`\${ }\`:`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: 'const item = "coffee";\nconst price = 3.5;\nconsole.log(`One ${item} costs £${price}`);',
        },
        {
          type: 'quiz',
          id: 'js-q-const',
          question: 'What happens when this runs?',
          code: { lang: 'javascript', code: `const lives = 3;\nlives = 2;` },
          options: ['lives becomes 2', 'lives stays 3 silently', 'TypeError: Assignment to constant variable', 'lives becomes 5'],
          answer: 2,
          explain: 'A `const` can’t be given a new value. If it needs to change, declare it with `let`.',
        },
        {
          type: 'exercise',
          id: 'js-ex-variables',
          lang: 'javascript',
          title: 'Shopping basket',
          prompt: `Create a \`const\` called \`pricePerItem\` set to \`4\` and a \`let\` called \`quantity\` set to \`3\`. Then increase \`quantity\` by \`2\`. Finally create \`total\` (price × quantity) and print \`Total: 20\` using your variables.`,
          starter: `// your variables here\n`,
          solution: 'const pricePerItem = 4;\nlet quantity = 3;\nquantity = quantity + 2;\nconst total = pricePerItem * quantity;\nconsole.log(`Total: ${total}`);',
          checks: [
            { kind: 'js', desc: '`pricePerItem` is 4', expr: 'pricePerItem === 4' },
            { kind: 'js', desc: '`quantity` ends up as 5', expr: 'quantity === 5' },
            { kind: 'js', desc: '`total` is 20', expr: 'total === 20' },
            { kind: 'output', desc: 'Prints `Total: 20`', expected: ['Total: 20'] },
          ],
          hints: ['`quantity` has to change, so use `let` for it.', 'Increase it with `quantity = quantity + 2;` or `quantity += 2;`.', 'Print with `console.log("Total: " + total);`.'],
        },
      ],
      summary: ['`const` by default; `let` when the value must change.', 'Names are case-sensitive; use camelCase.', 'Template literals use backticks and `${...}` to insert values.'],
    },
    {
      id: 'js-conditions',
      title: 'Making decisions',
      minutes: 10,
      goal: 'Run different code depending on conditions using if, else if and else.',
      blocks: [
        {
          type: 'text',
          md: `Programs constantly make decisions: *is the password right? is the basket empty?* \`if\` runs a block of code only when its condition is \`true\`.`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `const temperature = 31;

if (temperature > 30) {
  console.log("It's hot — drink water!");
} else if (temperature > 15) {
  console.log("Nice weather.");
} else {
  console.log("Bring a jacket.");
}`,
        },
        {
          type: 'text',
          md: `Comparison operators produce booleans:

- \`===\` equal, \`!==\` not equal
- \`>\` \`<\` \`>=\` \`<=\`

Combine conditions with \`&&\` (and), \`||\` (or) and \`!\` (not).`,
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Use === not =',
          md: `A single \`=\` **assigns** a value. To **compare**, use \`===\`. (There's also \`==\`, which converts types first — \`"5" == 5\` is true — and causes bugs. Stick to \`===\`.)`,
        },
        {
          type: 'quiz',
          id: 'js-q-if',
          question: 'What does this print?',
          code: { lang: 'javascript', code: `const age = 16;\nconst hasTicket = true;\nif (age >= 18 || hasTicket) {\n  console.log("Enter");\n} else {\n  console.log("Sorry");\n}` },
          options: ['Enter', 'Sorry', 'Both', 'Nothing'],
          answer: 0,
          explain: '`||` needs only one side to be true. `hasTicket` is true, so the whole condition is true.',
        },
        {
          type: 'exercise',
          id: 'js-ex-grade',
          lang: 'javascript',
          title: 'Grade a score',
          prompt: `Set \`score\` to any number. Print \`Pass\` if it is **50 or more**, otherwise print \`Try again\`. Then change the score and run again to test both paths.

We'll check your logic with a score of 72.`,
          starter: `const score = 72;\n\n`,
          solution: `const score = 72;\n\nif (score >= 50) {\n  console.log("Pass");\n} else {\n  console.log("Try again");\n}`,
          checks: [
            { kind: 'js', desc: '`score` is defined', expr: 'typeof score === "number"' },
            { kind: 'output', desc: 'With score 72 it prints `Pass`', expected: ['Pass'] },
          ],
          hints: ['Start with `if (score >= 50) { ... }`.', 'Put `console.log("Try again");` inside an `else { }` block.'],
        },
      ],
      summary: ['`if (condition) { }` runs code only when the condition is true.', 'Chain options with `else if` and a final `else`.', 'Compare with `===`; combine with `&&`, `||`, `!`.'],
    },
    {
      id: 'js-functions',
      title: 'Functions',
      minutes: 11,
      goal: 'Write functions that take parameters and return values.',
      blocks: [
        {
          type: 'text',
          md: `A **function** is a named, reusable recipe. You define it once and **call** it as many times as you like.

- **Parameters** are the inputs, listed in brackets.
- \`return\` sends a result back to whoever called the function.`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Ana"));
console.log(greet("Ben"));

// Arrow functions are a shorter way to write the same thing:
const double = (n) => n * 2;
console.log(double(21));`,
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'return vs console.log',
          md: `\`console.log\` only **shows** a value. \`return\` **hands it back** so other code can use it: \`const total = add(2, 3)\`. Most functions should return their result rather than printing it.`,
        },
        {
          type: 'quiz',
          id: 'js-q-return',
          question: 'What does this print?',
          code: { lang: 'javascript', code: `function square(x) {\n  x * x;\n}\nconsole.log(square(4));` },
          options: ['16', '8', 'undefined', 'An error'],
          answer: 2,
          explain: 'The function calculates `x * x` but never returns it. A function without `return` gives back `undefined`.',
        },
        {
          type: 'exercise',
          id: 'js-ex-functions',
          lang: 'javascript',
          title: 'Temperature converter',
          prompt: `Write a function \`toFahrenheit(celsius)\` that **returns** the temperature in Fahrenheit using the formula \`celsius * 9 / 5 + 32\`.`,
          starter: `function toFahrenheit(celsius) {\n  // your code here\n}\n\nconsole.log(toFahrenheit(100)); // should be 212\n`,
          solution: `function toFahrenheit(celsius) {\n  return celsius * 9 / 5 + 32;\n}\n\nconsole.log(toFahrenheit(100));`,
          checks: [
            { kind: 'js', desc: '`toFahrenheit` is a function', expr: 'typeof toFahrenheit === "function"' },
            { kind: 'js', desc: '`toFahrenheit(0)` returns 32', expr: 'toFahrenheit(0) === 32' },
            { kind: 'js', desc: '`toFahrenheit(100)` returns 212', expr: 'toFahrenheit(100) === 212' },
            { kind: 'js', desc: '`toFahrenheit(-40)` returns -40', expr: 'toFahrenheit(-40) === -40' },
          ],
          hints: ['Use `return` — not `console.log` — inside the function.', '`return celsius * 9 / 5 + 32;`'],
        },
        {
          type: 'exercise',
          id: 'js-ex-max',
          lang: 'javascript',
          title: 'The bigger number',
          prompt: `Write \`biggest(a, b)\` that returns whichever number is larger (either one if they're equal). Don't use \`Math.max\` — practise with \`if\`.`,
          starter: `function biggest(a, b) {\n  \n}\n`,
          solution: `function biggest(a, b) {\n  if (a > b) {\n    return a;\n  }\n  return b;\n}`,
          checks: [
            { kind: 'js', desc: '`biggest(3, 9)` returns 9', expr: 'biggest(3, 9) === 9' },
            { kind: 'js', desc: '`biggest(10, 2)` returns 10', expr: 'biggest(10, 2) === 10' },
            { kind: 'js', desc: '`biggest(-1, -5)` returns -1', expr: 'biggest(-1, -5) === -1' },
            { kind: 'js', desc: '`biggest(4, 4)` returns 4', expr: 'biggest(4, 4) === 4' },
          ],
          hints: ['Compare with `if (a > b)`.', 'You can `return` early: once a function returns, it stops.'],
        },
      ],
      summary: ['Functions package reusable steps; call them with `name(args)`.', 'Parameters are inputs; `return` sends a result back.', 'Arrow functions: `const f = (x) => x * 2;`.'],
    },
    {
      id: 'js-arrays-loops',
      title: 'Arrays and loops',
      minutes: 12,
      goal: 'Store lists in arrays and process every item with a loop.',
      blocks: [
        {
          type: 'text',
          md: `An **array** is an ordered list of values in square brackets. Each item has a numbered position, its **index** — and counting starts at **0**.`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `const fruits = ["apple", "banana", "cherry"];

console.log(fruits[0]);       // first item
console.log(fruits.length);   // how many items

fruits.push("date");          // add to the end
console.log(fruits);`,
        },
        {
          type: 'text',
          md: `To do something with **every** item, use a loop. \`for...of\` walks through the items one by one:`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `const prices = [3, 8, 2];
let total = 0;

for (const price of prices) {
  total += price;
}

console.log("Total:", total);`,
        },
        {
          type: 'text',
          md: `The classic \`for\` loop counts with a variable — useful when you need the index:

\`for (let i = 0; i < 3; i++) { ... }\` means: start \`i\` at 0; keep going while \`i < 3\`; add 1 each time.`,
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Infinite loops',
          md: `If a loop's condition never becomes false, it runs forever. CodeVerse stops your code after 2 seconds, so you can't break anything — but check your loop conditions.`,
        },
        {
          type: 'quiz',
          id: 'js-q-index',
          question: 'What does `colors[2]` give for `const colors = ["red", "green", "blue", "pink"]`?',
          options: ['"green"', '"blue"', '"pink"', 'undefined'],
          answer: 1,
          explain: 'Indexes start at 0: red is 0, green is 1, blue is 2.',
        },
        {
          type: 'exercise',
          id: 'js-ex-sum',
          lang: 'javascript',
          title: 'Sum and average',
          prompt: `Write \`sum(numbers)\` that returns the total of an array of numbers, and \`average(numbers)\` that returns the mean (total ÷ count). \`average([])\` should return \`0\`.`,
          starter: `function sum(numbers) {\n  let total = 0;\n  // loop here\n  return total;\n}\n\nfunction average(numbers) {\n  \n}\n`,
          solution: `function sum(numbers) {\n  let total = 0;\n  for (const n of numbers) {\n    total += n;\n  }\n  return total;\n}\n\nfunction average(numbers) {\n  if (numbers.length === 0) return 0;\n  return sum(numbers) / numbers.length;\n}`,
          checks: [
            { kind: 'js', desc: '`sum([1, 2, 3])` returns 6', expr: 'sum([1, 2, 3]) === 6' },
            { kind: 'js', desc: '`sum([])` returns 0', expr: 'sum([]) === 0' },
            { kind: 'js', desc: '`average([2, 4, 9])` returns 5', expr: 'average([2, 4, 9]) === 5' },
            { kind: 'js', desc: '`average([])` returns 0 (no division by zero)', expr: 'average([]) === 0' },
          ],
          hints: ['Inside `sum`, use `for (const n of numbers) { total += n; }`.', '`average` can reuse `sum`: `sum(numbers) / numbers.length`.', 'Handle the empty array first: `if (numbers.length === 0) return 0;`.'],
        },
      ],
      summary: ['Arrays hold ordered lists; indexes start at 0.', '`.length` counts items; `.push()` adds one.', '`for...of` visits every item; classic `for` counts with an index.'],
    },
    {
      id: 'js-objects',
      title: 'Objects',
      minutes: 10,
      goal: 'Group related data in objects and read and update their properties.',
      blocks: [
        {
          type: 'text',
          md: `An **object** groups related values under names called **keys** (or properties). Where arrays answer "what's at position 2?", objects answer "what's the user's email?".`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `const user = {
  name: "Kai",
  age: 29,
  isAdmin: false,
};

console.log(user.name);      // dot notation
console.log(user["age"]);    // bracket notation

user.age = 30;               // update
user.city = "Lisbon";        // add a new property
console.log(user);`,
        },
        {
          type: 'text',
          md: `Objects and arrays combine naturally. A list of products is usually an **array of objects**:`,
        },
        {
          type: 'code',
          lang: 'javascript',
          preview: true,
          code: `const products = [
  { name: "Pen", price: 2 },
  { name: "Notebook", price: 5 },
];

for (const p of products) {
  console.log(p.name + ": £" + p.price);
}`,
        },
        {
          type: 'callout',
          tone: 'real-world',
          md: `Almost every app works with arrays of objects: posts in a feed, messages in a chat, songs in a playlist. Data from servers usually arrives in this shape as **JSON**.`,
        },
        {
          type: 'quiz',
          id: 'js-q-object',
          question: 'Given `const book = { title: "Dune", pages: 412 }`, how do you get the number of pages?',
          options: ['`book[pages]`', '`book.pages`', '`book(pages)`', '`pages.book`'],
          answer: 1,
          explain: '`book.pages` (or `book["pages"]` with quotes). Without quotes, `book[pages]` looks for a variable named `pages`.',
        },
        {
          type: 'exercise',
          id: 'js-ex-objects',
          lang: 'javascript',
          title: 'Cheapest product',
          prompt: `Write \`cheapest(products)\` that takes an array of \`{ name, price }\` objects and returns the **name** of the cheapest one.`,
          starter: `function cheapest(products) {\n  let best = products[0];\n  // compare each product's price with best.price\n  return best.name;\n}\n\nconsole.log(cheapest([\n  { name: "Tea", price: 3 },\n  { name: "Cake", price: 2 },\n  { name: "Coffee", price: 4 },\n]));\n`,
          solution: `function cheapest(products) {\n  let best = products[0];\n  for (const p of products) {\n    if (p.price < best.price) {\n      best = p;\n    }\n  }\n  return best.name;\n}`,
          checks: [
            { kind: 'js', desc: 'Returns "Cake" for the example', expr: 'cheapest([{ name: "Tea", price: 3 }, { name: "Cake", price: 2 }, { name: "Coffee", price: 4 }]) === "Cake"' },
            { kind: 'js', desc: 'Works when the cheapest is last', expr: 'cheapest([{ name: "A", price: 9 }, { name: "B", price: 1 }]) === "B"' },
            { kind: 'js', desc: 'Works with a single product', expr: 'cheapest([{ name: "Solo", price: 5 }]) === "Solo"' },
          ],
          hints: ['Loop with `for (const p of products)`.', 'If `p.price < best.price`, replace `best` with `p`.'],
        },
      ],
      summary: ['Objects store named values: `{ key: value }`.', 'Read with `obj.key` or `obj["key"]`; assign to update or add.', 'Arrays of objects are the shape of most real app data.'],
    },
  ],
};
