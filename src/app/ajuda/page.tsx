"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, ChevronUp, MessageCircle, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/Card";

const STORAGE_KEY = "secretaria_tutorial_visto";

type FAQItem = {
  titulo: string;
  categoria: string;
  link?: string;
  linkLabel?: string;
  conteudo: React.ReactNode;
};

const faq: FAQItem[] = [
  {
    categoria: "Dashboard",
    titulo: "Dashboard",
    link: "/dashboard",
    linkLabel: "Ir para Dashboard",
    conteudo: (
      <ul className="flex list-inside flex-col gap-2 text-sm text-[var(--muted-foreground)]">
        <li><strong className="text-[var(--foreground)]">Cards:</strong> Mostram Recebido, Gasto e Saldo do mês. Se houver valores previstos, aparecem abaixo em cinza.</li>
        <li><strong className="text-[var(--foreground)]">Seletor de meses:</strong> Navegue entre meses com dados. Meses passados sem transações ficam ocultos.</li>
        <li><strong className="text-[var(--foreground)]">Toggle "Mostrar previstos":</strong> Quando ativo, valores futuros (pendentes) aparecem nos cards, gráficos e ranking.</li>
      </ul>
    ),
  },
  {
    categoria: "Transações",
    titulo: "Adicionar Transação",
    link: "/dashboard",
    linkLabel: "Nova Transação",
    conteudo: (
      <ul className="flex list-inside flex-col gap-2 text-sm text-[var(--muted-foreground)]">
        <li>Clique em <strong className="text-[var(--foreground)]">"Nova Transação"</strong> no topo da dashboard.</li>
        <li>Escolha <strong className="text-[var(--foreground)]">Receita</strong> (dinheiro que entra) ou <strong className="text-[var(--foreground)]">Despesa</strong> (dinheiro que sai).</li>
        <li>Selecione a <strong className="text-[var(--foreground)]">categoria</strong>, preencha descrição, valor e data.</li>
        <li>Se a data for em um mês <strong className="text-[var(--foreground)]">futuro</strong>, a transação será salva como <strong className="text-yellow-500">"Previsto"</strong>.</li>
        <li>Para <strong className="text-[var(--foreground)]">editar</strong>, clique no ícone de lápis ao lado da transação.</li>
        <li>Para <strong className="text-[var(--foreground)]">excluir</strong>, clique no ícone de lixeira.</li>
      </ul>
    ),
  },
  {
    categoria: "Transações",
    titulo: "Transações Previstas",
    conteudo: (
      <ul className="flex list-inside flex-col gap-2 text-sm text-[var(--muted-foreground)]">
        <li>São transações com data futura ou criadas automaticamente por contas recorrentes.</li>
        <li>Aparecem na lista com <strong className="text-[var(--foreground)]">borda tracejada</strong> e badge <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] text-yellow-500 font-medium">Previsto</span>.</li>
        <li>Quando você pagar/receber o valor, clique no <strong className="text-green-500">✓</strong> verde para confirmar.</li>
        <li>Após confirmada, a transação vira <strong className="text-[var(--foreground)]">"Realizada"</strong> e entra nos totais reais.</li>
      </ul>
    ),
  },
  {
    categoria: "Recorrentes",
    titulo: "Contas Recorrentes",
    link: "/recorrentes",
    linkLabel: "Gerenciar Recorrências",
    conteudo: (
      <ul className="flex list-inside flex-col gap-2 text-sm text-[var(--muted-foreground)]">
        <li>Acesse pelo ícone <strong className="text-[var(--foreground)]">🔄</strong> no Header ou pela página <strong className="text-[var(--foreground)]">/recorrentes</strong>.</li>
        <li>Clique em <strong className="text-[var(--foreground)]">"Nova"</strong> para criar: defina tipo, categoria, descrição, valor e dia de vencimento.</li>
        <li>Ao entrar na dashboard do mês atual, o sistema <strong className="text-[var(--foreground)]">auto-cria</strong> as contas ativas como "Previsto".</li>
        <li>Use o toggle para <strong className="text-[var(--foreground)]">ativar/desativar</strong> sem excluir a recorrência.</li>
      </ul>
    ),
  },
  {
    categoria: "Gráficos",
    titulo: "Gráficos",
    conteudo: (
      <ul className="flex list-inside flex-col gap-2 text-sm text-[var(--muted-foreground)]">
        <li><strong className="text-[var(--foreground)]">Gastos por Categoria (Pizza):</strong> Distribuição dos gastos do mês selecionado.</li>
        <li><strong className="text-[var(--foreground)]">Top Categorias (Ranking):</strong> As 5 categorias com maior gasto, ordenadas.</li>
        <li><strong className="text-[var(--foreground)]">Comparativo Mensal:</strong> Evolução dos últimos meses. Barras sólidas = realizado, barras transparentes = previsto.</li>
        <li>Use o toggle <strong className="text-[var(--foreground)]">"Mostrar previstos"</strong> para incluir ou remover valores futuros dos gráficos.</li>
      </ul>
    ),
  },
  {
    categoria: "Recorrentes",
    titulo: "Metas Financeiras",
    link: "/metas",
    linkLabel: "Gerenciar Metas",
    conteudo: (
      <ul className="flex list-inside flex-col gap-2 text-sm text-[var(--muted-foreground)]">
        <li>Acesse pela página <strong className="text-[var(--foreground)]">/metas</strong> ou pelo link no Header.</li>
        <li>Defina um <strong className="text-[var(--foreground)]">título</strong>, <strong className="text-[var(--foreground)]">valor objetivo</strong> e uma <strong className="text-[var(--foreground)]">cor</strong> para identificar.</li>
        <li>Acompanhe o progresso com a <strong className="text-[var(--foreground)]">barra percentual</strong> em cada meta.</li>
        <li>Adicione valores conforme economiza para ver o progresso aumentar.</li>
        <li>Metas são salvas no navegador (localStorage).</li>
      </ul>
    ),
  },
  {
    categoria: "Recorrentes",
    titulo: "Relatórios",
    link: "/relatorios",
    linkLabel: "Acessar Relatórios",
    conteudo: (
      <ul className="flex list-inside flex-col gap-2 text-sm text-[var(--muted-foreground)]">
        <li>Acesse pela página <strong className="text-[var(--foreground)]">/relatorios</strong> ou pelo link no Header.</li>
        <li>Selecione o <strong className="text-[var(--foreground)]">mês</strong> desejado para ver o resumo financeiro.</li>
        <li>Exporte em <strong className="text-[var(--foreground)]">PDF</strong> ou <strong className="text-[var(--foreground)]">Excel</strong> com um clique.</li>
        <li>Os relatórios incluem totais, gráficos e lista detalhada de transações.</li>
      </ul>
    ),
  },
  {
    categoria: "Chat IA",
    titulo: "Chat IA",
    conteudo: (
      <ul className="flex list-inside flex-col gap-2 text-sm text-[var(--muted-foreground)]">
        <li>Clique no botão <strong className="text-[var(--foreground)]">💬</strong> no canto inferior direito para abrir o chat.</li>
        <li>Descreva a transação do seu jeito: <em className="text-[var(--foreground)]">"comprei um sorvete de 10 reais"</em>, <em className="text-[var(--foreground)]">"recebi 3000 de salário"</em>.</li>
        <li>A IA tenta entender: tipo, valor, categoria, descrição e data.</li>
        <li>Revise o que ela entendeu e clique em <strong className="text-[var(--foreground)]">"Adicionar"</strong> para salvar.</li>
        <li>Se a data for futura, a transação será salva como <strong className="text-yellow-500">"Previsto"</strong>.</li>
      </ul>
    ),
  },
  {
    categoria: "Configurações",
    titulo: "Configurações",
    link: "/settings",
    linkLabel: "Abrir Configurações",
    conteudo: (
      <ul className="flex list-inside flex-col gap-2 text-sm text-[var(--muted-foreground)]">
        <li>Acesse pelo ícone de engrenagem no Header.</li>
        <li><strong className="text-[var(--foreground)]">Alterar email:</strong> Digite o novo email e clique em "Alterar email". Um link de confirmação será enviado.</li>
        <li><strong className="text-[var(--foreground)]">Alterar senha:</strong> Informe a senha atual, a nova senha e confirme. A senha deve ter no mínimo 6 caracteres.</li>
      </ul>
    ),
  },
];

const CATEGORIAS = [
  { key: "Dashboard", label: "Dashboard", icon: "📊" },
  { key: "Transações", label: "Transações", icon: "💳" },
  { key: "Recorrentes", label: "Recorrentes e Metas", icon: "🔄" },
  { key: "Gráficos", label: "Gráficos", icon: "📈" },
  { key: "Chat IA", label: "Chat IA", icon: "🤖" },
  { key: "Configurações", label: "Configurações", icon: "⚙️" },
];

export default function AjudaPage() {
  const router = useRouter();
  const [aberto, setAberto] = useState<number | null>(0);
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    let items = faq;
    if (categoriaAtiva) {
      items = items.filter((item) => item.categoria === categoriaAtiva);
    }
    if (busca.trim()) {
      const q = busca.toLowerCase();
      items = items.filter(
        (item) =>
          item.titulo.toLowerCase().includes(q) ||
          item.categoria.toLowerCase().includes(q)
      );
    }
    return items;
  }, [busca, categoriaAtiva]);

  function resetarTutorial() {
    localStorage.removeItem(STORAGE_KEY);
    router.push("/dashboard");
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Ajuda</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Tire suas dúvidas sobre como usar a Secretaria Monetária.
          </p>
        </div>

        <div className="relative mb-6">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          />
          <input
            type="text"
            placeholder="Buscar na ajuda..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-9 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setCategoriaAtiva(null)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              categoriaAtiva === null
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Todas
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.key}
              onClick={() =>
                setCategoriaAtiva(cat.key === categoriaAtiva ? null : cat.key)
              }
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                categoriaAtiva === cat.key
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {filtrados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              Nenhum resultado encontrado para "{busca}".
            </p>
            <button
              onClick={() => { setBusca(""); setCategoriaAtiva(null); }}
              className="mt-3 cursor-pointer text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtrados.map((item, idx) => {
              const realIdx = faq.indexOf(item);
              return (
                <Card key={realIdx} className="p-0">
                  <button
                    onClick={() =>
                      setAberto(aberto === realIdx ? null : realIdx)
                    }
                    className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left"
                  >
                    <span className="text-sm font-semibold text-[var(--foreground)]">
                      {item.titulo}
                    </span>
                    {aberto === realIdx ? (
                      <ChevronUp
                        size={18}
                        className="shrink-0 text-[var(--muted-foreground)]"
                      />
                    ) : (
                      <ChevronDown
                        size={18}
                        className="shrink-0 text-[var(--muted-foreground)]"
                      />
                    )}
                  </button>
                  {aberto === realIdx && (
                    <div className="border-t border-[var(--border)] px-4 py-3">
                      {item.conteudo}
                      {item.link && (
                        <button
                          onClick={() => router.push(item.link!)}
                          className="mt-3 flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline"
                        >
                          <ExternalLink size={12} />
                          {item.linkLabel || "Acessar"}
                        </button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 rounded-xl border border-dashed border-[var(--border)] p-6 text-center">
          <p className="mb-2 text-sm text-[var(--muted-foreground)]">
            Quer ver o tutorial de boas-vindas novamente?
          </p>
          <button
            onClick={resetarTutorial}
            className="cursor-pointer rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Ver tutorial novamente
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10">
              <MessageCircle size={16} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Precisa de mais ajuda?
              </p>
              <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                Use o chat IA no canto inferior direito da dashboard para
                descrever sua dúvida. O assistente pode ajudar com transações,
                relatórios e qualquer funcionalidade do sistema.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
