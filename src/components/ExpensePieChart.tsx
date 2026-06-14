"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "./ui/Card";
import { formatCurrency } from "@/lib/utils";

type Props = {
  data: { nome: string; cor: string; valor: number }[];
};

export function ExpensePieChart({ data }: Props) {
  const total = data.reduce((s, i) => s + i.valor, 0);

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
          Gastos por Categoria
        </h3>
        <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">
          Nenhuma despesa registrada.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
        Gastos por Categoria
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="valor"
            nameKey="nome"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            isAnimationActive={true}
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.cor} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              fontSize: "13px",
              boxShadow: "var(--shadow-lg)",
              pointerEvents: "none",
            }}
            formatter={(value) =>
              typeof value === "number"
                ? value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : value
            }
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 flex flex-wrap gap-3" style={{ pointerEvents: "none" }}>
        {data.map((item) => (
          <div key={item.nome} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.cor }}
            />
            <span className="text-[var(--muted-foreground)]">{item.nome}</span>
            <span className="font-medium text-[var(--foreground)]">
              {((item.valor / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
