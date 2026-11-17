import type { Level } from './types';

export type ChallengeLang = 'javascript' | 'python' | 'sql';
export type ChallengeCategory = 'logic' | 'algorithm' | 'debugging' | 'data' | 'real-world';

export interface TestCase {
  /** Arguments as source code in the challenge's language, e.g. `[1, 2], 3` or `"abc"`. */
  args: string;
  expected: unknown;
  /** Hidden tests only run on Submit, so solutions can't just hard-code the examples. */
  hidden?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: Level;
  category: ChallengeCategory;
  lang: ChallengeLang;
  /** Markdown subset (see lib/markdown). */
  description: string;
  examples: { input: string; output: string; note?: string }[];
  starter: string;
  solution: string;
  /** Shown after solving (or after giving up): why the solution works. */
  explanation: string;
  hints: string[];
  /** JS/Python: name of the function under test. */
  fn?: string;
  tests?: TestCase[];
  /** SQL: the reference query whose result the learner's query must match. */
  expectedSql?: string;
  /** SQL: whether row order matters. */
  ordered?: boolean;
  /** Suggested time for timed mode, in minutes. */
  minutes: number;
}

export const getChallenge = (id: string) => CHALLENGES.find((c) => c.id === id);

export const CHALLENGE_XP: Record<Level, number> = { beginner: 15, intermediate: 30, advanced: 50 };

export const CATEGORY_LABEL: Record<ChallengeCategory, string> = {
  logic: 'Logic',
  algorithm: 'Algorithm',
  debugging: 'Debugging',
  data: 'Data',
  'real-world': 'Real-world',
};

export const CHALLENGES: Challenge[] = [
  // ------------------------------------------------------------------ JavaScript
  {
    id: 'js-sum-to-n',
    title: 'Add up to N',
    difficulty: 'beginner',
    category: 'logic',
    lang: 'javascript',
    minutes: 5,
    description: 'Write `sumTo(n)` that returns the sum of every whole number from 1 to `n`. If `n` is less than 1, return `0`.',
    examples: [{ input: 'sumTo(4)', output: '10', note: '1 + 2 + 3 + 4' }, { input: 'sumTo(0)', output: '0' }],
    starter: 'function sumTo(n) {\n  \n}\n',
    solution: 'function sumTo(n) {\n  let total = 0;\n  for (let i = 1; i <= n; i++) total += i;\n  return total;\n}\n',
    explanation: 'A loop from 1 to `n` adds each number to a running `total`. If `n < 1` the loop never runs and `0` is returned. (There is also a formula: `n * (n + 1) / 2`.)',
    hints: ['Start a `total` at 0.', 'Loop with `for (let i = 1; i <= n; i++)`.'],
    fn: 'sumTo',
    tests: [
      { args: '4', expected: 10 },
      { args: '0', expected: 0 },
      { args: '1', expected: 1 },
      { args: '100', expected: 5050, hidden: true },
      { args: '-3', expected: 0, hidden: true },
    ],
  },
  {
    id: 'js-fizzbuzz',
    title: 'FizzBuzz',
    difficulty: 'beginner',
    category: 'algorithm',
    lang: 'javascript',
    minutes: 8,
    description: 'Write `fizzBuzz(n)` that returns `"FizzBuzz"` if `n` is divisible by both 3 and 5, `"Fizz"` if divisible by 3, `"Buzz"` if divisible by 5, and otherwise the number as a string.',
    examples: [{ input: 'fizzBuzz(9)', output: '"Fizz"' }, { input: 'fizzBuzz(10)', output: '"Buzz"' }, { input: 'fizzBuzz(15)', output: '"FizzBuzz"' }, { input: 'fizzBuzz(7)', output: '"7"' }],
    starter: 'function fizzBuzz(n) {\n  \n}\n',
    solution: 'function fizzBuzz(n) {\n  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);\n}\n',
    explanation: 'The `%` (remainder) operator tells you whether a number divides evenly. Check the **combined** case first — otherwise 15 would return "Fizz" before ever reaching "FizzBuzz".',
    hints: ['`n % 3 === 0` means "n divides by 3".', 'Order matters: test for 15 (both) before 3 and 5.', '`String(n)` turns a number into text.'],
    fn: 'fizzBuzz',
    tests: [
      { args: '9', expected: 'Fizz' },
      { args: '10', expected: 'Buzz' },
      { args: '15', expected: 'FizzBuzz' },
      { args: '7', expected: '7' },
      { args: '45', expected: 'FizzBuzz', hidden: true },
      { args: '1', expected: '1', hidden: true },
    ],
  },
  {
    id: 'js-count-vowels',
    title: 'Count the vowels',
    difficulty: 'beginner',
    category: 'logic',
    lang: 'javascript',
    minutes: 6,
    description: 'Write `countVowels(text)` that returns how many vowels (a, e, i, o, u — upper or lower case) are in `text`.',
    examples: [{ input: 'countVowels("Hello World")', output: '3' }, { input: 'countVowels("sky")', output: '0' }],
    starter: 'function countVowels(text) {\n  \n}\n',
    solution: 'function countVowels(text) {\n  let count = 0;\n  for (const ch of text.toLowerCase()) {\n    if ("aeiou".includes(ch)) count++;\n  }\n  return count;\n}\n',
    explanation: 'Lower-casing first means you only compare against five letters. `for...of` walks through each character of a string.',
    hints: ['`text.toLowerCase()` handles capitals.', '`"aeiou".includes(ch)` checks if a character is a vowel.'],
    fn: 'countVowels',
    tests: [
      { args: '"Hello World"', expected: 3 },
      { args: '"sky"', expected: 0 },
      { args: '"AEIOU"', expected: 5, hidden: true },
      { args: '""', expected: 0, hidden: true },
    ],
  },
  {
    id: 'js-palindrome',
    title: 'Palindrome check',
    difficulty: 'beginner',
    category: 'algorithm',
    lang: 'javascript',
    minutes: 10,
    description: 'Write `isPalindrome(text)` that returns `true` if `text` reads the same forwards and backwards, **ignoring case, spaces and punctuation**.',
    examples: [{ input: 'isPalindrome("Racecar")', output: 'true' }, { input: 'isPalindrome("A man, a plan, a canal: Panama")', output: 'true' }, { input: 'isPalindrome("hello")', output: 'false' }],
    starter: 'function isPalindrome(text) {\n  \n}\n',
    solution: 'function isPalindrome(text) {\n  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return clean === clean.split("").reverse().join("");\n}\n',
    explanation: 'First **normalise** the text: lower-case it and remove anything that isn’t a letter or digit. Then compare it with its reverse (`split` → `reverse` → `join`).',
    hints: ['Remove non-letters with `.replace(/[^a-z0-9]/g, "")` after lower-casing.', 'Reverse a string with `s.split("").reverse().join("")`.'],
    fn: 'isPalindrome',
    tests: [
      { args: '"Racecar"', expected: true },
      { args: '"A man, a plan, a canal: Panama"', expected: true },
      { args: '"hello"', expected: false },
      { args: '"No lemon, no melon"', expected: true, hidden: true },
      { args: '"ab"', expected: false, hidden: true },
    ],
  },
  {
    id: 'js-debug-average',
    title: 'Fix the average',
    difficulty: 'beginner',
    category: 'debugging',
    lang: 'javascript',
    minutes: 6,
    description: 'This `average(numbers)` function is supposed to return the mean of an array, and `0` for an empty array — but it gives wrong answers. Find and fix the bugs.',
    examples: [{ input: 'average([2, 4, 6])', output: '4' }, { input: 'average([])', output: '0' }],
    starter: 'function average(numbers) {\n  let total = 0;\n  for (let i = 1; i < numbers.length; i++) {\n    total += numbers[i];\n  }\n  return total / numbers.length;\n}\n',
    solution: 'function average(numbers) {\n  if (numbers.length === 0) return 0;\n  let total = 0;\n  for (let i = 0; i < numbers.length; i++) {\n    total += numbers[i];\n  }\n  return total / numbers.length;\n}\n',
    explanation: 'Two bugs: the loop started at index **1**, skipping the first number (arrays start at 0), and an empty array divided 0 by 0, giving `NaN`. Guard the empty case first.',
    hints: ['Run it with `[2, 4, 6]` — which number is being skipped?', 'What is `0 / 0` in JavaScript?'],
    fn: 'average',
    tests: [
      { args: '[2, 4, 6]', expected: 4 },
      { args: '[]', expected: 0 },
      { args: '[10]', expected: 10, hidden: true },
      { args: '[1, 2]', expected: 1.5, hidden: true },
    ],
  },
  {
    id: 'js-debug-max',
    title: 'Fix the maximum',
    difficulty: 'intermediate',
    category: 'debugging',
    lang: 'javascript',
    minutes: 6,
    description: '`largest(numbers)` should return the biggest number in a non-empty array. It works for some inputs but not others. Find the bug.',
    examples: [{ input: 'largest([3, 9, 2])', output: '9' }, { input: 'largest([-5, -2, -9])', output: '-2' }],
    starter: 'function largest(numbers) {\n  let max = 0;\n  for (const n of numbers) {\n    if (n > max) max = n;\n  }\n  return max;\n}\n',
    solution: 'function largest(numbers) {\n  let max = numbers[0];\n  for (const n of numbers) {\n    if (n > max) max = n;\n  }\n  return max;\n}\n',
    explanation: 'Starting `max` at `0` assumes some number is bigger than 0. For an all-negative array nothing beats 0, so it wrongly returns 0. Start from the **first element** instead.',
    hints: ['Try it with only negative numbers.', 'What should `max` start as so it’s always a real element?'],
    fn: 'largest',
    tests: [
      { args: '[3, 9, 2]', expected: 9 },
      { args: '[-5, -2, -9]', expected: -2 },
      { args: '[7]', expected: 7, hidden: true },
      { args: '[-1]', expected: -1, hidden: true },
    ],
  },
  {
    id: 'js-balanced-brackets',
    title: 'Balanced brackets',
    difficulty: 'intermediate',
    category: 'algorithm',
    lang: 'javascript',
    minutes: 15,
    description: 'Write `isBalanced(text)` that returns `true` if every `(`, `[` and `{` in `text` is closed by the matching bracket in the right order. Other characters are ignored.',
    examples: [{ input: 'isBalanced("([]{})")', output: 'true' }, { input: 'isBalanced("([)]")', output: 'false' }, { input: 'isBalanced("fn(a[0])")', output: 'true' }],
    starter: 'function isBalanced(text) {\n  const stack = [];\n  \n}\n',
    solution: 'function isBalanced(text) {\n  const stack = [];\n  const pairs = { ")": "(", "]": "[", "}": "{" };\n  for (const ch of text) {\n    if ("([{".includes(ch)) stack.push(ch);\n    else if (ch in pairs) {\n      if (stack.pop() !== pairs[ch]) return false;\n    }\n  }\n  return stack.length === 0;\n}\n',
    explanation: 'A **stack** remembers open brackets in order. Each closing bracket must match the most recent open one (`pop`). At the end, nothing should be left open. This is how code editors and compilers check brackets.',
    hints: ['Push opening brackets onto `stack`.', 'For a closing bracket, `stack.pop()` must be its matching opener.', 'At the end the stack must be empty.'],
    fn: 'isBalanced',
    tests: [
      { args: '"([]{})"', expected: true },
      { args: '"([)]"', expected: false },
      { args: '"fn(a[0])"', expected: true },
      { args: '"(("', expected: false, hidden: true },
      { args: '")("', expected: false, hidden: true },
      { args: '""', expected: true, hidden: true },
    ],
  },
  {
    id: 'js-group-by',
    title: 'Group by a key',
    difficulty: 'intermediate',
    category: 'data',
    lang: 'javascript',
    minutes: 12,
    description: 'Write `groupBy(items, key)` that returns an object whose keys are the distinct values of `item[key]`, each mapping to an array of the matching items (in their original order).',
    examples: [{ input: 'groupBy([{t:"a",n:1},{t:"b",n:2},{t:"a",n:3}], "t")', output: '{ a: [{t:"a",n:1},{t:"a",n:3}], b: [{t:"b",n:2}] }' }],
    starter: 'function groupBy(items, key) {\n  \n}\n',
    solution: 'function groupBy(items, key) {\n  return items.reduce((groups, item) => {\n    const k = item[key];\n    (groups[k] ??= []).push(item);\n    return groups;\n  }, {});\n}\n',
    explanation: '`reduce` builds up an object. For each item, find (or create) the array for its key and push the item. `??=` assigns only when the value is missing.',
    hints: ['Start with an empty object `{}`.', 'If `groups[k]` doesn’t exist yet, set it to `[]` before pushing.'],
    fn: 'groupBy',
    tests: [
      { args: '[{ t: "a", n: 1 }, { t: "b", n: 2 }, { t: "a", n: 3 }], "t"', expected: { a: [{ t: 'a', n: 1 }, { t: 'a', n: 3 }], b: [{ t: 'b', n: 2 }] } },
      { args: '[], "x"', expected: {} },
      { args: '[{ c: "red" }, { c: "red" }], "c"', expected: { red: [{ c: 'red' }, { c: 'red' }] }, hidden: true },
    ],
  },
  {
    id: 'js-two-sum',
    title: 'Two sum',
    difficulty: 'intermediate',
    category: 'algorithm',
    lang: 'javascript',
    minutes: 15,
    description: 'Write `twoSum(numbers, target)` that returns the **indexes** `[i, j]` (with `i < j`) of the two numbers that add up to `target`. There is always exactly one answer.',
    examples: [{ input: 'twoSum([2, 7, 11, 15], 9)', output: '[0, 1]' }, { input: 'twoSum([3, 2, 4], 6)', output: '[1, 2]' }],
    starter: 'function twoSum(numbers, target) {\n  \n}\n',
    solution: 'function twoSum(numbers, target) {\n  const seen = new Map();\n  for (let j = 0; j < numbers.length; j++) {\n    const need = target - numbers[j];\n    if (seen.has(need)) return [seen.get(need), j];\n    seen.set(numbers[j], j);\n  }\n  return [];\n}\n',
    explanation: 'Checking every pair works but is slow for big inputs (n² steps). Remembering each number’s index in a `Map` lets you ask “have I already seen the number I need?” in one step — n steps total.',
    hints: ['A double loop over all pairs is a fine first solution.', 'Faster: for each number, the partner you need is `target - number`. Store numbers you’ve seen in a Map.'],
    fn: 'twoSum',
    tests: [
      { args: '[2, 7, 11, 15], 9', expected: [0, 1] },
      { args: '[3, 2, 4], 6', expected: [1, 2] },
      { args: '[3, 3], 6', expected: [0, 1], hidden: true },
      { args: '[1, 5, 9, 14], 23', expected: [2, 3], hidden: true },
    ],
  },
  {
    id: 'js-cart-total',
    title: 'Shopping cart total',
    difficulty: 'intermediate',
    category: 'real-world',
    lang: 'javascript',
    minutes: 15,
    description: `Write \`cartTotal(items, code)\` for a shop checkout.

- \`items\` is an array of \`{ price, qty }\`.
- Discount codes: \`"SAVE10"\` takes 10% off, \`"FIVEOFF"\` takes £5 off (never below 0). Any other code (or none) changes nothing.
- Orders under £50 (after discount) pay £4.99 delivery.
- Return the total **rounded to 2 decimal places** as a number.`,
    examples: [{ input: 'cartTotal([{ price: 20, qty: 3 }], "SAVE10")', output: '54' }, { input: 'cartTotal([{ price: 10, qty: 1 }])', output: '14.99' }],
    starter: 'function cartTotal(items, code) {\n  \n}\n',
    solution: 'function cartTotal(items, code) {\n  let total = items.reduce((sum, i) => sum + i.price * i.qty, 0);\n  if (code === "SAVE10") total *= 0.9;\n  if (code === "FIVEOFF") total = Math.max(0, total - 5);\n  if (total < 50) total += 4.99;\n  return Math.round(total * 100) / 100;\n}\n',
    explanation: 'Break the rules into steps in the same order as the spec: subtotal → discount → delivery → round. Rounding with `Math.round(x * 100) / 100` avoids floating-point leftovers like `14.990000000000002`.',
    hints: ['Subtotal: `items.reduce((sum, i) => sum + i.price * i.qty, 0)`.', 'Apply the discount before checking the delivery threshold.', 'Round at the very end.'],
    fn: 'cartTotal',
    tests: [
      { args: '[{ price: 20, qty: 3 }], "SAVE10"', expected: 54 },
      { args: '[{ price: 10, qty: 1 }]', expected: 14.99 },
      { args: '[{ price: 3, qty: 1 }], "FIVEOFF"', expected: 4.99, hidden: true },
      { args: '[{ price: 25, qty: 2 }], "BOGUS"', expected: 50, hidden: true },
      { args: '[{ price: 54, qty: 1 }], "FIVEOFF"', expected: 53.99, hidden: true },
    ],
  },
  {
    id: 'js-flatten',
    title: 'Flatten nested arrays',
    difficulty: 'advanced',
    category: 'algorithm',
    lang: 'javascript',
    minutes: 15,
    description: 'Write `flatten(list)` that returns a new array with every value from any depth of nesting, in order. Don’t use the built-in `.flat()` — practise **recursion**.',
    examples: [{ input: 'flatten([1, [2, [3, [4]], 5]])', output: '[1, 2, 3, 4, 5]' }],
    starter: 'function flatten(list) {\n  \n}\n',
    solution: 'function flatten(list) {\n  const out = [];\n  for (const item of list) {\n    if (Array.isArray(item)) out.push(...flatten(item));\n    else out.push(item);\n  }\n  return out;\n}\n',
    explanation: 'Recursion: a function that calls itself on a smaller piece. Each array item is either a plain value (keep it) or another array (flatten **that**, then add its values). Nesting depth doesn’t matter.',
    hints: ['`Array.isArray(x)` tells you if something is an array.', 'If it is, call `flatten(x)` and spread the result into your output.'],
    fn: 'flatten',
    tests: [
      { args: '[1, [2, [3, [4]], 5]]', expected: [1, 2, 3, 4, 5] },
      { args: '[]', expected: [] },
      { args: '[[["deep"]], "x"]', expected: ['deep', 'x'], hidden: true },
    ],
  },
  {
    id: 'js-roman',
    title: 'Roman numerals',
    difficulty: 'advanced',
    category: 'algorithm',
    lang: 'javascript',
    minutes: 20,
    description: 'Write `toRoman(n)` that converts a number from 1 to 3999 into Roman numerals. Remember the subtractive forms: 4 = IV, 9 = IX, 40 = XL, 90 = XC, 400 = CD, 900 = CM.',
    examples: [{ input: 'toRoman(9)', output: '"IX"' }, { input: 'toRoman(1994)', output: '"MCMXCIV"' }],
    starter: 'function toRoman(n) {\n  \n}\n',
    solution: 'function toRoman(n) {\n  const table = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];\n  let out = "";\n  for (const [value, symbol] of table) {\n    while (n >= value) {\n      out += symbol;\n      n -= value;\n    }\n  }\n  return out;\n}\n',
    explanation: 'A **greedy** algorithm: repeatedly take the largest value that still fits. Listing the subtractive pairs (900, 400, 90…) in the table means they’re handled automatically.',
    hints: ['Make a table of values and symbols from largest to smallest, including 900, 400, 90, 40, 9 and 4.', 'While `n` is at least the current value, add the symbol and subtract.'],
    fn: 'toRoman',
    tests: [
      { args: '9', expected: 'IX' },
      { args: '1994', expected: 'MCMXCIV' },
      { args: '3', expected: 'III' },
      { args: '58', expected: 'LVIII', hidden: true },
      { args: '3999', expected: 'MMMCMXCIX', hidden: true },
    ],
  },

  // ------------------------------------------------------------------ Python
  {
    id: 'py-even-squares',
    title: 'Squares of even numbers',
    difficulty: 'beginner',
    category: 'logic',
    lang: 'python',
    minutes: 6,
    description: 'Write `even_squares(numbers)` that returns a list of the squares of only the **even** numbers, in order.',
    examples: [{ input: 'even_squares([1, 2, 3, 4])', output: '[4, 16]' }],
    starter: 'def even_squares(numbers):\n    pass\n',
    solution: 'def even_squares(numbers):\n    return [n * n for n in numbers if n % 2 == 0]\n',
    explanation: 'A **list comprehension** — `[expression for item in list if condition]` — filters and transforms in one readable line.',
    hints: ['`n % 2 == 0` is true for even numbers.', 'Try `[n * n for n in numbers if ...]`.'],
    fn: 'even_squares',
    tests: [
      { args: '[1, 2, 3, 4]', expected: [4, 16] },
      { args: '[]', expected: [] },
      { args: '[-2, 5, 6]', expected: [4, 36], hidden: true },
    ],
  },
  {
    id: 'py-fix-countdown',
    title: 'Fix the countdown',
    difficulty: 'beginner',
    category: 'debugging',
    lang: 'python',
    minutes: 6,
    description: '`countdown(n)` should return a list counting down from `n` to `1`, e.g. `countdown(3)` → `[3, 2, 1]`. It’s off by one. Fix it.',
    examples: [{ input: 'countdown(3)', output: '[3, 2, 1]' }],
    starter: 'def countdown(n):\n    result = []\n    for i in range(n, 1, -1):\n        result.append(i)\n    return result\n',
    solution: 'def countdown(n):\n    result = []\n    for i in range(n, 0, -1):\n        result.append(i)\n    return result\n',
    explanation: '`range(start, stop, step)` stops **before** `stop`. To include 1 when counting down, the stop must be 0.',
    hints: ['What does `range(3, 1, -1)` produce?', 'The stop value is never included.'],
    fn: 'countdown',
    tests: [
      { args: '3', expected: [3, 2, 1] },
      { args: '1', expected: [1] },
      { args: '5', expected: [5, 4, 3, 2, 1], hidden: true },
    ],
  },
  {
    id: 'py-word-count',
    title: 'Word frequency',
    difficulty: 'intermediate',
    category: 'data',
    lang: 'python',
    minutes: 12,
    description: 'Write `word_count(text)` that returns a dictionary mapping each word (lower-cased) to how many times it appears. Words are separated by spaces; strip the punctuation `.,!?` from each word.',
    examples: [{ input: 'word_count("The cat. The hat!")', output: '{"the": 2, "cat": 1, "hat": 1}' }],
    starter: 'def word_count(text):\n    counts = {}\n    \n    return counts\n',
    solution: 'def word_count(text):\n    counts = {}\n    for word in text.lower().split():\n        word = word.strip(".,!?")\n        if word:\n            counts[word] = counts.get(word, 0) + 1\n    return counts\n',
    explanation: '`split()` breaks text into words, `strip(".,!?")` trims punctuation from both ends, and `counts.get(word, 0) + 1` increments a count that may not exist yet.',
    hints: ['`text.lower().split()` gives a list of words.', '`dict.get(key, 0)` returns 0 if the key is missing.'],
    fn: 'word_count',
    tests: [
      { args: '"The cat. The hat!"', expected: { the: 2, cat: 1, hat: 1 } },
      { args: '""', expected: {} },
      { args: '"Go, go, GO!"', expected: { go: 3 }, hidden: true },
    ],
  },
  {
    id: 'py-fibonacci',
    title: 'Fibonacci numbers',
    difficulty: 'intermediate',
    category: 'algorithm',
    lang: 'python',
    minutes: 10,
    description: 'Write `fib(n)` that returns the first `n` Fibonacci numbers as a list. The sequence starts `0, 1`, and each next number is the sum of the previous two.',
    examples: [{ input: 'fib(7)', output: '[0, 1, 1, 2, 3, 5, 8]' }, { input: 'fib(1)', output: '[0]' }],
    starter: 'def fib(n):\n    pass\n',
    solution: 'def fib(n):\n    result = []\n    a, b = 0, 1\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n',
    explanation: 'Keep just the last two numbers in `a` and `b`. Python’s tuple assignment `a, b = b, a + b` updates both at once, without a temporary variable.',
    hints: ['Start with `a, b = 0, 1`.', 'Each step: append `a`, then `a, b = b, a + b`.'],
    fn: 'fib',
    tests: [
      { args: '7', expected: [0, 1, 1, 2, 3, 5, 8] },
      { args: '1', expected: [0] },
      { args: '0', expected: [], hidden: true },
      { args: '10', expected: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34], hidden: true },
    ],
  },

  // ------------------------------------------------------------------ SQL
  {
    id: 'sql-london',
    title: 'Customers in London',
    difficulty: 'beginner',
    category: 'data',
    lang: 'sql',
    minutes: 5,
    description: 'Return the `name` of every customer whose `city` is London.',
    examples: [{ input: 'customers table', output: 'name\nAda Lovelace\nTim Berners-Lee' }],
    starter: 'SELECT \nFROM customers\n',
    solution: "SELECT name FROM customers WHERE city = 'London';",
    expectedSql: "SELECT name FROM customers WHERE city = 'London';",
    explanation: '`WHERE` filters rows. Text values go in **single** quotes in SQL.',
    hints: ['You need `SELECT name`, `FROM customers` and a `WHERE` clause.', "Text needs single quotes: `'London'`."],
  },
  {
    id: 'sql-cheap-products',
    title: 'Cheapest first',
    difficulty: 'beginner',
    category: 'data',
    lang: 'sql',
    minutes: 6,
    description: 'List the `name` and `price` of products that cost **less than 40**, cheapest first.',
    examples: [{ input: 'products table', output: 'name | price\nRubber Duck | 4.5\n…' }],
    starter: 'SELECT name, price\nFROM products\n',
    solution: 'SELECT name, price FROM products WHERE price < 40 ORDER BY price;',
    expectedSql: 'SELECT name, price FROM products WHERE price < 40 ORDER BY price;',
    ordered: true,
    explanation: '`WHERE price < 40` filters; `ORDER BY price` sorts ascending (smallest first). Add `DESC` for the reverse.',
    hints: ['Filter with `WHERE price < 40`.', 'Sort with `ORDER BY price`.'],
  },
  {
    id: 'sql-revenue',
    title: 'Revenue per customer',
    difficulty: 'intermediate',
    category: 'real-world',
    lang: 'sql',
    minutes: 12,
    description: 'For each customer, return their `name` and total spend as `revenue` (sum of `price × quantity` across their orders). Sort by revenue, highest first.',
    examples: [{ input: 'customers, orders, products', output: 'name | revenue\nGrace Hopper | 203.5\n…' }],
    starter: 'SELECT c.name, \nFROM orders o\nJOIN customers c ON c.id = o.customer_id\n',
    solution: 'SELECT c.name, SUM(p.price * o.quantity) AS revenue\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nJOIN products p ON p.id = o.product_id\nGROUP BY c.id, c.name\nORDER BY revenue DESC;',
    expectedSql: 'SELECT c.name, SUM(p.price * o.quantity) AS revenue FROM orders o JOIN customers c ON c.id = o.customer_id JOIN products p ON p.id = o.product_id GROUP BY c.id, c.name ORDER BY revenue DESC;',
    ordered: true,
    explanation: '`JOIN` connects each order to its customer and product. `GROUP BY` makes one row per customer, and `SUM(...)` adds up their order values.',
    hints: ['You need prices, so also `JOIN products p ON p.id = o.product_id`.', '`SUM(p.price * o.quantity)` with `GROUP BY c.id, c.name`.', 'Sort with `ORDER BY revenue DESC`.'],
  },
  {
    id: 'sql-top-category',
    title: 'Units sold by category',
    difficulty: 'advanced',
    category: 'data',
    lang: 'sql',
    minutes: 15,
    description: 'Return each product `category` with the total `units` sold (sum of quantity), but only categories that sold **more than 3** units. Sort by units, highest first.',
    examples: [{ input: 'orders, products', output: 'category | units\n…' }],
    starter: 'SELECT p.category, \nFROM orders o\nJOIN products p ON p.id = o.product_id\n',
    solution: 'SELECT p.category, SUM(o.quantity) AS units\nFROM orders o\nJOIN products p ON p.id = o.product_id\nGROUP BY p.category\nHAVING SUM(o.quantity) > 3\nORDER BY units DESC;',
    expectedSql: 'SELECT p.category, SUM(o.quantity) AS units FROM orders o JOIN products p ON p.id = o.product_id GROUP BY p.category HAVING SUM(o.quantity) > 3 ORDER BY units DESC;',
    ordered: true,
    explanation: '`WHERE` filters rows **before** grouping; `HAVING` filters groups **after** aggregation — so a condition on `SUM(...)` must go in `HAVING`.',
    hints: ['Group by `p.category` and `SUM(o.quantity)`.', 'Conditions on a SUM go in `HAVING`, not `WHERE`.'],
  },
];
