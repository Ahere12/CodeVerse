/** Runs SQL against a fresh, seeded in-browser SQLite database (see sql.worker.ts). */

export interface SqlTable {
  columns: string[];
  values: (string | number | null | Uint8Array)[][];
}

export interface SqlResult {
  results: SqlTable[];
  /** Rows changed by the last INSERT/UPDATE/DELETE. */
  changes: number;
  /** Result of the reference query, when one was given (for grading). */
  expected?: SqlTable[];
  error?: string;
  timedOut: boolean;
  ms: number;
}

/** A small shop database used by the SQL playground, lessons and challenges. */
export const SHOP_SEED = `
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT, joined TEXT);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT, price REAL);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), product_id INTEGER REFERENCES products(id), quantity INTEGER, ordered_at TEXT);

INSERT INTO customers VALUES
 (1,'Ada Lovelace','London','2025-01-14'),(2,'Grace Hopper','New York','2025-02-03'),
 (3,'Alan Turing','Manchester','2025-02-20'),(4,'Katherine Johnson','Hampton','2025-03-11'),
 (5,'Linus Torvalds','Portland','2025-04-02'),(6,'Margaret Hamilton','Boston','2025-04-18'),
 (7,'Tim Berners-Lee','London','2025-05-09'),(8,'Radia Perlman','New York','2025-06-21');
INSERT INTO products VALUES
 (1,'Mechanical Keyboard','Hardware',89.0),(2,'USB-C Hub','Hardware',35.5),
 (3,'Monitor Arm','Hardware',59.99),(4,'Rubber Duck','Accessories',4.5),
 (5,'Laptop Stand','Accessories',29.0),(6,'Noise-Cancelling Headphones','Audio',199.0),
 (7,'Desk Mat','Accessories',19.99),(8,'Webcam','Hardware',64.0);
INSERT INTO orders VALUES
 (1,1,1,1,'2025-06-01'),(2,1,4,3,'2025-06-01'),(3,2,6,1,'2025-06-03'),(4,3,2,2,'2025-06-04'),
 (5,4,5,1,'2025-06-07'),(6,5,1,1,'2025-06-08'),(7,5,7,2,'2025-06-08'),(8,6,3,1,'2025-06-10'),
 (9,7,4,5,'2025-06-12'),(10,7,8,1,'2025-06-12'),(11,2,4,1,'2025-06-15'),(12,8,6,1,'2025-06-18'),
 (13,1,7,1,'2025-06-20'),(14,3,5,1,'2025-06-22'),(15,6,2,1,'2025-06-25');
`;

let worker: Worker | null = null;
let nextId = 1;
const getWorker = () => (worker ??= new Worker(new URL('./sql.worker.ts', import.meta.url), { type: 'module' }));

export function runSql(sql: string, opts: { seed?: string; expectedSql?: string; timeoutMs?: number } = {}): Promise<SqlResult> {
  const { seed = SHOP_SEED, expectedSql, timeoutMs = 3000 } = opts;
  const id = nextId++;
  const started = performance.now();
  return new Promise((resolve) => {
    const w = getWorker();
    const timer = window.setTimeout(() => {
      w.removeEventListener('message', onMsg);
      w.terminate();
      worker = null;
      resolve({ results: [], changes: 0, timedOut: true, error: `The query ran for more than ${timeoutMs / 1000}s and was stopped.`, ms: timeoutMs });
    }, timeoutMs);
    const onMsg = (e: MessageEvent) => {
      if (e.data?.id !== id) return;
      window.clearTimeout(timer);
      w.removeEventListener('message', onMsg);
      resolve({ results: [], changes: 0, ...e.data, timedOut: false, ms: Math.round(performance.now() - started) });
    };
    w.addEventListener('message', onMsg);
    w.postMessage({ id, sql, seed, expectedSql });
  });
}

/** Compares result sets. Row order matters only when `ordered` is true. */
export function sameRows(a: SqlTable | undefined, b: SqlTable | undefined, ordered = false): boolean {
  if (!a || !b) return a === b;
  if (a.values.length !== b.values.length || a.columns.length !== b.columns.length) return false;
  const rows = (t: SqlTable) => t.values.map((r) => JSON.stringify(r.map((v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v))));
  const ra = rows(a);
  const rb = rows(b);
  if (!ordered) {
    ra.sort();
    rb.sort();
  }
  return ra.every((r, i) => r === rb[i]);
}

/** Plain-language help for common SQLite errors. */
export function explainSqlError(msg: string): string | undefined {
  if (/no such table/i.test(msg)) return 'That table doesn’t exist. The tables are `customers`, `products` and `orders` — check the spelling.';
  if (/no such column/i.test(msg)) return 'That column doesn’t exist in the table. Run `SELECT * FROM table LIMIT 1` to see the column names.';
  if (/syntax error/i.test(msg)) return 'The query isn’t valid SQL yet. Check commas between columns, quotes around text, and the order SELECT → FROM → WHERE → GROUP BY → ORDER BY.';
  if (/ambiguous column/i.test(msg)) return 'Two joined tables share that column name. Prefix it with the table name, like `orders.id`.';
  return undefined;
}
