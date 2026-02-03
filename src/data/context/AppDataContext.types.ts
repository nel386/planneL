import { Budget, Category, Goal, ReceiptItem, Rule, Transaction } from '../types';

export type AppDataContextValue = {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  rules: Rule[];
  loading: boolean;
  refresh: () => Promise<void>;
  addTransaction: (
    payload: Omit<Transaction, 'id' | 'date'> & {
      date?: string;
      items?: Array<Omit<ReceiptItem, 'id' | 'transactionId'>>;
    }
  ) => Promise<void>;
  editTransaction: (payload: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addGoal: (payload: Omit<Goal, 'id' | 'saved'> & { saved?: number }) => Promise<void>;
  addCategory: (payload: Omit<Category, 'id'> & { id?: string }) => Promise<void>;
  editCategory: (payload: Category) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  addRule: (payload: Omit<Rule, 'id'> & { id?: string }) => Promise<void>;
  removeRule: (id: string) => Promise<void>;
};
