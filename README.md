# ✦ Secretaria Monetária

Aplicativo web de controle financeiro pessoal. Registre gastos e receitas, veja onde seu dinheiro está indo com gráficos e relatórios mensais.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** — tema escuro/claro
- **Supabase** — autenticação (email/senha) + banco de dados
- **Recharts** — gráficos de rosca e barras
- **Lucide React** — ícones

## Pré-requisitos

- Node.js 18+
- Conta gratuita no [Supabase](https://supabase.com)

## Passo a passo para rodar localmente

### 1. Configurar o Supabase

1. Crie um projeto no [Supabase Dashboard](https://supabase.com/dashboard).
2. Vá em **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e execute.
   - Isso cria as tabelas `categorias` e `transacoes`, ativa RLS, e configura o trigger que cria categorias padrão para cada novo usuário.
3. Vá em **Project Settings → API** e copie a **Project URL** e a **anon key**.

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com as credenciais do seu Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 3. Instalar dependências e rodar

```bash
npm install
npm run dev
```

O app estará em [http://localhost:3000](http://localhost:3000).

## Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx           # Root layout com ThemeProvider
│   ├── page.tsx             # Redirect para /dashboard
│   ├── globals.css          # Tailwind + variáveis CSS
│   ├── login/page.tsx       # Login
│   ├── register/page.tsx    # Cadastro
│   └── dashboard/page.tsx   # Dashboard principal
├── components/
│   ├── ui/                  # Button, Input, Card, Select, Modal
│   ├── Header.tsx           # Top bar com theme toggle + logout
│   ├── ThemeProvider.tsx    # Context de tema escuro/claro
│   ├── ThemeToggle.tsx      # Botão de alternar tema
│   ├── DashboardCards.tsx   # Cards: recebido, gasto, saldo
│   ├── MonthSelector.tsx    # Navegação entre meses
│   ├── NewTransactionButton.tsx
│   ├── TransactionForm.tsx  # Modal de lançar/editar transação
│   ├── TransactionList.tsx  # Lista de transações do mês
│   ├── CategorySelect.tsx   # Select de categoria + criar nova
│   ├── ExpensePieChart.tsx  # Gráfico de rosca (Recharts)
│   ├── ExpenseRanking.tsx   # Top 5 categorias do mês
│   └── MonthlyBarChart.tsx  # Barras comparativas 6 meses
├── lib/
│   ├── supabase.ts          # Client e server Supabase helpers
│   ├── types.ts             # Interfaces TypeScript
│   └── utils.ts             # Formatadores pt-BR
└── middleware.ts            # Proteção de rotas com Supabase SSR
```

## Funcionalidades

- Login/cadastro com email e senha
- Lançamento rápido de receitas e despesas
- Categorias personalizadas (criar na hora)
- Dashboard mensal com cards, gráfico de rosca, ranking e comparativo 6 meses
- Editar e excluir transações
- Alternar entre meses
- Tema escuro/claro
- Responsivo (funciona no celular)
