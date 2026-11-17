import type { CodeLang } from './types';

export interface PlacementQuestion {
  id: string;
  question: string;
  code?: { lang: CodeLang; code: string };
  options: string[];
  answer: number;
}

/** Ordered from easiest to hardest. Every question also offers "I'm not sure" to discourage guessing. */
export const PLACEMENT: PlacementQuestion[] = [
  {
    id: 'p1',
    question: 'What is HTML mainly used for?',
    options: ['Styling colours and fonts', 'Describing the structure and content of a web page', 'Storing data in a database', 'Making a computer run faster'],
    answer: 1,
  },
  {
    id: 'p2',
    question: 'Which HTML creates a link?',
    options: ['`<link>Home</link>`', '`<a href="/home">Home</a>`', '`<href="/home">Home</href>`', '`<url>/home</url>`'],
    answer: 1,
  },
  {
    id: 'p3',
    question: 'What does this CSS do?',
    code: { lang: 'css', code: '.warning {\n  color: red;\n}' },
    options: ['Makes every element red', 'Makes elements with class "warning" have red text', 'Creates a red warning box', 'Nothing — it is invalid'],
    answer: 1,
  },
  {
    id: 'p4',
    question: 'What does this print?',
    code: { lang: 'javascript', code: 'let x = 4;\nx = x + 3;\nconsole.log(x);' },
    options: ['4', '3', '7', '43'],
    answer: 2,
  },
  {
    id: 'p5',
    question: 'What does this print?',
    code: { lang: 'javascript', code: 'function f(n) {\n  if (n > 10) return "big";\n  return "small";\n}\nconsole.log(f(5));' },
    options: ['big', 'small', 'undefined', '5'],
    answer: 1,
  },
  {
    id: 'p6',
    question: 'Given `const a = [5, 8, 2]`, what is `a[1]`?',
    options: ['5', '8', '2', 'undefined'],
    answer: 1,
  },
  {
    id: 'p7',
    question: 'What does this return?',
    code: { lang: 'javascript', code: '[1, 2, 3, 4].filter((n) => n % 2 === 0).map((n) => n * 10)' },
    options: ['[10, 20, 30, 40]', '[20, 40]', '[2, 4]', '60'],
    answer: 1,
  },
  {
    id: 'p8',
    question: 'What is `user` after this code?',
    code: { lang: 'javascript', code: 'const user = { name: "Ana", role: "user" };\nconst admin = { ...user, role: "admin" };' },
    options: ['{ name: "Ana", role: "admin" }', '{ name: "Ana", role: "user" }', '{ role: "admin" }', 'An error, because user is const'],
    answer: 1,
  },
];

export const NOT_SURE = 'I’m not sure';

/** Maps a score to the recommended starting course, with a reason the learner can read. */
export function placementRecommendation(score: number): { courseId: string; reason: string } {
  if (score <= 2) return { courseId: 'start-here', reason: 'You’re at the very beginning — perfect. Start Here explains how code works before you write any.' };
  if (score <= 4) return { courseId: 'html-foundations', reason: 'You know the basic ideas. HTML Foundations gets you building real pages straight away.' };
  if (score <= 6) return { courseId: 'js-foundations', reason: 'You can read HTML, CSS and simple code. JavaScript Foundations will make you fluent in programming logic.' };
  return { courseId: 'js-working-with-data', reason: 'You’re comfortable with JavaScript. Working with Data covers the patterns professionals use every day.' };
}
