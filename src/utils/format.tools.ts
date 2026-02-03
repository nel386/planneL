const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const formatCurrency = (value: number) => {
  if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2,
    }).format(value);
  }

  return `${value.toFixed(2)} EUR`;
};

export const formatShortDate = (iso: string) => {
  const date = new Date(iso);
  const day = date.getDate();
  const month = months[date.getMonth()] ?? '';
  return `${day} ${month}`;
};
