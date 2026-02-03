import { Category, Goal, Rule, Transaction } from '../types';

export const createTransactionId = () => `t-${Date.now()}`;
export const createGoalId = () => `g-${Date.now()}`;
export const createCategoryId = () => `c-${Date.now()}`;
export const createRuleId = () => `r-${Date.now()}`;

export const buildGoal = (payload: Omit<Goal, 'id' | 'saved'> & { saved?: number }): Goal => ({
  id: createGoalId(),
  title: payload.title,
  target: payload.target,
  saved: payload.saved ?? 0,
  due: payload.due,
});

export const buildCategory = (payload: Omit<Category, 'id'> & { id?: string }): Category => ({
  id: payload.id ?? createCategoryId(),
  label: payload.label,
  icon: payload.icon,
  color: payload.color,
});

export const buildRule = (payload: Omit<Rule, 'id'> & { id?: string }): Rule => ({
  id: payload.id ?? createRuleId(),
  pattern: payload.pattern,
  categoryId: payload.categoryId,
});
