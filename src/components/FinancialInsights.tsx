"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Insight } from "@/lib/insights-engine";

type Props = {
  insights: Insight[];
};

export function FinancialInsights({ insights }: Props) {
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
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
        Insights
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {insights.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.2 }}
            className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3"
          >
            <span className="block text-lg leading-none">{item.icon}</span>
            <p className="mt-1.5 text-xs font-semibold text-[var(--foreground)]">
              {item.title}
            </p>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
