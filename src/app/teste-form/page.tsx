"use client";

import { useState } from "react";
import { TransactionForm } from "@/components/TransactionForm";
import { Button } from "@/components/ui/Button";

export default function TesteFormPage() {
  const [showForm, setShowForm] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [formKey, setFormKey] = useState(0);

  function addLog(msg: string) {
    console.log("[teste-form]", msg);
    setLog((prev) => [...prev, `${new Date().toISOString().slice(11, 19)} ${msg}`]);
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-bold">Teste Form (sem Modal)</h1>

      <Button onClick={() => {
        addLog("montando form...");
        setShowForm(true);
        setFormKey((k) => k + 1);
      }}>
        Montar formulário
      </Button>

      {showForm && (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <TransactionForm
            key={formKey}
            onDone={() => {
              addLog("onDone chamado");
              setShowForm(false);
            }}
          />
          <div className="mt-3">
            <Button
              variant="ghost"
              onClick={() => {
                addLog("desmontando form");
                setShowForm(false);
              }}
            >
              Desmontar
            </Button>
          </div>
        </div>
      )}

      {!showForm && (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">
          Clique em &quot;Montar formulário&quot; para renderizar o form inline
          (sem modal).
        </p>
      )}

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
