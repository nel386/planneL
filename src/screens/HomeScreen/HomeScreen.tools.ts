import { Goal, Transaction } from '../../data';

export const getBalanceSummary = (transactions: Transaction[]) => {
  const income = transactions.filter((item) => item.type === 'income');
  const expenses = transactions.filter((item) => item.type === 'expense');
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  };
};

export const getFeaturedGoal = (goals: Goal[]) => goals[0];

export const getRecentTransactions = (transactions: Transaction[], count: number) =>
  transactions.slice(0, count);

