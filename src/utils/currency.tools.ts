export const formatCurrencyInput = (value: string) => {
  const cleaned = value.replace(/[^\d,.-]/g, '');
  const normalized = cleaned.replace('.', ',');
  const parts = normalized.split(',');
  if (parts.length > 2) {
    return `${parts[0]},${parts[1]}`;
  }
  return normalized;
};
