import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './TransactionRow.styles';

export type TransactionRowProps = {
  title: string;
  amount: string;
  date: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
};

export const TransactionRow = ({ title, amount, date, icon, color, type }: TransactionRowProps) => {
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}22` }]}> 
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <View style={styles.main}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{date}</Text>
      </View>
      <Text style={[styles.amount, type === 'income' && styles.income]}>{amount}</Text>
    </View>
  );
};
