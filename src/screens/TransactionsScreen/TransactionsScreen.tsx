import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SectionHeader, TransactionRow } from '../../components';
import { useAppData } from '../../data';
import { colors } from '../../theme';
import { formatCurrency, formatShortDate } from '../../utils';
import { styles } from './TransactionsScreen.styles';

export const TransactionsScreen = () => {
  const { categories, transactions, loading } = useAppData();
  const navigation = useNavigation();
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');

  const filteredTransactions = filter === 'all' ? transactions : transactions.filter((item) => item.type === filter);

  const cycleFilter = () => {
    setFilter((prev) => {
      if (prev === 'all') return 'expense';
      if (prev === 'expense') return 'income';
      return 'all';
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Cargando movimientos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Movimientos</Text>
        <Text style={styles.subtitle}>Todo tu historial en un vistazo</Text>

        <View style={styles.section}>
          <SectionHeader
            title="Enero"
            actionLabel={filter === 'all' ? 'Todo' : filter === 'expense' ? 'Gastos' : 'Ingresos'}
            onAction={cycleFilter}
          />
          <View style={styles.listCard}>
            {filteredTransactions.map((item) => {
              const category = categories.find((cat) => cat.id === item.categoryId);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => navigation.navigate('TransactionDetail' as never, { transactionId: item.id } as never)}
                >
                  <TransactionRow
                    title={item.title}
                    amount={formatCurrency(item.amount)}
                    date={formatShortDate(item.date)}
                    icon={category?.icon ?? 'wallet'}
                    color={category?.color ?? colors.accent}
                    type={item.type}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


