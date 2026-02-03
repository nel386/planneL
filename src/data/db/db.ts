import { budgets, categories, goals, rules, transactions } from '../sample';
import { Budget, Category, Goal, ReceiptItem, Rule, Transaction } from '../types';
import { DbColumnInfo } from './db.types';
import { exec, getAll, getFirst, run } from './db.tools';

export const initDb = async () => {
  await exec(
    'CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY NOT NULL, label TEXT NOT NULL, icon TEXT NOT NULL, color TEXT NOT NULL)'
  );
  await exec(
    'CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, categoryId TEXT NOT NULL, amount REAL NOT NULL, date TEXT NOT NULL, type TEXT NOT NULL, note TEXT, receiptUri TEXT)'
  );
  await exec(
    'CREATE TABLE IF NOT EXISTS budgets (id TEXT PRIMARY KEY NOT NULL, categoryId TEXT NOT NULL, limitAmount REAL NOT NULL, spent REAL NOT NULL)'
  );
  await exec(
    'CREATE TABLE IF NOT EXISTS goals (id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, target REAL NOT NULL, saved REAL NOT NULL, due TEXT NOT NULL)'
  );
  await exec(
    'CREATE TABLE IF NOT EXISTS rules (id TEXT PRIMARY KEY NOT NULL, pattern TEXT NOT NULL, categoryId TEXT NOT NULL)'
  );
  await exec(
    'CREATE TABLE IF NOT EXISTS receipt_items (id TEXT PRIMARY KEY NOT NULL, transactionId TEXT NOT NULL, name TEXT NOT NULL, price REAL, categoryId TEXT)'
  );
  await exec('CREATE INDEX IF NOT EXISTS idx_receipt_items_transaction ON receipt_items (transactionId)');

  const columns = await getAll<DbColumnInfo>('PRAGMA table_info(budgets)');
  const hasLegacyLimit = columns.some((col) => col.name === 'limit');
  if (hasLegacyLimit) {
    await exec(
      'CREATE TABLE IF NOT EXISTS budgets_new (id TEXT PRIMARY KEY NOT NULL, categoryId TEXT NOT NULL, limitAmount REAL NOT NULL, spent REAL NOT NULL)'
    );
    await exec('INSERT OR IGNORE INTO budgets_new (id, categoryId, limitAmount, spent) SELECT id, categoryId, "limit", spent FROM budgets');
    await exec('DROP TABLE IF EXISTS budgets');
    await exec('ALTER TABLE budgets_new RENAME TO budgets');
  }

  const transactionCols = await getAll<DbColumnInfo>('PRAGMA table_info(transactions)');
  const hasReceipt = transactionCols.some((col) => col.name === 'receiptUri');
  if (!hasReceipt) {
    await exec('ALTER TABLE transactions ADD COLUMN receiptUri TEXT');
  }

  const receiptCols = await getAll<DbColumnInfo>('PRAGMA table_info(receipt_items)');
  const hasReceiptCategory = receiptCols.some((col) => col.name === 'categoryId');
  if (!hasReceiptCategory) {
    await exec('ALTER TABLE receipt_items ADD COLUMN categoryId TEXT');
  }
};

const getCount = async (table: string) => {
  const result = await getFirst<{ count: number }>(`SELECT COUNT(*) as count FROM ${table}`);
  return result?.count ?? 0;
};

const seedCategories = async () => {
  const count = await getCount('categories');
  if (count > 0) return;

  for (const item of categories) {
    await run('INSERT INTO categories (id, label, icon, color) VALUES (?, ?, ?, ?)', [
      item.id,
      item.label,
      item.icon,
      item.color,
    ]);
  }
};

const seedTransactions = async () => {
  const count = await getCount('transactions');
  if (count > 0) return;

  for (const item of transactions) {
    await run(
      'INSERT INTO transactions (id, title, categoryId, amount, date, type, note, receiptUri) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [item.id, item.title, item.categoryId, item.amount, item.date, item.type, item.note ?? null, item.receiptUri ?? null]
    );
  }
};

const seedBudgets = async () => {
  const count = await getCount('budgets');
  if (count > 0) return;

  for (const item of budgets) {
    await run('INSERT INTO budgets (id, categoryId, limitAmount, spent) VALUES (?, ?, ?, ?)', [
      item.id,
      item.categoryId,
      item.limitAmount,
      item.spent,
    ]);
  }
};

const seedGoals = async () => {
  const count = await getCount('goals');
  if (count > 0) return;

  for (const item of goals) {
    await run('INSERT INTO goals (id, title, target, saved, due) VALUES (?, ?, ?, ?, ?)', [
      item.id,
      item.title,
      item.target,
      item.saved,
      item.due,
    ]);
  }
};

const seedRules = async () => {
  const count = await getCount('rules');
  if (count > 0) return;

  for (const item of rules) {
    await run('INSERT INTO rules (id, pattern, categoryId) VALUES (?, ?, ?)', [
      item.id,
      item.pattern,
      item.categoryId,
    ]);
  }
};

export const seedIfEmpty = async () => {
  await seedCategories();
  await seedTransactions();
  await seedBudgets();
  await seedGoals();
  await seedRules();
};

export const getCategories = async (): Promise<Category[]> => {
  return getAll<Category>('SELECT * FROM categories ORDER BY label ASC');
};

export const getTransactions = async (): Promise<Transaction[]> => {
  return getAll<Transaction>('SELECT * FROM transactions ORDER BY date DESC');
};

export const getBudgets = async (): Promise<Budget[]> => {
  return getAll<Budget>('SELECT * FROM budgets');
};

export const getGoals = async (): Promise<Goal[]> => {
  return getAll<Goal>('SELECT * FROM goals ORDER BY due ASC');
};

export const getRules = async (): Promise<Rule[]> => {
  return getAll<Rule>('SELECT * FROM rules ORDER BY pattern ASC');
};

export const getReceiptItemsByTransaction = async (transactionId: string): Promise<ReceiptItem[]> => {
  return getAll<ReceiptItem>('SELECT * FROM receipt_items WHERE transactionId = ? ORDER BY rowid ASC', [
    transactionId,
  ]);
};

export const insertTransaction = async (payload: Transaction) => {
  await run(
    'INSERT INTO transactions (id, title, categoryId, amount, date, type, note, receiptUri) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      payload.id,
      payload.title,
      payload.categoryId,
      payload.amount,
      payload.date,
      payload.type,
      payload.note ?? null,
      payload.receiptUri ?? null,
    ]
  );
};

export const insertReceiptItems = async (
  transactionId: string,
  items: Array<Omit<ReceiptItem, 'id' | 'transactionId'>>
) => {
  if (!items.length) return;
  let index = 0;
  for (const item of items) {
    const id = `ri-${Date.now()}-${index}`;
    index += 1;
    await run('INSERT INTO receipt_items (id, transactionId, name, price, categoryId) VALUES (?, ?, ?, ?, ?)', [
      id,
      transactionId,
      item.name,
      item.price ?? null,
      item.categoryId ?? null,
    ]);
  }
};

export const insertReceiptItem = async (payload: ReceiptItem) => {
  await run('INSERT INTO receipt_items (id, transactionId, name, price, categoryId) VALUES (?, ?, ?, ?, ?)', [
    payload.id,
    payload.transactionId,
    payload.name,
    payload.price ?? null,
    payload.categoryId ?? null,
  ]);
};

export const updateReceiptItem = async (payload: ReceiptItem) => {
  await run('UPDATE receipt_items SET name = ?, price = ?, categoryId = ? WHERE id = ?', [
    payload.name,
    payload.price ?? null,
    payload.categoryId ?? null,
    payload.id,
  ]);
};

export const deleteReceiptItem = async (id: string) => {
  await run('DELETE FROM receipt_items WHERE id = ?', [id]);
};

export const updateTransaction = async (payload: Transaction) => {
  await run(
    'UPDATE transactions SET title = ?, categoryId = ?, amount = ?, date = ?, type = ?, note = ?, receiptUri = ? WHERE id = ?',
    [
      payload.title,
      payload.categoryId,
      payload.amount,
      payload.date,
      payload.type,
      payload.note ?? null,
      payload.receiptUri ?? null,
      payload.id,
    ]
  );
};

export const deleteTransaction = async (id: string) => {
  await run('DELETE FROM receipt_items WHERE transactionId = ?', [id]);
  await run('DELETE FROM transactions WHERE id = ?', [id]);
};

export const insertGoal = async (payload: Goal) => {
  await run('INSERT INTO goals (id, title, target, saved, due) VALUES (?, ?, ?, ?, ?)', [
    payload.id,
    payload.title,
    payload.target,
    payload.saved,
    payload.due,
  ]);
};

export const insertCategory = async (payload: Category) => {
  await run('INSERT INTO categories (id, label, icon, color) VALUES (?, ?, ?, ?)', [
    payload.id,
    payload.label,
    payload.icon,
    payload.color,
  ]);
};

export const updateCategory = async (payload: Category) => {
  await run('UPDATE categories SET label = ?, icon = ?, color = ? WHERE id = ?', [
    payload.label,
    payload.icon,
    payload.color,
    payload.id,
  ]);
};

export const deleteCategory = async (id: string) => {
  await run('DELETE FROM categories WHERE id = ?', [id]);
};

export const insertRule = async (payload: Rule) => {
  await run('INSERT INTO rules (id, pattern, categoryId) VALUES (?, ?, ?)', [
    payload.id,
    payload.pattern,
    payload.categoryId,
  ]);
};

export const deleteRule = async (id: string) => {
  await run('DELETE FROM rules WHERE id = ?', [id]);
};
