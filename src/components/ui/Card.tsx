"use client";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
