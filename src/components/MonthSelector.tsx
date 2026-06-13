"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthLabel } from "@/lib/utils";

type Props = {
  months: string[];
  value: string;
  onChange: (month: string) => void;
};

export function MonthSelector({ months, value, onChange }: Props) {
  const idx = months.indexOf(value);
  const temAnterior = idx > 0;
  const temProximo = idx < months.length - 1;

  function prev() {
    if (temAnterior) onChange(months[idx - 1]);
  }

  function next() {
    if (temProximo) onChange(months[idx + 1]);
  }

  if (months.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prev}
        disabled={!temAnterior}
        className="cursor-pointer rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={18} />
      </button>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground)] outline-none max-w-[170px] sm:max-w-none truncate"
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {monthLabel(m)}
          </option>
        ))}
      </select>

      <button
        onClick={next}
        disabled={!temProximo}
        className="cursor-pointer rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
