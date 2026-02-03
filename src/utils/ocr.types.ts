export type OcrItem = {
  name: string;
  price: number;
};

export type OcrResponse = {
  merchant?: string | null;
  date?: string | null;
  total?: number | null;
  items?: OcrItem[] | null;
  raw_text?: string[] | null;
  confidence?: number | null;
  language?: string | null;
};
