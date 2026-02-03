import { OcrItem } from '../../utils';

export const normalizePrice = (value?: number) => {
  if (value == null) return 0;
  const rounded = Math.round(value * 100) / 100;
  return Number.isFinite(rounded) ? rounded : 0;
};

export const normalizeName = (value: string) => value.trim().replace(/\s+/g, ' ');

export const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');

export const normalizeOcrItems = (items: OcrItem[]) =>
  items
    .map((item) => ({
      name: normalizeName(item.name),
      price: normalizePrice(item.price),
    }))
    .filter((item) => item.name.length > 0);

export const dedupeOcrItems = (items: OcrItem[]) => {
  const seen = new Map<string, OcrItem>();
  for (const item of items) {
    const key = `${normalizeKey(item.name)}-${normalizePrice(item.price)}`;
    if (!key.trim()) continue;
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }
  return Array.from(seen.values());
};

export const getItemsSum = (items: OcrItem[]) =>
  items.reduce((acc, item) => acc + (item.price || 0), 0);

const parseMoney = (value: string) => {
  const cleaned = value.replace(/[^\d.,-]/g, '').replace(',', '.');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseTotalFromLines = (lines: string[]) => {
  const keywords = ['total', 'importe', 'a pagar', 'total a pagar', 'suma', 'subtotal'];
  const normalized = lines.map((line) => line.toLowerCase());
  for (let i = 0; i < normalized.length; i += 1) {
    const line = normalized[i];
    if (!keywords.some((key) => line.includes(key))) continue;
    const match = line.match(/(-?\d+[.,]\d{2})/g);
    if (match?.length) {
      const parsed = parseMoney(match[match.length - 1]);
      if (parsed != null && parsed > 0) return parsed;
    }
  }

  const fallback = normalized
    .map((line) => parseMoney(line))
    .filter((value): value is number => value != null && value > 0);
  return fallback.length ? fallback[fallback.length - 1] : null;
};

