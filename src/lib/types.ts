export interface Categoria {
  id: string;
  user_id: string;
  nome: string;
  tipo: "receita" | "despesa";
  cor: string;
  created_at: string;
}

export interface Transacao {
  id: string;
  user_id: string;
  categoria_id: string;
  tipo: "receita" | "despesa";
  descricao: string;
  valor: number;
  data: string;
  created_at: string;
  categoria_nome?: string;
  categoria_cor?: string;
}

export interface TransacaoFormData {
  tipo: "receita" | "despesa";
  categoria_id: string;
  descricao: string;
  valor: string;
  data: string;
}

export interface DashboardData {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  despesasPorCategoria: { nome: string; cor: string; valor: number }[];
  topCategorias: { nome: string; cor: string; valor: number }[];
  comparativoMensal: { mes: string; receitas: number; despesas: number }[];
}
