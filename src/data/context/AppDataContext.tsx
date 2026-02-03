import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import {
  deleteCategory,
  deleteRule,
  deleteTransaction,
  getBudgets,
  getCategories,
  getGoals,
  getRules,
  getTransactions,
  initDb,
  insertCategory,
  insertGoal,
  insertReceiptItems,
  insertRule,
  insertTransaction,
  seedIfEmpty,
  updateCategory,
  updateTransaction,
} from '../db';
import { Budget, Category, Goal, Rule, Transaction } from '../types';
import { AppDataContextValue } from './AppDataContext.types';
import { buildCategory, buildGoal, buildRule, createTransactionId } from './AppDataContext.tools';

const AppDataContext = createContext<AppDataContextValue | null>(null);

export const AppDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    const [nextCategories, nextTransactions, nextBudgets, nextGoals, nextRules] = await Promise.all([
      getCategories(),
      getTransactions(),
      getBudgets(),
      getGoals(),
      getRules(),
    ]);
    setCategories(nextCategories);
    setTransactions(nextTransactions);
    setBudgets(nextBudgets);
    setGoals(nextGoals);
    setRules(nextRules);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      await loadAll();
    } finally {
      setLoading(false);
    }
  };

  const addTransaction: AppDataContextValue['addTransaction'] = async (payload) => {
    const id = createTransactionId();
    const date = payload.date ?? new Date().toISOString().slice(0, 10);
    const { items, ...transactionPayload } = payload;
    const transaction: Transaction = { ...transactionPayload, id, date };

    try {
      await insertTransaction(transaction);
      if (items?.length) {
        await insertReceiptItems(id, items);
      }
      await refresh();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar el gasto.');
    }
  };

  const editTransaction = async (payload: Transaction) => {
    try {
      await updateTransaction(payload);
      await refresh();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar el gasto.');
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      await refresh();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo eliminar el gasto.');
    }
  };

  const addGoal: AppDataContextValue['addGoal'] = async (payload) => {
    const goal: Goal = buildGoal(payload);

    try {
      await insertGoal(goal);
      await refresh();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar el objetivo.');
    }
  };

  const addCategory: AppDataContextValue['addCategory'] = async (payload) => {
    const category: Category = buildCategory(payload);

    try {
      await insertCategory(category);
      await refresh();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo crear la categoria.');
    }
  };

  const editCategory = async (payload: Category) => {
    try {
      await updateCategory(payload);
      await refresh();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar la categoria.');
    }
  };

  const removeCategory = async (id: string) => {
    try {
      const used = transactions.some((tx) => tx.categoryId === id);
      if (used) {
        Alert.alert('Categoria en uso', 'Cambia esos gastos antes de borrar esta categoria.');
        return;
      }
      await deleteCategory(id);
      await refresh();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo eliminar la categoria.');
    }
  };

  const addRule: AppDataContextValue['addRule'] = async (payload) => {
    const rule: Rule = buildRule(payload);

    try {
      await insertRule(rule);
      await refresh();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo crear la regla.');
    }
  };

  const removeRule = async (id: string) => {
    try {
      await deleteRule(id);
      await refresh();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo eliminar la regla.');
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await initDb();
        await seedIfEmpty();
        await loadAll();
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'No se pudo cargar la base local.');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      categories,
      transactions,
      budgets,
      goals,
      rules,
      loading,
      refresh,
      addTransaction,
      editTransaction,
      removeTransaction,
      addGoal,
      addCategory,
      editCategory,
      removeCategory,
      addRule,
      removeRule,
    }),
    [categories, transactions, budgets, goals, rules, loading]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }
  return context;
};
