import { ReceiptItem } from '../../data';

export const parseDecimalInput = (value: string) => {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

export const buildReceiptItem = (params: {
  id?: string;
  transactionId: string;
  name: string;
  price?: number | null;
  categoryId?: string;
}): ReceiptItem => ({
  id: params.id ?? `ri-${Date.now()}`,
  transactionId: params.transactionId,
  name: params.name.trim(),
  price: params.price ?? undefined,
  categoryId: params.categoryId ?? undefined,
});

