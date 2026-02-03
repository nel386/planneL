export type OcrItem = {
  name: string;
  price: number;
};

export type OcrResponse = {
  merchant: string | null;
  date: string | null;
  total: number | null;
  items: OcrItem[];
  raw_text: string[];
  confidence: number;
  language: string;
};
