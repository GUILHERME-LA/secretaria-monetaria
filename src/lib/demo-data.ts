export const demoCategories = [
  { id: "cat-1", user_id: "demo-user", nome: "Salário", tipo: "receita", cor: "#22c55e", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-2", user_id: "demo-user", nome: "Freela / Extra", tipo: "receita", cor: "#16a34a", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-3", user_id: "demo-user", nome: "Investimentos", tipo: "receita", cor: "#15803d", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-4", user_id: "demo-user", nome: "Alimentação", tipo: "despesa", cor: "#ef4444", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-5", user_id: "demo-user", nome: "Transporte", tipo: "despesa", cor: "#f97316", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-6", user_id: "demo-user", nome: "Moradia", tipo: "despesa", cor: "#eab308", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-7", user_id: "demo-user", nome: "Lazer", tipo: "despesa", cor: "#8b5cf6", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-8", user_id: "demo-user", nome: "Saúde", tipo: "despesa", cor: "#ec4899", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-9", user_id: "demo-user", nome: "Educação", tipo: "despesa", cor: "#06b6d4", created_at: "2026-01-01T00:00:00Z" },
  { id: "cat-10", user_id: "demo-user", nome: "Assinaturas", tipo: "despesa", cor: "#6366f1", created_at: "2026-01-01T00:00:00Z" },
];

export function generateDemoTransactions() {
  const now = new Date();
  const transactions: any[] = [];
  let idx = 0;

  for (let mesesAtras = 5; mesesAtras >= 0; mesesAtras--) {
    const d = new Date(now.getFullYear(), now.getMonth() - mesesAtras, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    // Receita fixa no dia 5
    idx++;
    transactions.push({
      id: `demo-${idx}`,
      user_id: "demo-user",
      categoria_id: "cat-1",
      tipo: "receita",
      descricao: "Salário",
      valor: 5200 + Math.round(Math.random() * 400),
      data: `${year}-${String(month).padStart(2, "0")}-05`,
      created_at: `${year}-${String(month).padStart(2, "0")}-05T08:00:00Z`,
    });

    // Receita extra as vezes
    if (mesesAtras % 2 === 0) {
      idx++;
      transactions.push({
        id: `demo-${idx}`,
        user_id: "demo-user",
        categoria_id: "cat-2",
        tipo: "receita",
        descricao: "Freela site",
        valor: 800 + Math.round(Math.random() * 1200),
        data: `${year}-${String(month).padStart(2, "0")}-${String(Math.min(15 + mesesAtras, daysInMonth)).padStart(2, "0")}`,
        created_at: `${year}-${String(month).padStart(2, "0")}-15T10:00:00Z`,
      });
    }

    // Despesas variadas
    const despesas = [
      { cat: "cat-4", desc: "Supermercado", val: [350, 650], dia: 3 },
      { cat: "cat-4", desc: "Restaurante", val: [40, 120], dia: 12 },
      { cat: "cat-5", desc: "Uber", val: [15, 45], dia: 8 },
      { cat: "cat-5", desc: "Gasolina", val: [120, 200], dia: 18 },
      { cat: "cat-6", desc: "Aluguel", val: [1200, 1200], dia: 1 },
      { cat: "cat-6", desc: "Condomínio", val: [350, 400], dia: 1 },
      { cat: "cat-7", desc: "Cinema", val: [30, 70], dia: 14 },
      { cat: "cat-7", desc: "Ifood", val: [25, 80], dia: 20 },
      { cat: "cat-8", desc: "Farmácia", val: [40, 90], dia: 10 },
      { cat: "cat-9", desc: "Curso Online", val: [29, 60], dia: 22 },
      { cat: "cat-10", desc: "Netflix", val: [55, 55], dia: 15 },
      { cat: "cat-10", desc: "Spotify", val: [22, 22], dia: 15 },
    ];

    for (const desp of despesas) {
      if (Math.random() > 0.25 || mesesAtras === 0) {
        idx++;
        const dia = Math.min(desp.dia + Math.floor(Math.random() * 3), daysInMonth);
        transactions.push({
          id: `demo-${idx}`,
          user_id: "demo-user",
          categoria_id: desp.cat,
          tipo: "despesa",
          descricao: desp.desc,
          valor: desp.val[0] + Math.round(Math.random() * (desp.val[1] - desp.val[0])),
          data: `${year}-${String(month).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
          created_at: `${year}-${String(month).padStart(2, "0")}-${String(dia).padStart(2, "0")}T12:00:00Z`,
        });
      }
    }
  }

  return transactions;
}
