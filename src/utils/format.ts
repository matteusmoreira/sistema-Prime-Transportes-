export function formatCurrency(value?: number | string): string {
  const num = typeof value === 'number' ? value : Number(value);
  if (!isFinite(num)) return 'R$\u00a00,00';
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  } catch {
    // Fallback simples
    return `R$ ${num.toFixed(2)}`;
  }
}

export function formatDateDDMMYYYY(input?: string | Date): string {
  if (!input) return '';
  // Se vier como ISO (YYYY-MM-DD[THH:mm:ss]) fazemos parsing direto para evitar fuso
  if (typeof input === 'string') {
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const [, yyyy, mm, dd] = m;
      return `${dd}/${mm}/${yyyy}`;
    }
  }
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '';
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getUTCFullYear()).padStart(4, '0');
  return `${dd}/${mm}/${yyyy}`;
}