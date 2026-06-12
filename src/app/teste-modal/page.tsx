"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

export default function TesteModalPage() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  function addLog(msg: string) {
    console.log("[teste-modal]", msg);
    setLog((prev) => [...prev, `${new Date().toISOString().slice(11, 19)} ${msg}`]);
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-xl font-bold">Teste Modal</h1>

      <div className="flex gap-2">
        <button
          onClick={() => {
            addLog("clicou abrir");
            setOpen(true);
          }}
          className="cursor-pointer rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
        >
          Abrir Modal
        </button>
        <button
          onClick={() => {
            addLog("clicou forcar toggle");
            setOpen((v) => !v);
          }}
          className="cursor-pointer rounded-lg bg-[var(--muted)] px-4 py-2 text-sm font-medium"
        >
          Toggle
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => {
          addLog("onClose chamado");
          setOpen(false);
        }}
        title="Modal de Teste"
      >
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          Este modal não tem formulário nem query. Se travar aqui, o problema
          está no componente Modal.
        </p>
        <button
          onClick={() => {
            addLog("clicou fechar interno");
            setOpen(false);
          }}
          className="cursor-pointer rounded-lg bg-[var(--destructive)] px-4 py-2 text-sm font-medium text-white"
        >
          Fechar
        </button>
      </Modal>

      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="mb-2 font-semibold">Log</h2>
        <div className="flex max-h-60 flex-col gap-1 overflow-auto font-mono text-xs">
          {log.length === 0 && (
            <span className="text-[var(--muted-foreground)]">
              Nenhum evento ainda.
            </span>
          )}
          {log.map((entry, i) => (
            <span key={i}>{entry}</span>
          ))}
        </div>
      </div>
    </main>
  );
}
