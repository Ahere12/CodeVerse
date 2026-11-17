/// <reference lib="webworker" />
/**
 * SQLite (sql.js, WebAssembly) in a module worker. Each request builds a fresh
 * in-memory database from the seed script, so runs never affect each other.
 */
import initSqlJs, { type SqlJsStatic } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

let SQL: Promise<SqlJsStatic> | null = null;

self.onmessage = async (e: MessageEvent<{ id: number; sql: string; seed: string; expectedSql?: string }>) => {
  const { id, sql, seed, expectedSql } = e.data;
  try {
    SQL ??= initSqlJs({ locateFile: () => wasmUrl });
    const lib = await SQL;
    const run = (query: string) => {
      const db = new lib.Database();
      try {
        if (seed) db.run(seed);
        const results = db.exec(query);
        return { results, changes: db.getRowsModified() };
      } finally {
        db.close();
      }
    };
    const actual = run(sql);
    const expected = expectedSql ? run(expectedSql).results : undefined;
    self.postMessage({ id, ...actual, expected });
  } catch (err) {
    self.postMessage({ id, error: err instanceof Error ? err.message : String(err) });
  }
};
