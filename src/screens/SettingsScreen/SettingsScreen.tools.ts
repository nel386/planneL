import { Category } from '../../data';
import { CategoryFormState } from './SettingsScreen.types';

export const iconOptions = ['home', 'restaurant', 'car', 'barbell', 'game-controller', 'cash', 'cart', 'gift'];
export const colorOptions = ['#D97706', '#0F766E', '#2563EB', '#7C3AED', '#DB2777', '#6B7280'];

export const filterCategories = (categories: Category[], query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return categories;
  return categories.filter((cat) => cat.label.toLowerCase().includes(q));
};

export const getDefaultCategoryForm = (): CategoryFormState => ({
  label: '',
  icon: iconOptions[0],
  color: colorOptions[0],
});

