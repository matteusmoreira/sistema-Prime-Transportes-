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