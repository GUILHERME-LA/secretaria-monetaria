"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Auditoria } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2, ChevronDown, ChevronUp, History, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Agora mesmo";
  if (mins < 60) return `Há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Há ${days}d`;
  return formatDate(dateStr);
}

export default function AuditoriaPage() {
  const router = useRouter();
  const [registros, setRegistros] = useState<
    (Auditoria & { transacao_descricao?: string })[]
  >([]);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "alteracao" | "exclusao">("todas");

  useEffect(() => {
    fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "listar_auditoria", payload: {} }),
    })
      .then((r) => r.json())
      .then(({ data }: { data: any[] | null }) => {
        if (data) {
          setRegistros(
            data.map((r: any) => ({
              ...r,
              transacao_descricao:
                r.dados_anteriores?.descricao ||
                r.dados_novos?.descricao ||
                "(desconhecido)",
            }))
          );
        }
      });
  }, []);

  const filtrados =
    filtro === "todas"
      ? registros
      : registros.filter((r) => r.acao === filtro);

  const alteracoes = registros.filter((r) => r.acao === "alteracao");
  const exclusoes = registros.filter((r) => r.acao === "exclusao");
  const ultimoRegistro = registros.length > 0 ? registros[0] : null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Histórico de Alterações
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Todas as alterações e exclusões feitas nas suas transações, com
            auditoria completa.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <p className="text-xs font-medium text-[var(--muted-foreground)]">
                Total de alterações
              </p>
              <p className="mt-1 text-2xl font-bold text-yellow-500">
                {alteracoes.length}
              </p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.2 }}
          >
            <Card>
              <p className="text-xs font-medium text-[var(--muted-foreground)]">
                Total de exclusões
              </p>
              <p className="mt-1 text-2xl font-bold text-red-500">
                {exclusoes.length}
              </p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            <Card>
              <p className="text-xs font-medium text-[var(--muted-foreground)]">
                Última alteração
              </p>
              {ultimoRegistro ? (
                <>
                  <p className="mt-1 text-lg font-bold text-[var(--foreground)] truncate">
                    {ultimoRegistro.transacao_descricao}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    {timeAgo(ultimoRegistro.created_at)}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-lg font-bold text-[var(--muted-foreground)]">
                    Nenhuma
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    Nenhuma alteração registrada
                  </p>
                </>
              )}
            </Card>
          </motion.div>
        </div>

        {registros.length > 0 && (
          <div className="mb-6 flex gap-2">
            {(["todas", "alteracao", "exclusao"] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filtro === tipo
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {tipo === "todas"
                  ? "Todas"
                  : tipo === "alteracao"
                  ? "Alterações"
                  : "Exclusões"}
              </button>
            ))}
          </div>
        )}

        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] px-6 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
              <History size={32} className="text-[var(--muted-foreground)]" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-[var(--foreground)]">
              Nenhum registro de auditoria
            </h2>
            <p className="mb-6 max-w-md text-sm text-[var(--muted-foreground)]">
              O histórico de alterações garante transparência total sobre
              qualquer modificação feita nas suas transações financeiras.
              Alterações e exclusões aparecem aqui automaticamente.
            </p>
            <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-4">
              {[
                ["1", "Registre transações"],
                ["2", "Edite quando necessário"],
                ["3", "Justifique alterações"],
                ["4", "Auditoria automática"],
              ].map(([num, text]) => (
                <div
                  key={num}
                  className="flex items-center gap-2 rounded-xl bg-[var(--muted)]/50 px-4 py-3 text-sm"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                    {num}
                  </span>
                  <span className="text-[var(--foreground)]">{text}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => router.push("/dashboard")}>
              Ir para Dashboard
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtrados.map((r, idx) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02, duration: 0.15 }}
              >
                <Card className="p-0">
                  <button
                    onClick={() =>
                      setExpandido(expandido === r.id ? null : r.id)
                    }
                    className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
                        {r.acao === "alteracao" ? (
                          <Pencil size={14} className="text-yellow-500" />
                        ) : (
                          <Trash2 size={14} className="text-red-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--foreground)]">
                          {r.transacao_descricao}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          <span
                            className={
                              r.acao === "alteracao"
                                ? "text-yellow-500"
                                : "text-red-500"
                            }
                          >
                            {r.acao === "alteracao" ? "Alteração" : "Exclusão"}
                          </span>
                          {" · "}
                          {timeAgo(r.created_at)}
                        </p>
                      </div>
                    </div>
                    {expandido === r.id ? (
                      <ChevronUp
                        size={18}
                        className="shrink-0 text-[var(--muted-foreground)]"
                      />
                    ) : (
                      <ChevronDown
                        size={18}
                        className="shrink-0 text-[var(--muted-foreground)]"
                      />
                    )}
                  </button>

                  {expandido === r.id && (
                    <div className="border-t border-[var(--border)] px-4 py-3">
                      <div className="mb-3 rounded-lg bg-[var(--muted)]/50 p-3 text-xs">
                        <p className="font-medium text-[var(--foreground)]">
                          Justificativa
                        </p>
                        <p className="mt-0.5 text-[var(--muted-foreground)]">
                          {r.justificativa || "Nenhuma justificativa fornecida"}
                        </p>
                      </div>

                      {r.dados_anteriores && (
                        <div className="mb-2">
                          <p className="mb-1 text-xs font-medium text-[var(--muted-foreground)]">
                            Valores anteriores
                          </p>
                          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-xs text-[var(--muted-foreground)]">
                            <p className="font-medium text-[var(--foreground)]">
                              {r.dados_anteriores.descricao}
                            </p>
                            <p>{formatCurrency(Number(r.dados_anteriores.valor))}</p>
                            <p className="capitalize">
                              {r.dados_anteriores.tipo} ·{" "}
                              {r.dados_anteriores.data}
                            </p>
                          </div>
                        </div>
                      )}

                      {r.dados_novos && (
                        <div>
                          <p className="mb-1 text-xs font-medium text-[var(--muted-foreground)]">
                            Novos valores
                          </p>
                          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-2 text-xs text-[var(--muted-foreground)]">
                            <p className="font-medium text-[var(--foreground)]">
                              {r.dados_novos.descricao}
                            </p>
                            <p>{formatCurrency(Number(r.dados_novos.valor))}</p>
                            <p className="capitalize">
                              {r.dados_novos.tipo} · {r.dados_novos.data}
                            </p>
                          </div>
                        </div>
                      )}

                      {r.dados_anteriores && r.dados_novos && (
                        <div className="mt-3 rounded-lg bg-[var(--muted)]/30 p-2 text-xs">
                          <p className="font-medium text-[var(--foreground)]">Diferença</p>
                          <p className="text-[var(--muted-foreground)]">
                            {formatCurrency(
                              Number(r.dados_novos.valor) - Number(r.dados_anteriores.valor)
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {registros.length > 0 && (
          <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                <Clock size={16} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Histótico mantido automaticamente
                </p>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  Toda alteração ou exclusão de transação é registrada com
                  justificativa, valores anteriores e novos, garantindo total
                  rastreabilidade dos seus dados financeiros.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
