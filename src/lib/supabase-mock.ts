import { demoCategories, generateDemoTransactions } from "./demo-data";

let categorias = [...demoCategories];
let transacoes = generateDemoTransactions();

function runPipeline(
  table: string,
  fields: string,
  filters: Array<(rows: any[]) => any[]>,
  orderField: string,
  orderDir: "asc" | "desc",
  rangeStart?: number,
  rangeEnd?: number
): { data: any[]; error: null } {
  let rows = table === "sm_categorias" ? [...categorias] : [...transacoes];
  for (const filter of filters) rows = filter(rows);
  if (orderField) {
    rows.sort((a, b) => {
      const cmp = a[orderField] < b[orderField] ? -1 : a[orderField] > b[orderField] ? 1 : 0;
      return orderDir === "desc" ? -cmp : cmp;
    });
  }
  if (rangeStart !== undefined && rangeEnd !== undefined) rows = rows.slice(rangeStart, rangeEnd + 1);
  const hasJoin = fields.includes("categorias(");
  if (hasJoin && table === "sm_transacoes") {
    const catMap = new Map(categorias.map((c: any) => [c.id, c]));
    rows = rows.map((t: any) => ({ ...t, categorias: catMap.get(t.categoria_id) || null }));
  }
  return { data: rows, error: null };
}

class SelectBuilder {
  private table: string;
  private fields = "*";
  private filters: Array<(rows: any[]) => any[]> = [];
  private orderField = "";
  private orderDir: "asc" | "desc" = "asc";
  constructor(table: string) { this.table = table; }
  select(f: string) { this.fields = f; return this; }
  eq(field: string, value: any) { this.filters.push((rs: any[]) => rs.filter((r) => r[field] === value)); return this; }
  gte(field: string, value: any) { this.filters.push((rs: any[]) => rs.filter((r) => r[field] >= value)); return this; }
  lte(field: string, value: any) { this.filters.push((rs: any[]) => rs.filter((r) => r[field] <= value)); return this; }
  order(field: string, opts: { ascending?: boolean } = {}) { this.orderField = field; this.orderDir = opts.ascending === false ? "desc" : "asc"; return this; }
  then(resolve: (v: any) => void, _reject?: (v: any) => void) { setTimeout(() => resolve(runPipeline(this.table, this.fields, this.filters, this.orderField, this.orderDir)), 0); }
}

class InsertBuilder {
  private table: string; private values: any;
  constructor(table: string, values: any) { this.table = table; this.values = values; }
  then(resolve: (v: any) => void) {
    const item = { ...this.values, id: this.values.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, created_at: this.values.created_at || new Date().toISOString(), user_id: this.values.user_id || "demo-user" };
    if (this.table === "sm_categorias") (categorias as any[]).push(item);
    else if (this.table === "sm_transacoes") (transacoes as any[]).push(item);
    setTimeout(() => resolve({ data: item, error: null }), 0);
  }
}

class UpdateBuilder {
  private table: string; private values: any; private filters: Array<(rows: any[]) => any[]> = [];
  constructor(table: string, values: any) { this.table = table; this.values = values; }
  eq(field: string, value: any) { this.filters.push((rs: any[]) => rs.filter((r) => r[field] === value)); return this; }
  then(resolve: (v: any) => void) {
    let rows = this.table === "sm_categorias" ? categorias : transacoes;
    for (const f of this.filters) rows = f(rows);
    (rows as any[]).forEach((r: any) => Object.assign(r, this.values));
    setTimeout(() => resolve({ data: rows, error: null }), 0);
  }
}

class DeleteBuilder {
  private table: string; private filters: Array<(rows: any[]) => any[]> = [];
  constructor(table: string) { this.table = table; }
  eq(field: string, value: any) { this.filters.push((rs: any[]) => rs.filter((r) => r[field] === value)); return this; }
  then(resolve: (v: any) => void) {
    const source = this.table === "sm_categorias" ? (categorias as any[]) : (transacoes as any[]);
    const toDelete: any[] = [];
    let remaining = [...source];
    for (const f of this.filters) { const m = f(remaining); toDelete.push(...m); remaining = remaining.filter((r: any) => !m.includes(r)); }
    if (this.table === "sm_categorias") categorias = remaining;
    else transacoes = remaining;
    setTimeout(() => resolve({ data: toDelete, error: null }), 0);
  }
}

const currentUser = { id: "demo-user", email: "demo@demo.com" };

export function createMockClient() {
  return {
    from: (table: string) => ({
      select: (fields = "*") => new SelectBuilder(table).select(fields),
      insert: (values: any) => new InsertBuilder(table, values),
      update: (values: any) => new UpdateBuilder(table, values),
      delete: () => new DeleteBuilder(table),
    }),
    auth: {
      signInWithPassword: async ({ email }: { email: string }) => ({ data: { user: { id: "demo-user", email } }, error: null }),
      signUp: async ({ email }: { email: string }) => ({ data: { user: { id: "demo-user", email } }, error: null }),
      signOut: async () => { return { error: null }; },
      getUser: async () => ({ data: { user: currentUser }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  };
}

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}
