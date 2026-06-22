"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Wallet, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "./ui/Card";
import { SparklineChart } from "./SparklineChart";
import { formatCurrency } from "@/lib/utils";

type Props = {
  receitas: number;
  despesas: number;
  previstoReceitas?: number;
  previstoDespesas?: number;
  variacaoReceitas?: number | null;
  variacaoDespesas?: number | null;
  sparklineReceitas?: number[];
  sparklineDespesas?: number[];
};

export function DashboardCards({ receitas, despesas, previstoReceitas = 0, previstoDespesas = 0, variacaoReceitas, variacaoDespesas, sparklineReceitas, sparklineDespesas }: Props) {
  const saldo = receitas - despesas;

  function TrendBadge({ value, good }: { value: number; good: "up" | "down" }) {
    const isUp = value > 0;
    const isGood = good === "up" ? isUp : !isUp;
    const Icon = value === 0 ? Minus : isUp ? TrendingUp : TrendingDown;
    return (
      <span className={`inline-flex items-center gap-1 text-xs ${value === 0 ? "text-[var(--muted-foreground)]" : isGood ? "text-emerald-500" : "text-red-500"}`}>
        <Icon size={12} />
        {Math.abs(value)}%
      </span>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="lg:col-span-2"
      >
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-[var(--accent)]/5 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5">
              <Wallet size={30} style={{ color: "var(--accent)" }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">Saldo do período</p>
              <p className={`text-4xl font-bold tracking-tight sm:text-5xl ${saldo >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {formatCurrency(saldo)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {receitas > 0 || despesas > 0
                  ? saldo >= 0
                    ? "Receitas superam despesas este mês"
                    : "Despesas superam receitas este mês"
                  : "Nenhuma transação registrada"}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="flex flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.25, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
        >
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <ArrowUp size={20} className="text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-[var(--muted-foreground)]">Recebido</p>
                <p className="text-xl font-bold tracking-tight text-emerald-500">
                  {formatCurrency(receitas)}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  {variacaoReceitas !== null && variacaoReceitas !== undefined && (
                    <TrendBadge value={variacaoReceitas} good="up" />
                  )}
                  {variacaoReceitas !== null && variacaoReceitas !== undefined && (
                    <span className="text-xs text-[var(--muted-foreground)]">vs mês anterior</span>
                  )}
                  {previstoReceitas > 0 && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      +{formatCurrency(previstoReceitas)} previsto
                    </span>
                  )}
                </div>
                {sparklineReceitas && sparklineReceitas.length >= 2 && (
                  <div className="mt-2">
                    <SparklineChart data={sparklineReceitas} color="#10B981" />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
        >
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <ArrowDown size={20} className="text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-[var(--muted-foreground)]">Gasto</p>
                <p className="text-xl font-bold tracking-tight text-red-500">
                  {formatCurrency(despesas)}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  {variacaoDespesas !== null && variacaoDespesas !== undefined && (
                    <TrendBadge value={variacaoDespesas} good="down" />
                  )}
                  {variacaoDespesas !== null && variacaoDespesas !== undefined && (
                    <span className="text-xs text-[var(--muted-foreground)]">vs mês anterior</span>
                  )}
                  {previstoDespesas > 0 && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      +{formatCurrency(previstoDespesas)} previsto
                    </span>
                  )}
                </div>
                {sparklineDespesas && sparklineDespesas.length >= 2 && (
                  <div className="mt-2">
                    <SparklineChart data={sparklineDespesas} color="#ef4444" />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
