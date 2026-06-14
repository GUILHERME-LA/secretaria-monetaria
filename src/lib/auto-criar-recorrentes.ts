"use server";

import { createClient } from "@/lib/supabase-client";

export async function autoCriarRecorrentes() {
  const supabase = createClient();

  const now = new Date();
  const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: recorrentes } = await supabase
    .from("sm_recorrentes")
    .select("id, categoria_id, descricao, valor, tipo, dia_vencimento")
    .eq("ativo", true);

  if (!recorrentes || recorrentes.length === 0) return 0;

  const { data: existentes } = await supabase
    .from("sm_transacoes")
    .select("descricao, tipo, categoria_id")
    .gte("data", `${mesAtual}-01`)
    .lte("data", `${mesAtual}-${String(ultimoDia).padStart(2, "0")}`)
    .eq("status", "pendente");

  let criadas = 0;

  for (const rec of recorrentes) {
    const jaExiste = existentes?.some(
      (e: any) =>
        e.descricao === rec.descricao &&
        e.tipo === rec.tipo &&
        e.categoria_id === rec.categoria_id
    );

    if (jaExiste) continue;

    const dia = Math.min(rec.dia_vencimento, ultimoDia);
    const data = `${mesAtual}-${String(dia).padStart(2, "0")}`;

    const { error } = await supabase.from("sm_transacoes").insert({
      user_id: user.id,
      categoria_id: rec.categoria_id,
      descricao: rec.descricao,
      valor: rec.valor,
      tipo: rec.tipo,
      data,
      status: "pendente",
    });

    if (!error) criadas++;
  }

  return criadas;
}
