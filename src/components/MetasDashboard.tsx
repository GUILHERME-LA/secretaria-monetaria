"use client";

import { useMemo } from "react";
import { Target } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";

export type Meta = {
  id: string;
  titulo: string;
  valorObjetivo: number;
  valorAtual: number;
  cor: string;
  createdAt: string;
};

type Props = {
  metas: Meta[];
  onOpenPage?: () => void;
};

export function MetasDashboard({ metas, onOpenPage }: Props) {
  const sorted = useMemo(
    () => [...metas].sort((a, b) => (b.valorAtual / b.valorObjetivo) - (a.valorAtual / a.valorObjetivo)),
    [metas]
  );

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="Nenhuma meta financeira"
        description="Defina metas para acompanhar seu progresso."
        action={onOpenPage ? { label: "Criar Meta", onClick: onOpenPage } : undefined}
      />
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Metas Financeiras
        </h3>
        {onOpenPage && (
          <button
            onClick={onOpenPage}
            className="cursor-pointer text-xs font-medium text-[var(--accent)] hover:underline"
          >
            Gerenciar
          </button>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {sorted.slice(0, 3).map((meta) => {
          const progresso = Math.min(
            Math.round((meta.valorAtual / meta.valorObjetivo) * 100),
            100
          );
          return (
            <div key={meta.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--foreground)]">
                  {meta.titulo}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {formatCurrency(meta.valorAtual)} / {formatCurrency(meta.valorObjetivo)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progresso}%`,
                    backgroundColor: meta.cor,
                  }}
                />
              </div>
              <p className="mt-0.5 text-right text-[10px] font-medium text-[var(--muted-foreground)]">
                {progresso}%
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
