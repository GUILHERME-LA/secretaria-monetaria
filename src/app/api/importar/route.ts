import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

interface Transaction {
  date: string;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
  categoria?: string;
  criar_categoria?: boolean;
  categoria_nubank?: string;
  identificador?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = user.id;

    const { transactions } = (await request.json()) as {
      transactions: Transaction[];
    };

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma transação enviada" },
        { status: 400 }
      );
    }

    const catCache: Record<string, string> = {};

    async function getCategoryId(catName: string, tipo: string, criar: boolean): Promise<string> {
      const key = `${catName}:${tipo}`;
      if (catCache[key]) return catCache[key];

      const found = await pool.query(
        `SELECT id FROM sm_categorias WHERE user_id = $1 AND nome = $2 AND tipo = $3 LIMIT 1`,
        [userId, catName, tipo]
      );

      if (found.rows.length > 0) {
        catCache[key] = found.rows[0].id;
        return found.rows[0].id;
      }

      if (criar) {
        const color = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
        const insert = await pool.query(
          `SELECT inserir_categoria($1, $2, $3, $4) AS id`,
          [userId, catName, tipo, color]
        );
        const newId = insert.rows[0]?.id;
        if (newId) {
          catCache[key] = newId;
          return newId;
        }
      }

      const fallback = await pool.query(
        `SELECT id FROM sm_categorias WHERE user_id = $1 AND nome = 'Outros' AND tipo = $2 LIMIT 1`,
        [userId, tipo]
      );

      if (fallback.rows.length > 0) {
        catCache[key] = fallback.rows[0].id;
        return fallback.rows[0].id;
      }

      const color = "#808080";
      const insert = await pool.query(
        `SELECT inserir_categoria($1, $2, $3, $4) AS id`,
        [userId, "Outros", tipo, color]
      );
      const fallbackId = insert.rows[0]?.id;
      if (fallbackId) {
        catCache[key] = fallbackId;
        return fallbackId;
      }

      throw new Error("Não foi possível obter uma categoria válida");
    }

    let importadas = 0;
    let duplicadas = 0;
    let erros = 0;

    for (const t of transactions) {
      if (!t.date || !t.descricao || t.valor == null || isNaN(t.valor)) {
        erros++;
        continue;
      }

      try {
        const exists = await pool.query(
          `SELECT id FROM sm_transacoes
           WHERE user_id = $1 AND data = $2 AND descricao = $3 AND valor = $4`,
          [userId, t.date, t.descricao, t.valor]
        );

        if (exists.rows.length > 0) {
          duplicadas++;
          continue;
        }

        const catName = t.categoria || "Outros";
        const categoriaId = await getCategoryId(catName, t.tipo, !!t.criar_categoria);

        await pool.query(
          `SELECT inserir_transacao($1, $2, $3, $4, $5, $6, $7)`,
          [userId, t.tipo, categoriaId, t.descricao, t.valor, t.date, "confirmada"]
        );
        importadas++;
      } catch {
        erros++;
      }
    }

    return NextResponse.json({
      success: true,
      data: { importadas, duplicadas, erros, total: transactions.length },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { error: `Erro no servidor: ${message}` },
      { status: 500 }
    );
  }
}
