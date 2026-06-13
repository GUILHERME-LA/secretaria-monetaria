export function formatCurrency(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatDate(dateString: string): string {
  return new Date(dateString + "T12:00:00").toLocaleDateString("pt-BR");
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthBounds(month: string) {
  const [ano, mes] = month.split("-").map(Number);
  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const fim = `${ano}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
  return { inicio, fim, ano, mes };
}

export function getLast6Months(month: string): string[] {
  const [ano, mes] = month.split("-").map(Number);
  const meses: string[] = [];
  for (let i = 5; i >= 0; i--) {
    let m = mes - i;
    let a = ano;
    if (m <= 0) {
      m += 12;
      a -= 1;
    }
    meses.push(`${a}-${String(m).padStart(2, "0")}`);
  }
  return meses;
}

export function isFutureMonth(month: string): boolean {
  return month > getCurrentMonth();
}

export function isPastMonth(month: string): boolean {
  return month < getCurrentMonth();
}

export function getNextNMonths(current: string, n: number): string[] {
  const [ano, mes] = current.split("-").map(Number);
  const meses: string[] = [];
  for (let i = 0; i < n; i++) {
    let m = mes + i;
    let a = ano;
    while (m > 12) { m -= 12; a += 1; }
    meses.push(`${a}-${String(m).padStart(2, "0")}`);
  }
  return meses;
}

export const MONTH_NAMES: Record<string, string> = {
  "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
  "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
  "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro",
};

export function monthLabel(month: string): string {
  const [ano, mes] = month.split("-");
  return `${MONTH_NAMES[mes] || mes} ${ano}`;
}
