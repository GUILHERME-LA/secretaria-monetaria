"use client";

import { ArrowDown, ArrowUp, Wallet } from "lucide-react";
import { Card } from "./ui/Card";
import { formatCurrency } from "@/lib/utils";

type Props = {
  receitas: number;
  despesas: number;
};

export function DashboardCards({ receitas, despesas }: Props) {
  const saldo = receitas - despesas;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
            <ArrowUp size={20} className="text-green-500" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Recebido</p>
            <p className="text-lg font-bold text-green-500">
              {formatCurrency(receitas)}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
            <ArrowDown size={20} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Gasto</p>
            <p className="text-lg font-bold text-red-500">
              {formatCurrency(despesas)}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10">
            <Wallet size={20} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Saldo</p>
            <p
              className={`text-lg font-bold ${
                saldo >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {formatCurrency(saldo)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
