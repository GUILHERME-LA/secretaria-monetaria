"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

export default function TesteMockPage() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    console.log("[teste-mock] iniciando...");
    const supabase = createClient();
    console.log("[teste-mock] supabase criado", supabase ? "ok" : "falhou");

    async function carregar() {
      console.log("[teste-mock] buscando categorias...");
      const { data: cats, error: err1 } = await supabase
        .from("sm_categorias")
        .select("*")
        .eq("tipo", "despesa")
        .order("nome");

      console.log("[teste-mock] categorias retornadas:", cats?.length ?? 0, cats);
      if (err1) console.error("[teste-mock] erro categorias:", err1);
      if (cats) setCategorias(cats);
      else setErro((prev) => prev + " categorias vazio |");

      console.log("[teste-mock] buscando transacoes...");
      const { data: trans, error: err2 } = await supabase
        .from("sm_transacoes")
        .select("*, categorias(nome, cor)")
        .gte("data", "2026-01-01")
        .lte("data", "2026-12-31");

      console.log("[teste-mock] transacoes retornadas:", trans?.length ?? 0, trans);
      if (err2) console.error("[teste-mock] erro transacoes:", err2);
      if (trans) setTransacoes(trans);
      else setErro((prev) => prev + " transacoes vazio |");

      console.log("[teste-mock] finalizado");
    }

    carregar();
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-xl font-bold">Teste Mock</h1>
      {erro && (
        <div className="mb-4 rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-500">
          {erro}
        </div>
      )}
      <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="mb-2 font-semibold">
          Categorias ({categorias.length})
        </h2>
        <pre className="overflow-auto text-xs">
          {JSON.stringify(categorias, null, 2)}
        </pre>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="mb-2 font-semibold">
          Transacoes ({transacoes.length})
        </h2>
        <pre className="overflow-auto text-xs">
          {JSON.stringify(transacoes, null, 2)}
        </pre>
      </div>
    </main>
  );
}
