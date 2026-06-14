export type Insight = {
  id: string;
  type: "positive" | "negative" | "info";
  icon: string;
  title: string;
  description: string;
};

function pct(a: number, b: number): number {
  if (b === 0) return a > 0 ? 100 : 0;
  return Math.round(((a - b) / b) * 100);
}

export function generateInsights(
  receitas: number,
  despesas: number,
  variacaoReceitas: number | null,
  variacaoDespesas: number | null,
  pieData: { nome: string; valor: number }[],
  recentMonths: { receitas: number; despesas: number }[]
): Insight[] {
  const insights: Insight[] = [];
  const saldo = receitas - despesas;

  if (saldo > 0) {
    const mesesCobertura = despesas > 0 ? (saldo / despesas).toFixed(1) : "—";
    insights.push({
      id: "saldo-positivo",
      type: "positive",
      icon: "🟢",
      title: "Saldo positivo",
      description: `Seu saldo cobre aproximadamente ${mesesCobertura} ${Number(mesesCobertura) === 1 ? "mês" : "meses"} de gastos.`,
    });
  }

  if (variacaoDespesas !== null) {
    if (variacaoDespesas > 20) {
      insights.push({
        id: "gastos-subiram",
        type: "negative",
        icon: "🔴",
        title: "Gastos em alta",
        description: `Seus gastos subiram ${variacaoDespesas}% em relação ao mês anterior.`,
      });
    } else if (variacaoDespesas < -10) {
      insights.push({
        id: "gastos-cairam",
        type: "positive",
        icon: "🟢",
        title: "Gastos reduzidos",
        description: `Você reduziu seus gastos em ${Math.abs(variacaoDespesas)}% neste mês.`,
      });
    }
  }

  if (variacaoReceitas !== null && variacaoReceitas > 15) {
    insights.push({
      id: "receitas-subiram",
      type: "positive",
      icon: "📈",
      title: "Receitas crescendo",
      description: `Suas receitas aumentaram ${variacaoReceitas}% comparado ao mês passado.`,
    });
  }

  if (pieData.length > 0) {
    const maior = pieData[0];
    if (maior && maior.valor > 0) {
      const pctTotal = despesas > 0 ? Math.round((maior.valor / despesas) * 100) : 0;
      insights.push({
        id: "maior-gasto",
        type: "info",
        icon: "📊",
        title: "Maior gasto",
        description: `"${maior.nome}" representa ${pctTotal}% das suas despesas.`,
      });
    }
  }

  if (recentMonths.length >= 2) {
    const mesesPositivos = recentMonths.filter(
      (m) => m.receitas >= m.despesas
    ).length;
    const total = recentMonths.length;
    if (mesesPositivos === total) {
      insights.push({
        id: "todos-meses-positivos",
        type: "positive",
        icon: "🏆",
        title: "Sequência positiva",
        description: `Todos os últimos ${total} meses fecharam com saldo positivo.`,
      });
    } else if (mesesPositivos === 0) {
      insights.push({
        id: "todos-meses-negativos",
        type: "negative",
        icon: "⚠️",
        title: "Atenção financeira",
        description: `Nenhum dos últimos ${total} meses fechou no azul.`,
      });
    }
  }

  if (receitas > 0 && despesas > 0) {
    const proporcao = Math.round((despesas / receitas) * 100);
    if (proporcao > 90) {
      insights.push({
        id: "proporcao-alta",
        type: "negative",
        icon: "⚠️",
        title: "Margem apertada",
        description: `${proporcao}% da sua receita está comprometida com despesas.`,
      });
    } else if (proporcao < 50) {
      insights.push({
        id: "proporcao-baixa",
        type: "positive",
        icon: "💰",
        title: "Margem confortável",
        description: `Apenas ${proporcao}% da receita foi gasta este mês.`,
      });
    }
  }

  return insights.slice(0, 4);
}
