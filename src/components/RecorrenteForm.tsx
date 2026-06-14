"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { CategorySelect } from "./CategorySelect";

type Props = {
  onDone: () => void;
  initial?: {
    id?: string;
    tipo: "receita" | "despesa";
    categoria_id: string;
    descricao: string;
    valor: string;
    dia_vencimento: number;
  };
};

export function RecorrenteForm({ onDone, initial }: Props) {
  const supabase = createClient();
  const [tipo, setTipo] = useState<"receita" | "despesa">(
    initial?.tipo || "despesa"
  );
  const [categoriaId, setCategoriaId] = useState(initial?.categoria_id || "");
  const [descricao, setDescricao] = useState(initial?.descricao || "");
  const [valor, setValor] = useState(initial?.valor || "");
  const [diaVencimento, setDiaVencimento] = useState(
    String(initial?.dia_vencimento || 5)
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      tipo,
      categoria_id: categoriaId,
      descricao,
      valor: parseFloat(valor.replace(",", ".")),
      dia_vencimento: parseInt(diaVencimento, 10),
    };

    if (initial?.id) {
      const { error: updateError } = await supabase.from("sm_recorrentes").update(payload).eq("id", initial.id);
      if (updateError) { setLoading(false); alert(updateError.message); return; }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { error: insertError } = await supabase.from("sm_recorrentes").insert({
        ...payload,
        user_id: user.id,
      });
      if (insertError) { setLoading(false); alert(insertError.message); return; }
    }

    setLoading(false);
    onDone();
  }

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
        placeholder="Ex: Aluguel"
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
        label="Dia de vencimento"
        type="number"
        min={1}
        max={31}
        value={diaVencimento}
        onChange={(e) => setDiaVencimento(e.target.value)}
        required
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : initial?.id ? "Salvar" : "Adicionar"}
      </Button>
    </form>
  );
}
