"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase-client";
import type { TransacaoFormData } from "@/lib/types";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { CategorySelect } from "./CategorySelect";

type Props = {
  onDone: () => void;
  initial?: TransacaoFormData & { id?: string };
};

export function TransactionForm({ onDone, initial }: Props) {
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
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (initial?.id) {
      await supabase
        .from("sm_transacoes")
        .update({
          tipo,
          categoria_id: categoriaId,
          descricao,
          valor: parseFloat(valor.replace(",", ".")),
          data,
        })
        .eq("id", initial.id);
    } else {
      await supabase.from("sm_transacoes").insert({
        tipo,
        categoria_id: categoriaId,
        descricao,
        valor: parseFloat(valor.replace(",", ".")),
        data,
      });
    }

    setLoading(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setTipo("receita");
            setCategoriaId("");
          }}
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
          onClick={() => {
            setTipo("despesa");
            setCategoriaId("");
          }}
          className={`flex-1 cursor-pointer rounded-lg py-2 text-sm font-medium transition-colors ${
            tipo === "despesa"
              ? "bg-red-500 text-white"
              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
          }`}
        >
          Despesa
        </button>
      </div>

      <CategorySelect
        tipo={tipo}
        value={categoriaId}
        onChange={setCategoriaId}
      />

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

      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : initial?.id ? "Salvar" : "Adicionar"}
      </Button>
    </form>
  );
}
