"use client";

import { useState, useCallback, useRef } from "react";
import { parseNubankCsv, type ParsedTransaction } from "@/lib/parse-nubank-csv";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Upload, FileText, ArrowUp, ArrowDown, Check, AlertCircle, Loader2,
  ChevronDown, Plus, Sparkles,
} from "lucide-react";

type ImportResult = {
  importadas: number;
  duplicadas: number;
  erros: number;
  total: number;
};

type CategorizedItem = {
  index: number;
  categoria: string;
  criar: boolean;
  existente: boolean;
};

type CategoryGroup = {
  nome: string;
  criar: boolean;
  transacoes: (ParsedTransaction & { index: number })[];
};

export function CsvImporter() {
  const [parsed, setParsed] = useState<ParsedTransaction[]>([]);
  const [categorized, setCategorized] = useState<CategorizedItem[]>([]);
  const [categorizing, setCategorizing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError("");
    setResult(null);
    setCategorized([]);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const transactions = parseNubankCsv(content);
      if (transactions.length === 0) {
        setError("Nenhuma transação encontrada. Verifique se o arquivo é um CSV válido do Nubank.");
        return;
      }
      setParsed(transactions);
      await categorize(transactions);
    };
    reader.readAsText(file);
  }, []);

  async function categorize(transactions: ParsedTransaction[]) {
    setCategorizing(true);
    setError("");
    try {
      const res = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: transactions.map((t) => ({
            descricao: t.descricao,
            tipo: t.tipo,
          })),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setCategorized(
          transactions.map((_, i) => ({
            index: i,
            categoria: "Outros",
            criar: false,
            existente: false,
          }))
        );
      } else {
        setCategorized(data.data.categorias);
      }
    } catch {
      setCategorized(
        transactions.map((_, i) => ({
          index: i,
          categoria: "Outros",
          criar: false,
          existente: false,
        }))
      );
    } finally {
      setCategorizing(false);
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  function buildGroups(): CategoryGroup[] {
    const map: Record<string, CategoryGroup> = {};
    const groups: CategoryGroup[] = [];

    parsed.forEach((t, i) => {
      const cat = categorized.find((c) => c.index === i);
      const catName = cat?.categoria || "Outros";
      if (!map[catName]) {
        const g: CategoryGroup = {
          nome: catName,
          criar: cat?.criar || false,
          transacoes: [],
        };
        map[catName] = g;
        groups.push(g);
      }
      map[catName].transacoes.push({ ...t, index: i });
    });

    groups.sort((a, b) => b.transacoes.length - a.transacoes.length);
    return groups;
  }

  async function handleImport(createNew: boolean) {
    if (!fileName || parsed.length === 0) return;
    setImporting(true);
    setError("");

    try {
      const withCategories = parsed.map((t, i) => {
        const cat = categorized.find((c) => c.index === i);
        return {
          ...t,
          categoria: cat?.categoria || "Outros",
          criar_categoria: createNew && cat?.criar ? true : false,
        };
      });

      const res = await fetch("/api/importar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: withCategories }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.data);
        setParsed([]);
        setCategorized([]);
      }
    } catch {
      setError("Erro ao importar. Tente novamente.");
    } finally {
      setImporting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
          <Check size={28} className="text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-[var(--foreground)]">
          Importação concluída!
        </h3>
        <div className="mt-3 flex justify-center gap-6 text-sm">
          <div>
            <p className="text-2xl font-bold text-green-500">{result.importadas}</p>
            <p className="text-[var(--muted-foreground)]">importadas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-500">{result.duplicadas}</p>
            <p className="text-[var(--muted-foreground)]">duplicadas</p>
          </div>
          {result.erros > 0 && (
            <div>
              <p className="text-2xl font-bold text-red-500">{result.erros}</p>
              <p className="text-[var(--muted-foreground)]">erros</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setResult(null)}
          className="mt-6 rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-[var(--primary-foreground)]"
        >
          Importar outro arquivo
        </button>
      </div>
    );
  }

  const groups = parsed.length > 0 && categorized.length > 0 ? buildGroups() : [];
  const hasNewCategories = groups.some((g) => g.criar);

  return (
    <div className="flex flex-col gap-6">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--muted)]/20 px-6 py-12 text-center transition-colors hover:border-[var(--accent)] hover:bg-[var(--muted)]/40"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)]">
          <Upload size={24} className="text-[var(--muted-foreground)]" />
        </div>
        <p className="text-sm font-medium text-[var(--foreground)]">
          Arraste o CSV do Nubank aqui
        </p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          ou clique para selecionar
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {parsed.length > 0 && (
        <>
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-[var(--muted-foreground)]" />
            <span className="text-sm text-[var(--foreground)]">
              {fileName} — {parsed.length} transações
            </span>
            {categorizing && (
              <span className="flex items-center gap-1 text-xs text-[var(--accent)]">
                <Sparkles size={12} className="animate-pulse" />
                IA categorizando...
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-[var(--muted)]/30 p-4 text-center">
              <p className="text-2xl font-bold text-[var(--foreground)]">{parsed.length}</p>
              <p className="text-xs text-[var(--muted-foreground)]">total</p>
            </div>
            <div className="rounded-xl bg-green-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-green-500">
                {parsed.filter((t) => t.tipo === "receita").length}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">receitas</p>
            </div>
            <div className="rounded-xl bg-red-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-red-500">
                {parsed.filter((t) => t.tipo === "despesa").length}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">despesas</p>
            </div>
          </div>

          {groups.length > 0 && (
            <div className="max-h-96 overflow-y-auto rounded-xl border border-[var(--border)]">
              <div className="flex flex-col">
                {groups.map((g) => (
                  <GroupRow key={g.nome} group={g} />
                ))}
              </div>
            </div>
          )}

          {categorizing ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-[var(--muted)]/30 px-6 py-4 text-sm text-[var(--muted-foreground)]">
              <Loader2 size={16} className="animate-spin" />
              Analisando transações com IA...
            </div>
          ) : hasNewCategories ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleImport(true)}
                disabled={importing}
                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {importing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {importing ? "Importando..." : "Criar categorias novas e importar"}
              </button>
              <button
                onClick={() => handleImport(false)}
                disabled={importing}
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
              >
                Importar sem criar (ir para "Outros")
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleImport(false)}
              disabled={importing}
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {importing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Importando...
                </>
              ) : (
                "Confirmar importação"
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function GroupRow({ group }: { group: CategoryGroup }) {
  const [expanded, setExpanded] = useState(false);
  const total = group.transacoes.reduce((s, t) => s + t.valor, 0);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full cursor-pointer items-center gap-3 border-b border-[var(--border)] px-4 py-3 text-left transition-colors hover:bg-[var(--muted)]/50"
      >
        <span className="min-w-0 flex-1 text-sm font-medium text-[var(--foreground)]">
          {group.nome}
          {group.criar && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-medium" style={{ color: "var(--accent)" }}>
              <Plus size={10} />
              NOVA
            </span>
          )}
        </span>
        <span className="shrink-0 text-xs text-[var(--muted-foreground)]">
          {group.transacoes.length}
        </span>
        <span className="shrink-0 text-sm font-semibold text-[var(--foreground)]">
          {formatCurrency(total)}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="border-b border-[var(--border)] bg-[var(--muted)]/10">
          {group.transacoes.map((t) => (
            <div
              key={t.index}
              className="flex items-center justify-between border-b border-[var(--border)]/50 px-4 py-2 pl-10 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-md ${
                    t.tipo === "receita" ? "bg-green-500/10" : "bg-red-500/10"
                  }`}
                >
                  {t.tipo === "receita" ? (
                    <ArrowUp size={11} className="text-green-500" />
                  ) : (
                    <ArrowDown size={11} className="text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-[var(--foreground)]">{t.descricao}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{formatDate(t.date)}</p>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${
                  t.tipo === "receita" ? "text-green-500" : "text-red-500"
                }`}
              >
                -{formatCurrency(t.valor)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
