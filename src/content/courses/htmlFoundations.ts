import type { Course } from '../types';

const text = (el: Element | null | undefined) => (el?.textContent ?? '').trim();

export const htmlFoundations: Course = {
  id: 'html-foundations',
  languageId: 'html',
  level: 'beginner',
  title: 'HTML Foundations',
  description: 'Build real web pages from scratch: headings, text, lists, links, images, page structure and forms.',
  outcomes: ['Write valid HTML using tags and attributes', 'Structure content with headings, paragraphs and lists', 'Add links and accessible images', 'Lay out a page with semantic elements', 'Build a simple, accessible form'],
  prerequisites: ['start-here'],
  lessons: [
    {
      id: 'html-tags',
      title: 'Tags and elements',
      minutes: 8,
      goal: 'Write HTML elements using opening and closing tags.',
      blocks: [
        {
          type: 'text',
          md: `HTML (HyperText Markup Language) labels pieces of content so the browser knows what they are. You label content by wrapping it in **tags**:

- an **opening tag** like \`<p>\`
- the content
- a **closing tag** with a slash, like \`</p>\`

Together, the tags and content form an **element**.`,
        },
        {
          type: 'code',
          lang: 'html',
          caption: 'Anatomy of an element',
          code: `<p>This is a paragraph.</p>`,
          preview: true,
        },
        {
          type: 'text',
          md: `Headings use \`<h1>\` to \`<h6>\`. \`<h1>\` is the main title of the page — use it once. \`<h2>\` marks sections, \`<h3>\` sub-sections, and so on. Pick headings by **meaning**, not by size; CSS controls size later.`,
        },
        {
          type: 'code',
          lang: 'html',
          code: `<h1>Recipes</h1>
<h2>Pancakes</h2>
<p>Fluffy, quick and easy.</p>
<h2>Omelette</h2>
<p>Ready in five minutes.</p>`,
          preview: true,
        },
        {
          type: 'exercise',
          id: 'html-ex-heading',
          lang: 'html',
          title: 'Your first page',
          prompt: `Create a page with an \`<h1>\` containing your name, followed by a \`<p>\` paragraph that says something about you.`,
          starter: `<!-- Write your HTML below -->\n`,
          solution: `<h1>Alex Rivera</h1>\n<p>I am learning to build websites.</p>`,
          checks: [
            { kind: 'html', desc: 'Has an `<h1>` with some text', test: (d) => text(d.querySelector('h1')).length > 0 },
            { kind: 'html', desc: 'Has a `<p>` with some text', test: (d) => text(d.querySelector('p')).length > 0 },
            { kind: 'html', desc: 'The `<h1>` comes before the paragraph', test: (d) => { const h = d.querySelector('h1'); const p = d.querySelector('p'); return !!h && !!p && !!(h.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING); } },
          ],
          hints: ['An `<h1>` element looks like `<h1>Your Name</h1>`.', 'Put the `<p>...</p>` on the next line, after the `</h1>`.'],
        },
        {
          type: 'callout',
          tone: 'warning',
          md: `Forgetting a closing tag is the most common HTML mistake. Browsers try to guess what you meant, so the page might *look* fine while being broken underneath. The checker will warn you about unclosed tags.`,
        },
        {
          type: 'quiz',
          id: 'html-q-closing',
          question: 'Which is a correct closing tag for a paragraph?',
          options: ['`<p/>`', '`</p>`', '`<\\p>`', '`<end p>`'],
          answer: 1,
          explain: 'Closing tags start with `</` followed by the tag name: `</p>`.',
        },
      ],
      summary: ['Elements = opening tag + content + closing tag.', '`<h1>`–`<h6>` are headings by importance; `<p>` is a paragraph.', 'Choose tags for meaning, not appearance.'],
    },
    {
      id: 'html-lists-text',
      title: 'Lists and text formatting',
      minutes: 8,
      goal: 'Create bulleted and numbered lists and emphasise text.',
      blocks: [
        {
          type: 'text',
          md: `Lists are everywhere: menus, steps, ingredients. HTML has two main kinds:

- \`<ul>\` — an **unordered** list (bullets), when order doesn't matter.
- \`<ol>\` — an **ordered** list (numbers), when it does.

Each item inside either list goes in an \`<li>\` (list item).`,
        },
        {
          type: 'code',
          lang: 'html',
          code: `<h2>Shopping</h2>
<ul>
  <li>Milk</li>
  <li>Bread</li>
</ul>

<h2>Make tea</h2>
<ol>
  <li>Boil water</li>
  <li>Add tea bag</li>
  <li>Wait 3 minutes</li>
</ol>`,
          preview: true,
        },
        {
          type: 'text',
          md: `Notice the **indentation**: the \`<li>\` elements are pushed in because they live *inside* the list. Browsers ignore the spaces, but indentation makes code much easier for humans to read. Elements inside other elements are called **nested** elements.

For emphasis inside text, use \`<strong>\` for important text (bold by default) and \`<em>\` for stressed text (italic by default).`,
        },
        {
          type: 'code',
          lang: 'html',
          code: `<p>Please <strong>do not</strong> touch the oven. It is <em>very</em> hot.</p>`,
          preview: true,
        },
        {
          type: 'exercise',
          id: 'html-ex-list',
          lang: 'html',
          title: 'Top three',
          prompt: `Make an \`<h2>\` that says "My top 3 films", then an **ordered** list with exactly three films. Make the word "favourite" bold somewhere in a paragraph.`,
          starter: `<h2>My top 3 films</h2>\n\n<p>These are my favourite films.</p>\n`,
          solution: `<h2>My top 3 films</h2>\n<ol>\n  <li>Spirited Away</li>\n  <li>The Matrix</li>\n  <li>Paddington 2</li>\n</ol>\n<p>These are my <strong>favourite</strong> films.</p>`,
          checks: [
            { kind: 'html', desc: 'Has an ordered list `<ol>`', test: (d) => !!d.querySelector('ol') },
            { kind: 'html', desc: 'The list has exactly 3 `<li>` items', test: (d) => d.querySelectorAll('ol > li').length === 3 },
            { kind: 'html', desc: 'Every list item has text', test: (d) => [...d.querySelectorAll('ol > li')].every((li) => text(li).length > 0) },
            { kind: 'html', desc: '"favourite" is inside `<strong>`', test: (d) => [...d.querySelectorAll('strong')].some((s) => /favou?rite/i.test(text(s))) },
          ],
          hints: ['Start with `<ol>` and finish with `</ol>`.', 'Each film goes in its own `<li>...</li>` inside the `<ol>`.', 'Wrap the word like this: `<strong>favourite</strong>`.'],
        },
        {
          type: 'quiz',
          id: 'html-q-list',
          question: 'You’re writing step-by-step instructions to assemble a desk. Which list should you use?',
          options: ['`<ul>`', '`<ol>`', '`<li>`', '`<steps>`'],
          answer: 1,
          explain: 'Order matters for steps, so an ordered list `<ol>` is right. `<li>` is the item, not the list.',
        },
      ],
      summary: ['`<ul>` for bullets, `<ol>` for numbered steps, `<li>` for each item.', 'Nest elements inside each other and indent to show it.', '`<strong>` = important, `<em>` = emphasis.'],
    },
    {
      id: 'html-links-images',
      title: 'Links and images',
      minutes: 9,
      goal: 'Add links and images using attributes, including accessible alt text.',
      blocks: [
        {
          type: 'text',
          md: `Some elements need extra information. That information goes in **attributes**, written inside the opening tag as \`name="value"\`.

A link uses the \`<a>\` (anchor) element. Its \`href\` attribute says where the link goes.`,
        },
        {
          type: 'code',
          lang: 'html',
          code: `<p>Learn more on <a href="https://developer.mozilla.org">MDN Web Docs</a>.</p>`,
          preview: true,
        },
        {
          type: 'text',
          md: `Images use \`<img>\`. It's a **void element** — it has no content and no closing tag. It needs two attributes:

- \`src\` — where the image file is.
- \`alt\` — a text description. Screen readers read it aloud to blind and low-vision users, and it shows if the image fails to load.`,
        },
        {
          type: 'code',
          lang: 'html',
          code: `<img src="https://picsum.photos/id/237/240/160" alt="A black puppy looking up at the camera">`,
          preview: true,
        },
        {
          type: 'callout',
          tone: 'real-world',
          title: 'Accessibility is not optional',
          md: `About 1 in 6 people live with a disability. Good \`alt\` text, clear link text ("Read the pricing guide", not "click here") and proper headings make your site usable by everyone — and they help search engines too.`,
        },
        {
          type: 'exercise',
          id: 'html-ex-links',
          lang: 'html',
          title: 'A link and a picture',
          prompt: `Add a link to \`https://wikipedia.org\` with the text "Wikipedia", and an image with \`src="https://picsum.photos/200"\` and a meaningful \`alt\` description.`,
          starter: `<h1>Useful things</h1>\n`,
          solution: `<h1>Useful things</h1>\n<p>Look things up on <a href="https://wikipedia.org">Wikipedia</a>.</p>\n<img src="https://picsum.photos/200" alt="A random landscape photo">`,
          checks: [
            { kind: 'html', desc: 'Has a link to `https://wikipedia.org`', test: (d) => [...d.querySelectorAll('a')].some((a) => /^https:\/\/(www\.)?wikipedia\.org\/?$/.test(a.getAttribute('href') ?? '')) },
            { kind: 'html', desc: 'The link text says "Wikipedia"', test: (d) => [...d.querySelectorAll('a')].some((a) => /wikipedia/i.test(text(a))) },
            { kind: 'html', desc: 'Has an `<img>` with the right `src`', test: (d) => [...d.querySelectorAll('img')].some((i) => i.getAttribute('src') === 'https://picsum.photos/200') },
            { kind: 'html', desc: 'The image has descriptive `alt` text (at least 5 characters)', test: (d) => [...d.querySelectorAll('img')].some((i) => (i.getAttribute('alt') ?? '').trim().length >= 5) },
          ],
          hints: ['A link: `<a href="https://wikipedia.org">Wikipedia</a>`.', 'An image: `<img src="..." alt="...">` — no closing tag needed.', 'Describe what the picture shows in the alt text.'],
        },
        {
          type: 'quiz',
          id: 'html-q-alt',
          question: 'Why does `alt` text matter?',
          options: ['It makes the image load faster', 'It describes the image for people who can’t see it', 'It sets the image size', 'It is required to make the image clickable'],
          answer: 1,
          explain: 'Screen readers read `alt` text aloud, and it appears if the image fails to load.',
        },
      ],
      summary: ['Attributes add information: `name="value"` inside the opening tag.', '`<a href="...">` creates links; use descriptive link text.', '`<img src="..." alt="...">` — always write meaningful alt text.'],
    },
    {
      id: 'html-structure',
      title: 'Page structure',
      minutes: 9,
      goal: 'Organise a page with semantic elements like header, nav, main and footer.',
      blocks: [
        {
          type: 'text',
          md: `Real pages have regions: a header with the logo, navigation, the main content, and a footer. HTML has **semantic elements** — tags whose names describe their purpose:

- \`<header>\` — introductory content, often the logo and navigation
- \`<nav>\` — a group of navigation links
- \`<main>\` — the main content (one per page)
- \`<section>\` — a themed group of content, usually with a heading
- \`<footer>\` — closing information like copyright and contacts`,
        },
        {
          type: 'code',
          lang: 'html',
          code: `<header>
  <strong>Bean There</strong>
  <nav>
    <a href="#menu">Menu</a> ·
    <a href="#visit">Visit</a>
  </nav>
</header>
<main>
  <section id="menu">
    <h2>Menu</h2>
    <p>Espresso, flat white, chai.</p>
  </section>
</main>
<footer>
  <p>© 2026 Bean There Café</p>
</footer>`,
          preview: true,
        },
        {
          type: 'text',
          md: `Visually, these look like plain boxes. Their value is **meaning**: screen-reader users can jump straight to \`<main>\` or \`<nav>\`, and search engines understand your page better.

Every full HTML document also has a skeleton: \`<!DOCTYPE html>\`, \`<html>\`, a \`<head>\` (page title and settings, not shown on the page) and a \`<body>\` (everything visible). The editors on CodeVerse add the skeleton for you so you can focus on the body.`,
        },
        {
          type: 'code',
          lang: 'html',
          caption: 'A complete HTML document',
          code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Bean There Café</title>
  </head>
  <body>
    <h1>Welcome!</h1>
  </body>
</html>`,
        },
        {
          type: 'exercise',
          id: 'html-ex-structure',
          lang: 'html',
          title: 'Structure a page',
          prompt: `Build a page with a \`<header>\` (containing an \`<h1>\`), a \`<main>\` with at least one \`<section>\` that has an \`<h2>\`, and a \`<footer>\`.`,
          starter: `<header>\n  \n</header>\n\n`,
          solution: `<header>\n  <h1>My Blog</h1>\n</header>\n<main>\n  <section>\n    <h2>First post</h2>\n    <p>Hello!</p>\n  </section>\n</main>\n<footer>\n  <p>Thanks for reading</p>\n</footer>`,
          checks: [
            { kind: 'html', desc: '`<header>` contains an `<h1>`', test: (d) => !!d.querySelector('header h1') },
            { kind: 'html', desc: 'Has exactly one `<main>`', test: (d) => d.querySelectorAll('main').length === 1 },
            { kind: 'html', desc: '`<main>` has a `<section>` with an `<h2>`', test: (d) => !!d.querySelector('main section h2') },
            { kind: 'html', desc: 'Has a `<footer>` after `<main>`', test: (d) => { const m = d.querySelector('main'); const f = d.querySelector('footer'); return !!m && !!f && !!(m.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_FOLLOWING); } },
          ],
          hints: ['Put `<h1>Title</h1>` between `<header>` and `</header>`.', 'Nest like this: `<main>` → `<section>` → `<h2>`.', 'Add `<footer>...</footer>` at the very end.'],
        },
        {
          type: 'quiz',
          id: 'html-q-main',
          question: 'How many `<main>` elements should a page have?',
          options: ['None', 'Exactly one', 'One per section', 'As many as you like'],
          answer: 1,
          explain: '`<main>` marks the unique main content of the page, so there should be one.',
        },
      ],
      summary: ['Semantic elements describe purpose: header, nav, main, section, footer.', 'They help accessibility and search engines, not just humans.', 'Full documents have `<head>` (settings) and `<body>` (visible content).'],
    },
    {
      id: 'html-forms',
      title: 'Forms',
      minutes: 10,
      goal: 'Build an accessible form with labels, inputs and a button.',
      blocks: [
        {
          type: 'text',
          md: `Forms let people send information: sign-ups, searches, messages. The building blocks:

- \`<form>\` — wraps the whole form
- \`<label>\` — the visible name of a field
- \`<input>\` — a field to type into (void element, no closing tag)
- \`<button>\` — submits the form

The \`type\` attribute changes what an input accepts: \`text\`, \`email\`, \`password\`, \`number\`, \`checkbox\`...`,
        },
        {
          type: 'code',
          lang: 'html',
          code: `<form>
  <label for="email">Email</label>
  <input id="email" type="email" required>
  <button>Subscribe</button>
</form>`,
          preview: true,
        },
        {
          type: 'text',
          md: `The label's \`for\` matches the input's \`id\`. That connection matters: clicking the label focuses the field, and screen readers announce "Email, edit text". The \`required\` attribute stops the form being sent while the field is empty.`,
        },
        {
          type: 'callout',
          tone: 'warning',
          md: `Don't use placeholder text instead of a label. Placeholders disappear as soon as someone types, and many screen readers skip them.`,
        },
        {
          type: 'exercise',
          id: 'html-ex-form',
          lang: 'html',
          title: 'Contact form',
          prompt: `Build a \`<form>\` with two labelled fields — a **name** (\`type="text"\`) and an **email** (\`type="email"\`) — and a submit \`<button>\`. Connect each label to its input with \`for\` and \`id\`. Make the email \`required\`.`,
          starter: `<form>\n  \n</form>\n`,
          solution: `<form>\n  <label for="name">Name</label>\n  <input id="name" type="text">\n\n  <label for="email">Email</label>\n  <input id="email" type="email" required>\n\n  <button>Send</button>\n</form>`,
          checks: [
            { kind: 'html', desc: 'Has a text input and an email input inside a `<form>`', test: (d) => !!d.querySelector('form input[type="text"]') && !!d.querySelector('form input[type="email"]') },
            { kind: 'html', desc: 'Every input has a `<label>` connected by `for`/`id`', test: (d) => { const ins = [...d.querySelectorAll('form input')]; return ins.length > 0 && ins.every((i) => i.id && [...d.querySelectorAll('label')].some((l) => l.getAttribute('for') === i.id)); } },
            { kind: 'html', desc: 'The email input is `required`', test: (d) => !!d.querySelector('input[type="email"][required]') },
            { kind: 'html', desc: 'Has a `<button>` inside the form', test: (d) => !!d.querySelector('form button') },
          ],
          hints: ['A labelled field: `<label for="name">Name</label>` then `<input id="name" type="text">`.', 'The `for` value must exactly match the `id` value.', 'Add the word `required` inside the email input’s tag.'],
        },
        {
          type: 'quiz',
          id: 'html-q-label',
          question: 'What connects a `<label>` to its `<input>`?',
          options: ['Putting them on the same line', 'The label’s `for` matching the input’s `id`', 'The input’s `placeholder`', 'Using the same text in both'],
          answer: 1,
          explain: '`for` on the label must match `id` on the input. (Wrapping the input inside the label also works.)',
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'What happens to the data?',
          md: `Right now the form doesn't send anywhere. Sending data needs JavaScript or a {term:server|server} — you'll get there in the JavaScript and backend courses.`,
        },
      ],
      summary: ['`<form>`, `<label>`, `<input>` and `<button>` build forms.', 'Connect labels with `for` = `id` — never rely on placeholders.', '`type` changes the input (email, password, number…); `required` blocks empty fields.'],
    },
  ],
};
