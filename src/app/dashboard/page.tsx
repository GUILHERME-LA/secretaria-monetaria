"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase-client";
import {
  getCurrentMonth,
  getMonthBounds,
  getLast6Months,
  monthLabel,
} from "@/lib/utils";
import { Header } from "@/components/Header";
import { DashboardCards } from "@/components/DashboardCards";
import { MonthSelector } from "@/components/MonthSelector";
import { NewTransactionButton } from "@/components/NewTransactionButton";
import { ExpensePieChart } from "@/components/ExpensePieChart";
import { ExpenseRanking } from "@/components/ExpenseRanking";
import { MonthlyBarChart } from "@/components/MonthlyBarChart";
import { TransactionList } from "@/components/TransactionList";
import { ChatFab } from "@/components/ChatFab";
import { seedDefaultCategories } from "@/lib/seed-categories";

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [month, setMonth] = useState(getCurrentMonth());
  const [refreshKey, setRefreshKey] = useState(0);

  const [receitas, setReceitas] = useState(0);
  const [despesas, setDespesas] = useState(0);
  const [pieData, setPieData] = useState<
    { nome: string; cor: string; valor: number }[]
  >([]);
  const [rankingData, setRankingData] = useState<
    { nome: string; cor: string; valor: number }[]
  >([]);
  const [comparativo, setComparativo] = useState<
    { mes: string; receitas: number; despesas: number }[]
  >([]);

  const loadDashboard = useCallback(async () => {
    const { inicio, fim } = getMonthBounds(month);

    const { data: transacoes } = await supabase
      .from("sm_transacoes")
      .select("*, categorias(nome, cor)")
      .gte("data", inicio)
      .lte("data", fim);

    if (!transacoes) return;

    const totalReceitas = transacoes
      .filter((t: any) => t.tipo === "receita")
      .reduce((s: number, t: any) => s + Number(t.valor), 0);
    const totalDespesas = transacoes
      .filter((t: any) => t.tipo === "despesa")
      .reduce((s: number, t: any) => s + Number(t.valor), 0);

    setReceitas(totalReceitas);
    setDespesas(totalDespesas);

    const agg: Record<string, { nome: string; cor: string; valor: number }> =
      {};
    transacoes
      .filter((t: any) => t.tipo === "despesa")
      .forEach((t: any) => {
        const key = t.categorias?.nome || "Sem categoria";
        if (!agg[key]) {
          agg[key] = {
            nome: key,
            cor: t.categorias?.cor || "#6366f1",
            valor: 0,
          };
        }
        agg[key].valor += Number(t.valor);
      });

    const sorted = Object.values(agg).sort((a, b) => b.valor - a.valor);
    setPieData(sorted);
    setRankingData(sorted.slice(0, 5));
  }, [month, supabase]);

  const loadComparativo = useCallback(async () => {
    const meses = getLast6Months(month);
    const resultado: { mes: string; receitas: number; despesas: number }[] = [];

    for (const m of meses) {
      const { inicio, fim } = getMonthBounds(m);

      const { data } = await supabase
        .from("sm_transacoes")
        .select("tipo, valor")
        .gte("data", inicio)
        .lte("data", fim);

      const receitas = (data || [])
        .filter((t: any) => t.tipo === "receita")
        .reduce((s: number, t: any) => s + Number(t.valor), 0);
      const despesas = (data || [])
        .filter((t: any) => t.tipo === "despesa")
        .reduce((s: number, t: any) => s + Number(t.valor), 0);

      resultado.push({ mes: monthLabel(m).split(" ")[0], receitas, despesas });
    }

    setComparativo(resultado);
  }, [month, supabase]);

  useEffect(() => {
    seedDefaultCategories();
  }, []);

  useEffect(() => {
    loadDashboard();
    loadComparativo();
  }, [loadDashboard, loadComparativo, refreshKey]);

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <MonthSelector value={month} onChange={setMonth} />
          <NewTransactionButton onDone={handleRefresh} />
        </div>

        <div className="mb-6">
          <DashboardCards receitas={receitas} despesas={despesas} />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ExpensePieChart data={pieData} />
          <ExpenseRanking data={rankingData} />
        </div>

        <div className="mb-6">
          <MonthlyBarChart data={comparativo} />
        </div>

        <TransactionList month={month} refreshKey={refreshKey} />
      </main>

      <ChatFab onDone={handleRefresh} />
    </>
  );
}
