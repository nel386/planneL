export type Category = {
  id: string;
  label: string;
  icon: string;
  color: string;
};

export type Transaction = {
  id: string;
  title: string;
  categoryId: string;
  amount: number;
  date: string;
  type: 'expense' | 'income';
  note?: string;
  receiptUri?: string;
};

export type ReceiptItem = {
  id: string;
  transactionId: string;
  name: string;
  price?: number;
  categoryId?: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  limitAmount: number;
  spent: number;
};

export type Goal = {
  id: string;
  title: string;
  target: number;
  saved: number;
  due: string;
};

export type Rule = {
  id: string;
  pattern: string;
  categoryId: string;
};
