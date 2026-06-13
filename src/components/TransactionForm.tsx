"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase-client";
import type { TransacaoFormData } from "@/lib/types";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { CategorySelect } from "./CategorySelect";

type Props = {
  onDone: () => void;
  initial?: TransacaoFormData & { id?: string };
  currentMonth?: string;
};

export function TransactionForm({ onDone, initial, currentMonth }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [tipo, setTipo] = useState<"receita" | "despesa">(
    initial?.tipo || "despesa"
  );
  const [categoriaId, setCategoriaId] = useState(initial?.categoria_id || "");
  const [descricao, setDescricao] = useState(initial?.descricao || "");
  const [valor, setValor] = useState(initial?.valor || "");
  const [data, setData] = useState(
    initial?.data || new Date().toISOString().slice(0, 10)
  );
  const [justificativa, setJustificativa] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (initial?.id && !justificativa.trim()) return;

    setLoading(true);

    const novaData = data;
    const mesDaData = novaData.slice(0, 7);
    const status = currentMonth && mesDaData > currentMonth ? "pendente" : "confirmada";
    const novoValor = parseFloat(valor.replace(",", "."));

    if (initial?.id) {
      const { data: atual } = await supabase
        .from("sm_transacoes")
        .select("*")
        .eq("id", initial.id)
        .single();

      await supabase
        .from("sm_transacoes")
        .update({
          tipo,
          categoria_id: categoriaId,
          descricao,
          valor: novoValor,
          data: novaData,
        })
        .eq("id", initial.id);

      await supabase.from("sm_auditoria").insert({
        transacao_id: initial.id,
        acao: "alteracao",
        justificativa: justificativa.trim(),
        dados_anteriores: atual ? {
          tipo: atual.tipo,
          categoria_id: atual.categoria_id,
          descricao: atual.descricao,
          valor: Number(atual.valor),
          data: atual.data,
          status: atual.status,
        } : null,
        dados_novos: {
          tipo,
          categoria_id: categoriaId,
          descricao,
          valor: novoValor,
          data: novaData,
          status,
        },
      });
    } else {
      await supabase.from("sm_transacoes").insert({
        tipo,
        categoria_id: categoriaId,
        descricao,
        valor: novoValor,
        data: novaData,
        status,
      });
    }

    setLoading(false);
    onDone();
  }

  const editando = !!initial?.id;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setTipo("receita"); setCategoriaId(""); }}
          className={`flex-1 cursor-pointer rounded-lg py-2 text-sm font-medium transition-colors ${
            tipo === "receita"
              ? "bg-green-500 text-white"
              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
          }`}
        >
          Receita
        </button>
        <button
          type="button"
          onClick={() => { setTipo("despesa"); setCategoriaId(""); }}
          className={`flex-1 cursor-pointer rounded-lg py-2 text-sm font-medium transition-colors ${
            tipo === "despesa"
              ? "bg-red-500 text-white"
              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
          }`}
        >
          Despesa
        </button>
      </div>

      <CategorySelect tipo={tipo} value={categoriaId} onChange={setCategoriaId} />

      <Input
        label="Descrição"
        placeholder="Ex: Almoço no restaurante"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        required
      />

      <Input
        label="Valor"
        type="text"
        inputMode="decimal"
        placeholder="0,00"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        required
      />

      <Input
        label="Data"
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        required
      />

      {editando && (
        <Textarea
          label="Justificativa *"
          placeholder="Por que você está alterando esta transação?"
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          required
        />
      )}

      <Button type="submit" disabled={loading || (editando && !justificativa.trim())}>
        {loading ? "Salvando..." : editando ? "Salvar" : "Adicionar"}
      </Button>
    </form>
  );
}
