"use client";

import { motion } from "framer-motion";
import { Lightbulb, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Insight } from "@/lib/insights-engine";

type Props = {
  insights: Insight[];
  loading?: boolean;
};

const typeStyles: Record<string, { bg: string; border: string }> = {
  negative: { bg: "bg-red-500/8", border: "border-red-500/20" },
  positive: { bg: "bg-emerald-500/8", border: "border-emerald-500/20" },
  info: { bg: "bg-[var(--accent)]/8", border: "border-[var(--accent)]/20" },
};

function Skeleton() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 px-4 py-3 animate-pulse">
      <div className="mt-0.5 h-5 w-5 rounded bg-[var(--muted)]" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 rounded bg-[var(--muted)]" />
        <div className="h-3 w-2/3 rounded bg-[var(--muted)]" />
      </div>
    </div>
  );
}

export function FinancialInsights({ insights, loading }: Props) {
  if (loading) {
    return (
      <div>
        <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
          Insights
        </h3>
        <div className="flex flex-wrap gap-3">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="Nenhum insight disponível"
        description="Adicione transações para receber análises inteligentes."
      />
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
        Insights
      </h3>
      <div className="flex flex-wrap gap-3">
        {insights.map((item, idx) => {
          const style = typeStyles[item.type] || typeStyles.info;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.2 }}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${style.bg} ${style.border}`}
            >
              <span className="mt-0.5 block text-lg leading-none">{item.icon}</span>
              <div>
                <p className="text-xs font-semibold text-[var(--foreground)]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
