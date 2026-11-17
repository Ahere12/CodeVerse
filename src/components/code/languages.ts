import { html, htmlLanguage } from '@codemirror/lang-html';
import { css, cssLanguage } from '@codemirror/lang-css';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { python, pythonLanguage } from '@codemirror/lang-python';
import { sql, StandardSQL } from '@codemirror/lang-sql';
import type { Extension } from '@codemirror/state';
import type { Parser } from '@lezer/common';
import type { CodeLang } from '../../content/types';

export function languageExtension(lang: CodeLang): Extension {
  switch (lang) {
    case 'html': return html();
    case 'css': return css();
    case 'javascript': return javascript();
    case 'python': return python();
    case 'sql': return sql({ dialect: StandardSQL });
    default: return [];
  }
}

export function parserFor(lang: CodeLang): Parser | null {
  switch (lang) {
    case 'html': return htmlLanguage.parser;
    case 'css': return cssLanguage.parser;
    case 'javascript': return javascriptLanguage.parser;
    case 'python': return pythonLanguage.parser;
    case 'sql': return StandardSQL.language.parser;
    default: return null;
  }
}

export const LANG_LABEL: Record<CodeLang, string> = {
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  python: 'Python',
  sql: 'SQL',
  text: 'Text',
};
