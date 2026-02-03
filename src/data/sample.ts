import { colors } from '../theme';
import { Budget, Category, Goal, Transaction, Rule } from './types';

export const categories: Category[] = [
  { id: 'home', label: 'Casa', icon: 'home', color: colors.chart[0] },
  { id: 'food', label: 'Comida', icon: 'restaurant', color: colors.chart[1] },
  { id: 'gym', label: 'Gym', icon: 'barbell', color: colors.chart[2] },
  { id: 'transport', label: 'Transporte', icon: 'car', color: colors.chart[3] },
  { id: 'leisure', label: 'Ocio', icon: 'game-controller', color: colors.chart[4] },
  { id: 'salary', label: 'Nomina', icon: 'cash', color: colors.success },
];

export const transactions: Transaction[] = [
  {
    id: 't1',
    title: 'Nomina',
    categoryId: 'salary',
    amount: 1950,
    date: '2026-01-26',
    type: 'income',
  },
  {
    id: 't2',
    title: 'Alquiler',
    categoryId: 'home',
    amount: 680,
    date: '2026-01-26',
    type: 'expense',
  },
  {
    id: 't3',
    title: 'Supermercado',
    categoryId: 'food',
    amount: 76.35,
    date: '2026-01-28',
    type: 'expense',
  },
  {
    id: 't4',
    title: 'Gimnasio',
    categoryId: 'gym',
    amount: 32.9,
    date: '2026-01-28',
    type: 'expense',
  },
  {
    id: 't5',
    title: 'Cena con amigos',
    categoryId: 'leisure',
    amount: 28.4,
    date: '2026-01-29',
    type: 'expense',
  },
];

export const budgets: Budget[] = [
  { id: 'b1', categoryId: 'food', limitAmount: 320, spent: 150 },
  { id: 'b2', categoryId: 'gym', limitAmount: 45, spent: 32.9 },
  { id: 'b3', categoryId: 'leisure', limitAmount: 180, spent: 72.5 },
  { id: 'b4', categoryId: 'transport', limitAmount: 120, spent: 40 },
];

export const goals: Goal[] = [
  { id: 'g1', title: 'Fondo emergencia', target: 3000, saved: 1240, due: '2026-06-30' },
  { id: 'g2', title: 'Vacaciones', target: 900, saved: 360, due: '2026-08-15' },
  { id: 'g3', title: 'Nuevo movil', target: 650, saved: 220, due: '2026-05-10' },
];

export const rules: Rule[] = [
  { id: 'r1', pattern: 'mercadona', categoryId: 'food' },
  { id: 'r2', pattern: 'gym', categoryId: 'gym' },
  { id: 'r3', pattern: 'uber', categoryId: 'transport' },
];