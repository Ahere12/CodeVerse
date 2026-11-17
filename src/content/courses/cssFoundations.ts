import type { Course } from '../types';

const nonEmpty = (v: string) => v.trim().length > 0;
const px = (v: string) => parseFloat(v) || 0;

const CARD_HTML = `<div class="card">
  <h2>Mountain Cabin</h2>
  <p>Two bedrooms, wood stove, lake view.</p>
  <a class="button" href="#">Book now</a>
</div>`;

const NAV_HTML = `<nav class="menu">
  <a href="#">Home</a>
  <a href="#">Shop</a>
  <a href="#">About</a>
  <a href="#">Contact</a>
</nav>`;

export const cssFoundations: Course = {
  id: 'css-foundations',
  languageId: 'css',
  level: 'beginner',
  title: 'CSS Foundations',
  description: 'Make pages look good: selectors, colours, classes, the box model and Flexbox layout.',
  outcomes: ['Write CSS rules with selectors, properties and values', 'Target elements with classes', 'Control spacing with the box model', 'Lay out items in rows and columns with Flexbox'],
  prerequisites: ['html-foundations'],
  lessons: [
    {
      id: 'css-rules',
      title: 'Rules, selectors and properties',
      minutes: 8,
      goal: 'Write CSS rules that change the colour and font of HTML elements.',
      blocks: [
        {
          type: 'text',
          md: `CSS (Cascading Style Sheets) describes how HTML should look. A CSS **rule** has:

- a **selector** — which elements to style
- curly braces \`{ }\` holding **declarations**
- each declaration is a **property**, a colon, a **value** and a semicolon`,
        },
        {
          type: 'code',
          lang: 'css',
          caption: 'selector { property: value; }',
          html: `<h1>Hello, CSS</h1>\n<p>Styles change how things look, not what they are.</p>`,
          code: `h1 {
  color: crimson;
  font-family: Georgia, serif;
}

p {
  color: dimgray;
  font-size: 18px;
}`,
          preview: true,
        },
        {
          type: 'text',
          md: `Colours can be written as names (\`crimson\`), hex codes (\`#dc143c\`) or \`rgb(220, 20, 60)\`. Sizes are often in \`px\` (pixels) or \`rem\` (relative to the base font size — better for accessibility because it respects the user's settings).`,
        },
        {
          type: 'exercise',
          id: 'css-ex-colors',
          lang: 'css',
          title: 'Style a heading',
          html: `<h1>Space Facts</h1>\n<p>A day on Venus is longer than its year.</p>`,
          prompt: `Give the \`h1\` a \`color\` of your choice and a \`font-size\` of \`40px\`. Then give the \`p\` a \`line-height\` of \`1.6\`.`,
          starter: `h1 {\n  \n}\n`,
          solution: `h1 {\n  color: rebeccapurple;\n  font-size: 40px;\n}\n\np {\n  line-height: 1.6;\n}`,
          checks: [
            { kind: 'css', desc: '`h1` has a `color`', test: (c) => nonEmpty(c.get('h1', 'color')) },
            { kind: 'css', desc: '`h1` has `font-size: 40px`', test: (c) => c.get('h1', 'font-size') === '40px' },
            { kind: 'css', desc: '`p` has `line-height: 1.6`', test: (c) => c.get('p', 'line-height') === '1.6' },
          ],
          hints: ['Inside the `h1 { }` braces write `color: tomato;` (or any colour).', 'Each declaration ends with a semicolon.', 'Add a second rule: `p { line-height: 1.6; }`.'],
        },
        {
          type: 'quiz',
          id: 'css-q-anatomy',
          question: 'In `p { color: navy; }`, what is `color`?',
          options: ['The selector', 'The property', 'The value', 'The element'],
          answer: 1,
          explain: '`p` is the selector, `color` the property, `navy` the value.',
        },
      ],
      summary: ['A rule = selector + `{ property: value; }` declarations.', 'Colours: names, hex `#rrggbb` or `rgb()`.', 'Prefer `rem` for text sizes so users’ settings are respected.'],
    },
    {
      id: 'css-classes',
      title: 'Classes and the cascade',
      minutes: 9,
      goal: 'Style specific elements with classes and understand which rule wins.',
      blocks: [
        {
          type: 'text',
          md: `Styling every \`p\` the same is limiting. A **class** lets you label specific elements in HTML and target them in CSS with a dot:

- HTML: \`<p class="note">\`
- CSS: \`.note { ... }\`

An element can have several classes separated by spaces: \`class="note urgent"\`.`,
        },
        {
          type: 'code',
          lang: 'css',
          html: `<p>A normal paragraph.</p>\n<p class="note">A highlighted note.</p>\n<p class="note urgent">An urgent note!</p>`,
          code: `.note {
  background: lightyellow;
  padding: 8px;
}

.urgent {
  color: firebrick;
  font-weight: bold;
}`,
          preview: true,
        },
        { type: 'heading', text: 'When rules disagree' },
        {
          type: 'text',
          md: `The "cascading" in CSS describes how the browser decides between conflicting rules:

1. **More specific selectors win.** A class (\`.note\`) beats an element selector (\`p\`). An \`id\` (\`#intro\`) beats a class.
2. **If equally specific, the later rule wins.**

When a style "doesn't work", it's usually being overridden by a more specific rule. The browser's developer tools (F12) show which rule won.`,
        },
        {
          type: 'quiz',
          id: 'css-q-specificity',
          question: 'Both rules target the same paragraph. What colour is it?',
          code: { lang: 'css', code: `.intro { color: green; }\np { color: blue; }` },
          options: ['Blue — it comes last', 'Green — a class is more specific', 'Both, mixed', 'Black — they cancel out'],
          answer: 1,
          explain: 'Specificity is checked before order. `.intro` (a class) beats `p` (an element), even though `p` comes later.',
        },
        {
          type: 'exercise',
          id: 'css-ex-classes',
          lang: 'css',
          title: 'Price tags',
          html: `<p class="price">£24.00</p>\n<p class="price sale">£18.00</p>\n<p>Free delivery over £50</p>`,
          prompt: `Style \`.price\` with \`font-weight: bold\`. Then style \`.sale\` with a \`color\` and a \`background\` so sale prices stand out.`,
          starter: `.price {\n  \n}\n`,
          solution: `.price {\n  font-weight: bold;\n}\n\n.sale {\n  color: white;\n  background: crimson;\n}`,
          checks: [
            { kind: 'css', desc: '`.price` is bold', test: (c) => ['bold', '700'].includes(c.get('.price', 'font-weight')) },
            { kind: 'css', desc: '`.sale` sets a `color`', test: (c) => nonEmpty(c.get('.sale', 'color')) },
            { kind: 'css', desc: '`.sale` sets a background', test: (c) => nonEmpty(c.get('.sale', 'background')) || nonEmpty(c.get('.sale', 'background-color')) },
          ],
          hints: ['Class selectors start with a dot: `.sale { }`.', 'Use `background: gold;` or `background-color: gold;`.'],
        },
      ],
      summary: ['Classes target specific elements: `class="x"` in HTML, `.x` in CSS.', 'More specific selectors win; ties go to the later rule.', 'Use classes for most styling — they’re reusable and predictable.'],
    },
    {
      id: 'css-box-model',
      title: 'The box model',
      minutes: 10,
      goal: 'Control spacing using padding, border and margin.',
      blocks: [
        {
          type: 'text',
          md: `Every element is a rectangular **box** made of four layers, from the inside out:

1. **Content** — the text or image
2. **Padding** — space inside the border
3. **Border** — a line around the padding
4. **Margin** — space outside, pushing other boxes away`,
        },
        {
          type: 'code',
          lang: 'css',
          html: `<div class="box">Content</div>\n<div class="box">Another box</div>`,
          code: `.box {
  padding: 16px;          /* inside space */
  border: 3px solid teal; /* the line */
  margin: 12px;           /* outside space */
  background: azure;
}`,
          preview: true,
        },
        {
          type: 'text',
          md: `Shorthand values go **clockwise from the top**: \`padding: 10px 20px 10px 20px\` is top, right, bottom, left. Two values mean vertical then horizontal: \`padding: 10px 20px\`.

By default, \`width\` sets only the content width, so padding and border make the box bigger than you asked. Most developers add this rule to every project so widths include padding and border:`,
        },
        { type: 'code', lang: 'css', code: `* {\n  box-sizing: border-box;\n}` },
        {
          type: 'playground',
          lang: 'css',
          title: 'Experiment with spacing',
          html: CARD_HTML,
          starter: `.card {\n  padding: 20px;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  margin: 10px;\n  max-width: 280px;\n}`,
        },
        {
          type: 'exercise',
          id: 'css-ex-box',
          lang: 'css',
          title: 'Build a card',
          html: CARD_HTML,
          prompt: `Style \`.card\`: give it \`padding\` of at least \`16px\`, a \`border\`, and a \`border-radius\`. Then style \`.button\` with some \`padding\` and a \`background\`.`,
          starter: `.card {\n  \n}\n\n.button {\n  \n}\n`,
          solution: `.card {\n  padding: 20px;\n  border: 1px solid #ccc;\n  border-radius: 10px;\n  max-width: 300px;\n}\n\n.button {\n  display: inline-block;\n  padding: 8px 14px;\n  background: teal;\n  color: white;\n  text-decoration: none;\n  border-radius: 6px;\n}`,
          checks: [
            { kind: 'css', desc: '`.card` has padding of at least 16px', test: (c) => px(c.get('.card', 'padding-top') || c.get('.card', 'padding')) >= 16 },
            { kind: 'css', desc: '`.card` has a border', test: (c) => nonEmpty(c.get('.card', 'border')) || nonEmpty(c.get('.card', 'border-top-style')) || nonEmpty(c.get('.card', 'border-style')) },
            { kind: 'css', desc: '`.card` has rounded corners', test: (c) => px(c.get('.card', 'border-radius') || c.get('.card', 'border-top-left-radius')) > 0 },
            { kind: 'css', desc: '`.button` has padding and a background', test: (c) => nonEmpty(c.get('.button', 'padding') || c.get('.button', 'padding-top')) && (nonEmpty(c.get('.button', 'background')) || nonEmpty(c.get('.button', 'background-color'))) },
          ],
          hints: ['A border needs width, style and colour: `border: 1px solid gray;`.', '`border-radius: 8px;` rounds the corners.', 'For the button try `padding: 8px 12px; background: teal;`.'],
        },
        {
          type: 'quiz',
          id: 'css-q-margin',
          question: 'You want more space **between** two cards. Which property?',
          options: ['padding', 'margin', 'border', 'width'],
          answer: 1,
          explain: 'Margin is outside space — it pushes neighbours away. Padding is inside the border.',
        },
      ],
      summary: ['Box = content → padding → border → margin.', 'Shorthand goes clockwise: top, right, bottom, left.', '`box-sizing: border-box` makes widths predictable.'],
    },
    {
      id: 'css-flexbox',
      title: 'Layout with Flexbox',
      minutes: 11,
      goal: 'Arrange items in a row, space them out and align them with Flexbox.',
      blocks: [
        {
          type: 'text',
          md: `By default, block elements stack vertically. **Flexbox** lets a parent arrange its children in a row (or column) and control spacing and alignment.

Turn it on with \`display: flex\` on the **parent**. Then:

- \`gap\` — space between items
- \`justify-content\` — spacing along the row (\`flex-start\`, \`center\`, \`space-between\`…)
- \`align-items\` — alignment across the row (\`center\`, \`stretch\`…)
- \`flex-direction: column\` — switch to a column`,
        },
        {
          type: 'code',
          lang: 'css',
          html: `<div class="row">\n  <div class="item">A</div>\n  <div class="item">B</div>\n  <div class="item">C</div>\n</div>`,
          code: `.row {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.item {
  padding: 16px 24px;
  background: lavender;
  border-radius: 6px;
}`,
          preview: true,
        },
        {
          type: 'playground',
          lang: 'css',
          title: 'Try changing justify-content',
          html: `<div class="row">\n  <div class="item">A</div>\n  <div class="item">B</div>\n  <div class="item">C</div>\n</div>`,
          starter: `.row {\n  display: flex;\n  gap: 8px;\n  justify-content: space-between; /* try: center, flex-end, space-around */\n  align-items: center;\n  height: 120px;\n  background: #f4f4f8;\n}\n\n.item { padding: 12px 20px; background: lavender; }\n.item:nth-child(2) { padding: 30px 20px; }`,
        },
        {
          type: 'exercise',
          id: 'css-ex-flex',
          lang: 'css',
          title: 'A navigation bar',
          html: NAV_HTML,
          prompt: `Turn \`.menu\` into a horizontal navigation bar: use Flexbox, add a \`gap\` between links, and center the links with \`justify-content\`. Give \`.menu a\` some \`padding\`.`,
          starter: `.menu {\n  \n}\n\n.menu a {\n  \n}\n`,
          solution: `.menu {\n  display: flex;\n  gap: 16px;\n  justify-content: center;\n  background: #222;\n  padding: 12px;\n}\n\n.menu a {\n  color: white;\n  text-decoration: none;\n  padding: 6px 10px;\n}`,
          checks: [
            { kind: 'css', desc: '`.menu` uses `display: flex`', test: (c) => c.get('.menu', 'display') === 'flex' },
            { kind: 'css', desc: '`.menu` has a `gap`', test: (c) => nonEmpty(c.get('.menu', 'gap') || c.get('.menu', 'column-gap')) },
            { kind: 'css', desc: 'Links are centered with `justify-content: center`', test: (c) => c.get('.menu', 'justify-content') === 'center' },
            { kind: 'css', desc: '`.menu a` has padding', test: (c) => nonEmpty(c.get('.menu a', 'padding') || c.get('.menu a', 'padding-top')) },
          ],
          hints: ['`display: flex;` goes on the parent `.menu`, not on the links.', 'Add `gap: 16px;` and `justify-content: center;` to `.menu`.', '`.menu a` selects links inside `.menu` — give it `padding: 6px 10px;`.'],
        },
        {
          type: 'quiz',
          id: 'css-q-flex',
          question: 'Where do you put `display: flex`?',
          options: ['On each child item', 'On the parent container', 'On the `<body>` only', 'In the HTML tag'],
          answer: 1,
          explain: 'Flexbox is set on the container; its direct children become flex items.',
        },
        {
          type: 'callout',
          tone: 'real-world',
          md: `Navigation bars, card rows, toolbars and centering things are everyday Flexbox jobs. For full two-dimensional page layouts, CSS Grid is the next tool to learn.`,
        },
      ],
      summary: ['`display: flex` on a parent lays out its children in a row.', '`gap`, `justify-content` and `align-items` control spacing and alignment.', '`flex-direction: column` stacks items vertically.'],
    },
  ],
};
