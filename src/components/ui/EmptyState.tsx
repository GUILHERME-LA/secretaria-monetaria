"use client";

import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--muted)]">
          <Icon size={24} className="text-[var(--muted-foreground)]" />
        </div>
        <p className="mb-1 text-sm font-semibold text-[var(--foreground)]">
          {title}
        </p>
        <p className="mb-4 max-w-xs text-sm text-[var(--muted-foreground)]">
          {description}
        </p>
        {action && (
          <button
            onClick={action.onClick}
            className="cursor-pointer rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            {action.label}
          </button>
        )}
      </div>
    </Card>
  );
}
