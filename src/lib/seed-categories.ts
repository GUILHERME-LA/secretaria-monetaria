import { createClient } from "./supabase-client";

const CATEGORIAS_PADRAO = [
  { nome: "Salário",       tipo: "receita",  cor: "#22c55e" },
  { nome: "Freela / Extra",tipo: "receita",  cor: "#16a34a" },
  { nome: "Investimentos", tipo: "receita",  cor: "#15803d" },
  { nome: "Alimentação",   tipo: "despesa",  cor: "#ef4444" },
  { nome: "Transporte",    tipo: "despesa",  cor: "#f97316" },
  { nome: "Moradia",       tipo: "despesa",  cor: "#eab308" },
  { nome: "Lazer",         tipo: "despesa",  cor: "#8b5cf6" },
  { nome: "Saúde",         tipo: "despesa",  cor: "#ec4899" },
  { nome: "Educação",      tipo: "despesa",  cor: "#06b6d4" },
  { nome: "Assinaturas",   tipo: "despesa",  cor: "#6366f1" },
];

export async function seedDefaultCategories() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { count } = await supabase
    .from("sm_categorias")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count === 0) {
    await supabase.from("sm_categorias").insert(
      CATEGORIAS_PADRAO.map((c) => ({ ...c, user_id: user.id }))
    );
  }
}
