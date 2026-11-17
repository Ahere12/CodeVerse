import { useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { Compartment, EditorState, Prec } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { indentUnit, syntaxHighlighting } from '@codemirror/language';
import { classHighlighter } from '@lezer/highlight';
import type { CodeLang } from '../../content/types';
import { languageExtension } from './languages';
import { useAppStore } from '../../store/useAppStore';

export interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  lang: CodeLang;
  /** Ctrl/Cmd+Enter */
  onRun?: () => void;
  readOnly?: boolean;
  minHeight?: number;
  maxHeight?: number | string;
  height?: number | string;
  ariaLabel?: string;
}

/**
 * CodeMirror 6 editor: line numbers, syntax highlighting, autocomplete, bracket matching,
 * search (Ctrl+F), multi-cursor, undo history and Tab indentation.
 * Esc then Tab moves focus out of the editor (CodeMirror's accessible Tab handling).
 */
export function CodeEditor({ value, onChange, lang, onRun, readOnly, minHeight = 120, maxHeight = 480, height, ariaLabel }: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const langComp = useRef(new Compartment());
  const roComp = useRef(new Compartment());
  const cbs = useRef({ onChange, onRun });
  cbs.current = { onChange, onRun };
  const fontSize = useAppStore((s) => s.prefs.editorFontSize);

  useEffect(() => {
    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          syntaxHighlighting(classHighlighter),
          indentUnit.of('  '),
          EditorState.tabSize.of(2),
          keymap.of([indentWithTab]),
          Prec.highest(
            keymap.of([
              { key: 'Mod-Enter', run: () => (cbs.current.onRun?.(), !!cbs.current.onRun) },
            ]),
          ),
          langComp.current.of(languageExtension(lang)),
          roComp.current.of([EditorState.readOnly.of(!!readOnly), EditorView.editable.of(!readOnly)]),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) cbs.current.onChange?.(u.state.doc.toString());
          }),
          EditorView.contentAttributes.of({ 'aria-label': ariaLabel ?? `${lang} code editor` }),
        ],
      }),
    });
    view.current = v;
    return () => v.destroy();
    // Created once; props below are synced through effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External value changes (reset, load) replace the document.
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({ effects: langComp.current.reconfigure(languageExtension(lang)) });
  }, [lang]);

  useEffect(() => {
    view.current?.dispatch({ effects: roComp.current.reconfigure([EditorState.readOnly.of(!!readOnly), EditorView.editable.of(!readOnly)]) });
  }, [readOnly]);

  return (
    <div
      ref={host}
      className="cm-host"
      style={{
        fontSize,
        height,
        minHeight: height ? undefined : minHeight,
        maxHeight: height ? undefined : maxHeight,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    />
  );
}
