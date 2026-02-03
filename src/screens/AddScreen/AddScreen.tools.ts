import { OcrItem, OcrRawItem } from '../../utils';

export const normalizePrice = (value?: number | string | null) => {
  if (value == null) return 0;
  const parsed = typeof value === 'string' ? parseMoney(value) ?? 0 : value;
  const rounded = Math.round(parsed * 100) / 100;
  return Number.isFinite(rounded) ? rounded : 0;
};

export const normalizeName = (value: string) => value.trim().replace(/\s+/g, ' ');

export const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');

export const normalizeOcrItems = (items: OcrRawItem[]) =>
  items
    .map((item) => ({
      name: normalizeName(item.name),
      price: normalizePrice(item.price),
    }))
    .filter((item) => item.name.length > 0);

export const dedupeOcrItems = (items: OcrRawItem[]) => {
  const seen = new Map<string, OcrRawItem>();
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

const extractMoneyCandidates = (value: string) => {
  const matches = value.match(/-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})|-?\d+(?:[.,]\d{2})/g);
  return matches ?? [];
};

const parseMoney = (value: string) => {
  const cleaned = value.replace(/[^\d.,-]/g, '');
  let normalized = cleaned;
  const hasDot = cleaned.includes('.');
  const hasComma = cleaned.includes(',');
  if (hasDot && hasComma) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    normalized = cleaned.replace(',', '.');
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseTotalFromLines = (lines: string[]) => {
  const keywords = ['total', 'importe', 'a pagar', 'total a pagar', 'suma', 'subtotal'];
  const normalized = lines.map((line) => line.toLowerCase());
  for (let i = 0; i < normalized.length; i += 1) {
    const line = normalized[i];
    if (!keywords.some((key) => line.includes(key))) continue;
    const matches = extractMoneyCandidates(line);
    const parsedCandidates = matches
      .map((candidate) => parseMoney(candidate))
      .filter((value): value is number => value != null && value > 0);
    if (parsedCandidates.length) {
      return Math.max(...parsedCandidates);
    }
  }

  const fallback = normalized
    .flatMap((line) => extractMoneyCandidates(line))
    .map((value) => parseMoney(value))
    .filter((value): value is number => value != null && value > 0);
  return fallback.length ? Math.max(...fallback) : null;
};
