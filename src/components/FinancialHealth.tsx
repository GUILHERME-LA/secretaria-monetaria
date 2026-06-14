"use client";

import { motion } from "framer-motion";
import { HeartPulse, AlertTriangle, Smile, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";

type Props = {
  score: number;
  receitas: number;
  despesas: number;
  recentMonths: { receitas: number; despesas: number }[];
  saldoMedio: number;
};

function calcScore(
  receitas: number,
  despesas: number,
  recentMonths: { receitas: number; despesas: number }[],
  saldoMedio: number
): { score: number; label: string; color: string; icon: typeof HeartPulse } {
  let pontos = 0;

  if (receitas > 0) {
    const proporcao = despesas / receitas;
    if (proporcao <= 0.5) pontos += 30;
    else if (proporcao <= 0.75) pontos += 22;
    else if (proporcao <= 0.9) pontos += 14;
    else pontos += 5;
  }

  if (recentMonths.length >= 3) {
    const ultimos3 = recentMonths.slice(-3);
    const positivos = ultimos3.filter((m) => m.receitas >= m.despesas).length;
    pontos += Math.round((positivos / 3) * 25);
  } else if (recentMonths.length > 0) {
    const positivos = recentMonths.filter((m) => m.receitas >= m.despesas).length;
    pontos += Math.round((positivos / recentMonths.length) * 25);
  }

  const cobertura =
    despesas > 0 && saldoMedio > 0
      ? Math.min(saldoMedio / (despesas / 30), 1)
      : 0;
  pontos += Math.round(cobertura * 25);

  if (receitas > 0 && despesas > 0) {
    const ultimoMes =
      recentMonths.length > 0 ? recentMonths[recentMonths.length - 1] : null;
    if (ultimoMes) {
      const delta =
        ultimoMes.receitas > 0
          ? (ultimoMes.receitas - (receitas - despesas)) / ultimoMes.receitas
          : 0;
      if (delta > 0.1) pontos += 15;
      else if (delta > 0) pontos += 10;
    }
  }

  if (saldoMedio <= 0 && despesas > 0) {
    pontos = Math.min(pontos, 30);
  }

  const final = Math.min(Math.max(pontos, 0), 100);

  if (final >= 70)
    return { score: final, label: "Excelente", color: "#22c55e", icon: Sparkles };
  if (final >= 40)
    return { score: final, label: "Bom", color: "#eab308", icon: Smile };
  return { score: final, label: "Atenção", color: "#ef4444", icon: AlertTriangle };
}

export function FinancialHealth(props: Props) {
  const { score, label, color, icon: Icon } = calcScore(
    props.receitas,
    props.despesas,
    props.recentMonths,
    props.saldoMedio
  );

  const recomendacoes: string[] = [];
  if (props.despesas > props.receitas) {
    recomendacoes.push("Suas despesas superam as receitas. Revise gastos não essenciais.");
  }
  if (props.saldoMedio <= 0) {
    recomendacoes.push("Construa uma reserva de emergência com 3 a 6 meses de gastos.");
  }
  if (
    props.recentMonths.length >= 2 &&
    props.despesas > 0 &&
    props.receitas > 0 &&
    props.despesas / props.receitas > 0.9
  ) {
    recomendacoes.push("Sua margem está apertada. Tente reduzir 10% dos gastos variáveis.");
  }
  if (recomendacoes.length === 0 && score < 70) {
    recomendacoes.push("Mantenha o controle mensal dos gastos para melhorar seu score.");
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
            Saúde Financeira
          </h3>
          <div className="flex items-baseline gap-2">
            <motion.span
              key={score}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="text-3xl font-bold tracking-tight"
              style={{ color }}
            >
              {score}
            </motion.span>
            <span className="text-sm font-medium text-[var(--muted-foreground)]">
              / 100
            </span>
          </div>
          <span
            className="mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${color}15`,
              color,
            }}
          >
            <Icon size={12} />
            {label}
          </span>
        </div>
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="3"
            />
            <motion.circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray={`${score * 0.97} 100`}
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 100" }}
              animate={{ strokeDasharray: `${score * 0.97} 100` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
        </div>
      </div>
      {recomendacoes.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-[var(--border)] pt-3">
          {recomendacoes.slice(0, 2).map((r, i) => (
            <p key={i} className="flex items-start gap-2 text-xs text-[var(--muted-foreground)]">
              <span className="mt-0.5 shrink-0 text-[10px]">•</span>
              {r}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
