import { NextRequest, NextResponse } from "next/server";

const CATEGORIAS_RECEITA = ["Salário", "Freela / Extra", "Investimentos"];
const CATEGORIAS_DESPESA = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Assinaturas",
];

const SYSTEM_PROMPT = `Você é um assistente financeiro. Extraia os dados de uma transação da mensagem do usuário.

Categorias disponíveis:
- receita: ${CATEGORIAS_RECEITA.join(", ")}
- despesa: ${CATEGORIAS_DESPESA.join(", ")}

Responda APENAS com um JSON sem formatação adicional, sem markdown, sem acentos:
{"tipo":"receita ou despesa","descricao":"texto curto","valor":numero,"categoria":"nome da categoria","data":"YYYY-MM-DD (use a data atual se não mencionada)"}

Se não conseguir extrair, retorne: {"erro":"mensagem explicativa em português"}`;

const OLLAMA_CLOUD_URL = "https://ollama.com/api/chat";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:8b-cloud";

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ erro: "Mensagem vazia." }, { status: 400 });
  }

  const apiKey = process.env.OLLAMA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "API key do Ollama não configurada. Crie uma em https://ollama.com/settings/keys" },
      { status: 500 }
    );
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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        stream: false,
        options: { temperature: 0.1 },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { erro: `Ollama Cloud error ${res.status}: ${errText}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = data?.message?.content || "";

    const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.erro) {
      return NextResponse.json({ erro: parsed.erro });
    }

    if (!parsed.tipo || !parsed.descricao || !parsed.valor || !parsed.categoria) {
      return NextResponse.json({
        erro: "Não consegui entender a transação. Tente ser mais específico.",
      });
    }

    if (!parsed.data) {
      const hoje = new Date();
      parsed.data = hoje.toISOString().slice(0, 10);
    }

    return NextResponse.json({ success: true, transacao: parsed });
  } catch (err: any) {
    return NextResponse.json(
      { erro: `Erro ao processar: ${err.message}` },
      { status: 500 }
    );
  }
}
