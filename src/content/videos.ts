/**
 * Curated free videos from established creators.
 * Every id was checked against YouTube's oEmbed endpoint on 2026-11-17; titles and
 * channel names are copied exactly from that response. Re-check with:
 *   curl "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json"
 */
export interface Video {
  id: string;
  title: string;
  author: string;
  /** Short note so learners know what they're getting. */
  kind: 'quick' | 'tutorial' | 'full-course';
}

const v = (id: string, title: string, author: string, kind: Video['kind']): Video => ({ id, title, author, kind });

const HTML_100 = v('ok-plXXHlWw', 'HTML in 100 Seconds', 'Fireship', 'quick');
const CSS_100 = v('OEV8gMkCHXQ', 'CSS in 100 Seconds', 'Fireship', 'quick');
const JS_100 = v('DHjqpvDnNGE', 'JavaScript in 100 Seconds', 'Fireship', 'quick');

/** Lesson id → videos, best first. */
export const LESSON_VIDEOS: Record<string, Video[]> = {
  'sh-what-is-programming': [v('zOjov-2OZ0E', 'Introduction to Programming and Computer Science - Full Course', 'freeCodeCamp.org', 'full-course')],
  'sh-how-the-web-works': [v('kBXQZMmiA4s', 'The Internet: HTTP & HTML', 'CodeAI', 'tutorial'), v('ZhEf7e4kopM', 'The Internet: Wires, Cables & Wifi', 'CodeAI', 'tutorial')],
  'sh-first-program': [JS_100],

  'html-tags': [HTML_100],
  'html-lists-text': [v('qz0aGYrrlhU', 'HTML Tutorial for Beginners: HTML Crash Course', 'Programming with Mosh', 'tutorial')],
  'html-links-images': [v('kUMe1FH4CHE', 'Learn HTML – Full Tutorial for Beginners', 'freeCodeCamp.org', 'full-course')],
  'html-structure': [v('pQN-pnXPaVg', 'HTML Full Course - Build a Website Tutorial', 'freeCodeCamp.org', 'full-course')],
  'html-forms': [v('fNcJuPIZ2WE', 'Learn HTML Forms In 25 Minutes', 'Web Dev Simplified', 'tutorial')],

  'css-rules': [CSS_100, v('1PnVor36_40', 'Learn CSS in 20 Minutes', 'Web Dev Simplified', 'tutorial')],
  'css-classes': [v('c0kfcP_nD9E', 'CSS Specificity explained', 'Kevin Powell', 'tutorial'), v('l1mER1bV0N0', 'Learn Every CSS Selector In 20 Minutes', 'Web Dev Simplified', 'tutorial')],
  'css-box-model': [v('rIO5326FgPE', 'Learn CSS Box Model In 8 Minutes', 'Web Dev Simplified', 'tutorial')],
  'css-flexbox': [v('K74l26pE4YA', 'CSS Flexbox in 100 Seconds', 'Fireship', 'quick'), v('fYq5PXgSsbE', 'Learn Flexbox in 15 Minutes', 'Web Dev Simplified', 'tutorial')],

  'js-values': [JS_100],
  'js-variables': [v('W6NZfCO5SIk', 'JavaScript Course for Beginners – Your First Step to Web Development', 'Programming with Mosh', 'full-course')],
  'js-conditions': [v('IsG4Xd6LlsM', 'JavaScript if else (tutorial)', 'Programming with Mosh', 'tutorial')],
  'js-functions': [v('N8ap4k_1QEQ', 'JavaScript Functions', 'Programming with Mosh', 'tutorial'), v('h33Srr5J9nY', 'JavaScript ES6 Arrow Functions Tutorial', 'Web Dev Simplified', 'tutorial')],
  'js-arrays-loops': [v('PkZNo7MFNFg', 'Learn JavaScript - Full Course for Beginners', 'freeCodeCamp.org', 'full-course')],
  'js-objects': [v('FtaQSdrl7YA', 'JavaScript Tutorial for Beginners [JS Crash Course]', 'TechWorld with Nana', 'full-course')],

  'jsd-map-filter': [v('R8rmfD9Y5-c', '8 Must Know JavaScript Array Methods', 'Web Dev Simplified', 'tutorial')],
  'jsd-reduce': [v('s1XVfm5mIuU', 'Learn JavaScript Array Reduce In 10 Minutes', 'Web Dev Simplified', 'tutorial')],
  'jsd-destructuring': [v('NIq3qLaHCIs', 'Why Is Array/Object Destructuring So Useful And How To Use It', 'Web Dev Simplified', 'tutorial')],
  'jsd-json': [v('iiADhChRriM', 'Learn JSON in 10 Minutes', 'Web Dev Simplified', 'tutorial')],
};

/** Language id → a short overview video for the language page. */
export const LANGUAGE_VIDEOS: Record<string, Video> = {
  html: HTML_100,
  css: CSS_100,
  javascript: JS_100,
  python: v('x7X9w_GIm1s', 'Python in 100 Seconds', 'Fireship', 'quick'),
  sql: v('zsjvFFKOm3c', 'SQL Explained in 100 Seconds', 'Fireship', 'quick'),
};

export const VIDEO_KIND_LABEL: Record<Video['kind'], string> = {
  quick: 'Quick overview',
  tutorial: 'Tutorial',
  'full-course': 'Full course · long',
};
