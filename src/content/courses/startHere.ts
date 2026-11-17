import type { Course } from '../types';

export const startHere: Course = {
  id: 'start-here',
  languageId: 'concepts',
  level: 'beginner',
  title: 'Start Here: How Code Works',
  description: 'Never written a line of code? Begin here. Learn what programming is, how websites work, and write your first program — no setup needed.',
  outcomes: ['Explain what code and programming languages are', 'Describe how a browser and a server work together', 'Write and run your first program', 'Read an error message without panicking'],
  prerequisites: [],
  lessons: [
    {
      id: 'sh-what-is-programming',
      title: 'What is programming?',
      minutes: 6,
      goal: 'Explain in your own words what code is and why there are many programming languages.',
      blocks: [
        {
          type: 'text',
          md: `Computers are fast, but not clever. They do **exactly** what they are told — nothing more, nothing less. **Programming** is writing those instructions down.

The instructions are called {term:code|code}, and they are written in a {term:programming-language|programming language}: a small, strict language that both people and computers can read.`,
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Think of a recipe',
          md: `A recipe lists steps in order: "crack two eggs", "whisk for 1 minute", "if the mixture is lumpy, whisk again". Code works the same way — steps, in order, with decisions along the way.`,
        },
        { type: 'heading', text: 'Why so many languages?' },
        {
          type: 'text',
          md: `Different languages are good at different jobs, like different tools in a toolbox:

- **HTML** describes what is on a web page.
- **CSS** decides how that page looks.
- **JavaScript** makes the page react when you click or type.
- **Python** is popular for automation, data and AI.
- **SQL** asks questions of data stored in a {term:database|database}.

The good news: the core ideas — values, decisions, repetition — are shared. Once you learn one language, the next is much easier.`,
        },
        {
          type: 'code',
          lang: 'javascript',
          caption: 'A tiny program — you will write one like this soon',
          code: `let name = "Sam";
console.log("Hello, " + name + "!");`,
          preview: true,
        },
        {
          type: 'text',
          md: `Press **Run** above. The computer followed two steps: remember the word "Sam" under the label \`name\`, then print a greeting. That's a program.`,
        },
        {
          type: 'quiz',
          id: 'sh-q1',
          question: 'Which statement about computers is true?',
          options: ['They guess what you meant if your instructions are unclear.', 'They follow instructions exactly as written.', 'They only understand English.', 'They need a different language for every program.'],
          answer: 1,
          explain: 'Computers follow instructions literally. That’s why small typos matter — and why learning to read your own code carefully is a superpower.',
        },
        {
          type: 'callout',
          tone: 'real-world',
          md: `Everything on your phone — messages, maps, games — is built from millions of instructions like the two lines above, written by people who all started exactly where you are now.`,
        },
      ],
      summary: ['Code is a list of precise instructions for a computer.', 'Programming languages are strict languages that people and computers both understand.', 'Different languages suit different jobs, but the core ideas carry over.'],
    },
    {
      id: 'sh-how-the-web-works',
      title: 'How the web works',
      minutes: 7,
      goal: 'Describe what happens when you open a website, and what HTML, CSS and JavaScript each do.',
      blocks: [
        {
          type: 'text',
          md: `When you type a web address, your {term:browser|browser} sends a request across the internet to a {term:server|server} — a computer whose job is to answer. The server sends back files, and your browser turns them into the page you see.`,
        },
        {
          type: 'text',
          md: `Three kinds of files do most of the work:

1. **HTML** — the content and structure: headings, paragraphs, images, buttons.
2. **CSS** — the style: colours, fonts, spacing, layout.
3. **JavaScript** — the behaviour: what happens when you click, type or scroll.`,
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'A house analogy',
          md: `HTML is the walls and rooms. CSS is the paint and furniture. JavaScript is the electricity — lights that switch on when you press a button.`,
        },
        { type: 'heading', text: 'See it for yourself' },
        {
          type: 'code',
          lang: 'html',
          caption: 'HTML only — structure without style',
          code: `<h1>My first page</h1>
<p>This is a paragraph of text.</p>
<button>Click me</button>`,
          preview: true,
        },
        {
          type: 'code',
          lang: 'css',
          caption: 'Now add CSS to the same HTML',
          html: `<h1>My first page</h1>
<p>This is a paragraph of text.</p>
<button>Click me</button>`,
          code: `h1 { color: seagreen; font-family: Georgia, serif; }
p { color: #555; }
button { padding: 8px 16px; border-radius: 6px; }`,
          preview: true,
        },
        {
          type: 'text',
          md: `Same content, different look. That separation — **what** (HTML) vs **how it looks** (CSS) — is one of the most important ideas in web development.`,
        },
        {
          type: 'quiz',
          id: 'sh-q2',
          question: 'You want a button to show a message when clicked. Which language handles that?',
          options: ['HTML', 'CSS', 'JavaScript', 'SQL'],
          answer: 2,
          explain: 'Behaviour — reacting to clicks, typing and so on — is JavaScript’s job. HTML creates the button; CSS styles it.',
        },
        {
          type: 'quiz',
          id: 'sh-q3',
          question: 'What does a server do?',
          options: ['Displays the page on your screen', 'Answers requests by sending back files and data', 'Stores your browser history', 'Translates CSS into HTML'],
          answer: 1,
          explain: 'Servers answer requests. Your browser is the one that displays the result.',
        },
      ],
      summary: ['Browsers request pages; servers answer with files.', 'HTML = structure, CSS = style, JavaScript = behaviour.', '{term:frontend|Frontend} is what you see; {term:backend|backend} is what happens on the server.'],
    },
    {
      id: 'sh-first-program',
      title: 'Your first program',
      minutes: 8,
      goal: 'Write and run a JavaScript program that prints text.',
      blocks: [
        {
          type: 'text',
          md: `Time to write code. You'll use JavaScript, because every browser can run it — there's nothing to install.

The command \`console.log(...)\` prints whatever you put between the brackets into the **console**: a panel that shows a program's output.`,
        },
        {
          type: 'code',
          lang: 'javascript',
          code: `console.log("Hello!");
console.log(2 + 3);`,
          preview: true,
        },
        {
          type: 'text',
          md: `Notice two things:

- Text goes inside quotes: \`"Hello!"\`. Quoted text is called a **string**.
- Numbers don't need quotes, and JavaScript can do maths with them: \`2 + 3\` prints \`5\`.

Each line is one instruction. They run top to bottom.`,
        },
        {
          type: 'exercise',
          id: 'sh-ex-hello',
          lang: 'javascript',
          title: 'Say hello to the world',
          prompt: `Print exactly \`Hello, world!\` to the console. This is the traditional first program for every programmer.`,
          starter: `// Write your code below this line\n`,
          solution: `console.log("Hello, world!");`,
          checks: [{ kind: 'output', desc: 'Prints `Hello, world!`', expected: ['Hello, world!'] }],
          hints: ['Use `console.log( )` with your text inside the brackets.', 'Text needs quotes around it: `"Hello, world!"` — check the comma and the exclamation mark.'],
        },
        {
          type: 'exercise',
          id: 'sh-ex-two-lines',
          lang: 'javascript',
          title: 'Two lines of output',
          prompt: `Print your favourite food on the first line, then the result of \`7 * 6\` (that's 7 times 6) on the second line.`,
          starter: `console.log("pizza");\n// now print 7 * 6 — no quotes, so JavaScript does the maths\n`,
          solution: `console.log("pizza");\nconsole.log(7 * 6);`,
          checks: [{ kind: 'output', desc: 'Prints a food on line 1 (any text), then `42` on line 2', expected: ['*', '42'] }],
          hints: ['You need a second `console.log(...)` line.', 'Put `7 * 6` inside the brackets **without** quotes, otherwise it prints the text "7 * 6".'],
        },
        {
          type: 'playground',
          lang: 'javascript',
          title: 'Play: try anything',
          starter: `console.log("I am learning to code");\nconsole.log(10 / 4);\nconsole.log("Ha".repeat(3));`,
        },
        {
          type: 'callout',
          tone: 'tip',
          md: `Keyboard shortcut: press **Ctrl + Enter** inside an editor to run or check your code.`,
        },
      ],
      summary: ['`console.log(...)` prints values to the console.', 'Text (strings) needs quotes; numbers don’t.', 'Code runs line by line, from top to bottom.'],
    },
    {
      id: 'sh-errors-are-normal',
      title: 'Errors are normal',
      minutes: 7,
      goal: 'Read an error message, find the line it points to, and fix a simple bug.',
      blocks: [
        {
          type: 'text',
          md: `Every programmer sees errors every day — beginners and experts alike. An error isn't the computer telling you that you failed. It's the computer telling you **where to look**.`,
        },
        {
          type: 'code',
          lang: 'javascript',
          caption: 'This code has a bug. Run it and read the error.',
          code: `let greeting = "Hi there";
console.log(greting);`,
          preview: true,
        },
        {
          type: 'text',
          md: `The error says \`greting is not defined\`. Error messages usually tell you three things:

1. **What kind** of problem — here a \`ReferenceError\`: you referred to something that doesn't exist.
2. **What** it couldn't understand — \`greting\`.
3. **Where** — the line number.

Compare line 2 with line 1: \`greting\` is missing an "e". Computers don't guess; a one-letter typo is a different name.`,
        },
        {
          type: 'exercise',
          id: 'sh-ex-fix-bug',
          lang: 'javascript',
          title: 'Fix the bug',
          prompt: `This program should print \`Total: 15\`, but it crashes. Run it, read the error, and fix it.`,
          starter: `let price = 10;\nlet shipping = 5;\nconsole.log("Total: " + (price + shiping));\n`,
          solution: `let price = 10;\nlet shipping = 5;\nconsole.log("Total: " + (price + shipping));`,
          checks: [{ kind: 'output', desc: 'Prints `Total: 15`', expected: ['Total: 15'] }],
          hints: ['Press "Check my code" first and read the error message — which name does it complain about?', 'Compare the spelling of `shipping` on line 2 and line 3.'],
        },
        {
          type: 'quiz',
          id: 'sh-q4',
          question: 'You see `SyntaxError: missing ) after argument list`. What is the most likely cause?',
          options: ['The computer is broken', 'A bracket was opened but never closed', 'You need to restart the browser', 'The number is too big'],
          answer: 1,
          explain: 'A SyntaxError means the code isn’t written according to the language’s grammar — very often a missing bracket, quote or comma.',
        },
        { type: 'heading', text: 'How to get unstuck' },
        {
          type: 'text',
          md: `- **Read the error** slowly, top to bottom.
- **Go to the line** it mentions — and the line just above it.
- **Check spelling and capitals**: \`Total\` and \`total\` are different names.
- **Count brackets and quotes**: every \`(\` needs a \`)\`, every \`"\` needs a partner.
- **Change one thing at a time**, then run again.
- **Take a break.** Seriously — fresh eyes find bugs fast.`,
        },
      ],
      summary: ['Errors point you to the problem; they aren’t failures.', 'Read the error type, the message, and the line number.', 'Most early bugs are typos, missing brackets or missing quotes.'],
    },
  ],
};
