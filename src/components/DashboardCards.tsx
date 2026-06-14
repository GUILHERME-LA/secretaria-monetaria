"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Wallet } from "lucide-react";
import { Card } from "./ui/Card";
import { formatCurrency } from "@/lib/utils";

type Props = {
  receitas: number;
  despesas: number;
  previstoReceitas?: number;
  previstoDespesas?: number;
};

const cardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.25, ease: "easeOut" as const },
  }),
};

export function DashboardCards({ receitas, despesas, previstoReceitas = 0, previstoDespesas = 0 }: Props) {
  const saldo = receitas - despesas;

  const items = [
    {
      icon: <ArrowUp size={22} />,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
      label: "Recebido",
      value: receitas,
      valueColor: "text-green-500",
      previsto: previstoReceitas > 0 ? `+${formatCurrency(previstoReceitas)} previsto` : null,
    },
    {
      icon: <ArrowDown size={22} />,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
      label: "Gasto",
      value: despesas,
      valueColor: "text-red-500",
      previsto: previstoDespesas > 0 ? `+${formatCurrency(previstoDespesas)} previsto` : null,
    },
    {
      icon: <Wallet size={22} />,
      iconBg: "bg-[var(--accent)]/10",
      iconColor: "text-[var(--accent)]",
      label: "Saldo",
      value: saldo,
      valueColor: saldo >= 0 ? "text-green-500" : "text-red-500",
      previsto: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          custom={i}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card>
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg}`}>
                <span className={item.iconColor}>{item.icon}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--muted-foreground)]">
                  {item.label}
                </p>
                <p className={`text-2xl font-bold tracking-tight ${item.valueColor}`}>
                  {formatCurrency(item.value)}
                </p>
                {item.previsto && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {item.previsto}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
