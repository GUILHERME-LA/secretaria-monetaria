import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { generateInsights } from "@/lib/insights-engine";
import type { Insight } from "@/lib/insights-engine";

const OLLAMA_CLOUD_URL = "https://ollama.com/api/chat";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:8b-cloud";

function buildPrompt(data: {
  receitas: number;
  despesas: number;
  variacaoReceitas: number | null;
  variacaoDespesas: number | null;
  pieData: { nome: string; valor: number }[];
  recentMonths: { mes: string; receitas: number; despesas: number }[];
}): string {
  const saldo = data.receitas - data.despesas;
  const proporcao = data.receitas > 0 ? Math.round((data.despesas / data.receitas) * 100) : 0;
  const topCategorias = data.pieData.slice(0, 3).map((c) => `${c.nome} (R$ ${c.valor.toFixed(2)})`).join(", ");

  let historico = "";
  if (data.recentMonths.length > 0) {
    historico = data.recentMonths.map((m) => `${m.mes}: R$ ${m.receitas.toFixed(2)} receita / R$ ${m.despesas.toFixed(2)} despesa`).join("\n");
  }

  return `Você é um analista financeiro especializado em finanças pessoais. Analise os dados abaixo e gere insights em português brasileiro.

DADOS DO MÊS:
- Receitas: R$ ${data.receitas.toFixed(2)}
- Despesas: R$ ${data.despesas.toFixed(2)}
- Saldo: R$ ${saldo.toFixed(2)}
- Proporção despesa/receita: ${proporcao}%
- Variação de receitas vs mês anterior: ${data.variacaoReceitas !== null ? data.variacaoReceitas + "%" : "N/A"}
- Variação de despesas vs mês anterior: ${data.variacaoDespesas !== null ? data.variacaoDespesas + "%" : "N/A"}
- Top categorias de gasto: ${topCategorias || "Nenhuma"}
${historico ? "\nHISTÓRICO:\n" + historico : ""}

REGRAS:
1. Gere 2 a 4 insights relevantes e acionáveis
2. Cada insight deve ter: "type" ("positive"|"negative"|"info"), "icon" (emoji), "title" (título curto), "description" (explicação)
3. Se a margem estiver apertada (>90%), alerte
4. Se houver tendência de alta nos gastos, alerte
5. Se o saldo for positivo consistente, parabenize
6. Destaque o maior gasto e seu impacto
7. Se houver poucos dados, foque no que está disponível
8. Se não houver dados suficientes, retorne array vazio

Responda APENAS com JSON array, sem markdown, sem formatação extra:
[{"type":"positive","icon":"🟢","title":"Título","description":"Descrição"}]

Se não conseguir gerar, retorne [].`;
}

export async function POST(request: NextRequest) {
  const payload = await request.json();

  const supabase = await createServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const fallback = generateInsights(
    payload.receitas,
    payload.despesas,
    payload.variacaoReceitas,
    payload.variacaoDespesas,
    payload.pieData || [],
    payload.recentMonths || []
  );

  const apiKey = process.env.OLLAMA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: true, data: fallback });
  }

  try {
    const res = await fetch(OLLAMA_CLOUD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: buildPrompt(payload) },
          { role: "user", content: "Gere os insights com base nos dados fornecidos." },
        ],
        stream: false,
        think: false,
        options: { temperature: 0.3 },
      }),
    });

    if (!res.ok) {
      console.warn("Ollama insights error, falling back to rule-based");
      return NextResponse.json({ success: true, data: fallback });
    }

    const data = await res.json();
    const rawText = data?.message?.content || "";
    const text = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");
    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({ success: true, data: fallback });
    }

    const parsed: Insight[] = JSON.parse(text.substring(jsonStart, jsonEnd + 1));

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return NextResponse.json({ success: true, data: fallback });
    }

    const valid = parsed.filter(
      (i) => i.type && i.icon && i.title && i.description
    );

    return NextResponse.json({ success: true, data: valid.length > 0 ? valid.slice(0, 4) : fallback });
  } catch (err) {
    console.warn("Ollama insights exception, falling back to rule-based");
    return NextResponse.json({ success: true, data: fallback });
  }
}
