"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--muted)]">
        <WifiOff size={40} className="text-[var(--muted-foreground)]" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">
        Sem conexão
      </h1>
      <p className="max-w-sm text-sm text-[var(--muted-foreground)]">
        Você está offline. Verifique sua conexão com a internet e tente novamente.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
      >
        Tentar novamente
      </button>
    </div>
  );
}
