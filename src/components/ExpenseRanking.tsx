"use client";

import { Card } from "./ui/Card";
import { formatCurrency } from "@/lib/utils";

type Props = {
  data: { nome: string; cor: string; valor: number }[];
};

export function ExpenseRanking({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
          Top Categorias
        </h3>
        <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">
          Nenhuma despesa registrada.
        </p>
      </Card>
    );
  }

  const maxValor = data[0]?.valor || 1;

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
        Onde mais gastei
      </h3>
      <div className="flex flex-col gap-3">
        {data.map((item, idx) => (
          <div key={item.nome}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--muted-foreground)]">
                  {idx + 1}
                </span>
                <span className="text-[var(--foreground)]">{item.nome}</span>
              </div>
              <span className="font-semibold text-[var(--foreground)]">
                {formatCurrency(item.valor)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(item.valor / maxValor) * 100}%`,
                  backgroundColor: item.cor,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
