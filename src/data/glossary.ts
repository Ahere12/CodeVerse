/** Plain-language definitions for terms beginners meet early. Used by <Term>. */
export const GLOSSARY: Record<string, { term: string; definition: string }> = {
  code: { term: 'Code', definition: 'Written instructions that tell a computer what to do, in a language it understands.' },
  'programming-language': { term: 'Programming language', definition: 'A set of words and rules for writing instructions a computer can follow — like English has grammar, Python has syntax.' },
  syntax: { term: 'Syntax', definition: 'The spelling and grammar rules of a programming language. A missing bracket is a syntax error.' },
  runtime: { term: 'Runtime', definition: 'The program that actually runs your code. Browsers include a JavaScript runtime; Python needs a Python runtime.' },
  browser: { term: 'Browser', definition: 'The app you use to visit websites (Chrome, Edge, Firefox, Safari). It can also run JavaScript.' },
  frontend: { term: 'Frontend', definition: 'The part of an app people see and click — pages, buttons and layouts.' },
  backend: { term: 'Backend', definition: 'The behind-the-scenes part of an app that stores data and handles requests, usually on a server.' },
  server: { term: 'Server', definition: 'A computer that waits for requests (like loading a page) and sends back responses.' },
  database: { term: 'Database', definition: 'An organised place to store data so it can be searched and updated quickly.' },
  xp: { term: 'XP', definition: 'Experience points. You earn them by finishing lessons and challenges. They track effort — nothing is lost if you take a break.' },
  streak: { term: 'Streak', definition: 'How many days in a row you learned something. Breaks are fine — your progress and XP never go away.' },
  framework: { term: 'Framework', definition: 'A ready-made toolkit and structure for building apps, so you don’t start from zero. React and Next.js are examples.' },
  sandbox: { term: 'Sandbox', definition: 'A walled-off space where code runs safely, unable to touch the rest of your computer or this site.' },
  webassembly: { term: 'WebAssembly', definition: 'A format that lets browsers run programs written in other languages (like Python) at near-native speed.' },
};
