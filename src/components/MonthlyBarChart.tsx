"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "./ui/Card";

type Props = {
  data: { mes: string; receitas: number; despesas: number }[];
  previstoData?: { mes: string; receitas: number; despesas: number }[];
};

export function MonthlyBarChart({ data, previstoData }: Props) {
  if (data.length === 0) return null;

  const merged = data.map((item) => {
    const prev = previstoData?.find((p) => p.mes === item.mes);
    return {
      ...item,
      receitasPrevistas: prev ? Math.max(0, prev.receitas - item.receitas) : 0,
      despesasPrevistas: prev ? Math.max(0, prev.despesas - item.despesas) : 0,
    };
  });

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
        Evolução Mensal
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={merged} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <XAxis
            dataKey="mes"
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
            tickFormatter={(v: number) => {
              if (Math.abs(v) >= 1000000) return (v / 1000000).toFixed(1) + "M";
              if (Math.abs(v) >= 1000) return "R$ " + (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + "k";
              return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
            }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              fontSize: "13px",
              boxShadow: "var(--shadow-lg)",
              pointerEvents: "none",
            }}
            formatter={(value: any, name: any) => {
              const labels: Record<string, string> = {
                receitas: "Receita Realizada",
                receitasPrevistas: "Receita Prevista",
                despesas: "Despesa Realizada",
                despesasPrevistas: "Despesa Prevista",
              };
              const v = typeof value === "number" ? value : 0;
              return [
                v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                labels[name as string] || String(name),
              ];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "var(--foreground)" }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="receitas"
            name="Receita"
            fill="#22c55e"
            radius={[6, 6, 0, 0]}
            stackId="receitas"
            isAnimationActive={true}
          />
          <Bar
            dataKey="receitasPrevistas"
            name="Receita (Prevista)"
            fill="#22c55e"
            fillOpacity={0.25}
            radius={[6, 6, 0, 0]}
            stackId="receitas"
            isAnimationActive={true}
          />
          <Bar
            dataKey="despesas"
            name="Despesa"
            fill="#ef4444"
            radius={[6, 6, 0, 0]}
            stackId="despesas"
            isAnimationActive={true}
          />
          <Bar
            dataKey="despesasPrevistas"
            name="Despesa (Prevista)"
            fill="#ef4444"
            fillOpacity={0.25}
            radius={[6, 6, 0, 0]}
            stackId="despesas"
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
