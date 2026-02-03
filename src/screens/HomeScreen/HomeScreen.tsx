import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar, SectionHeader, StatCard, TransactionRow } from '../../components';
import { useAppData } from '../../data';
import { colors } from '../../theme';
import { formatCurrency, formatShortDate } from '../../utils';
import { getBalanceSummary, getFeaturedGoal, getRecentTransactions } from './HomeScreen.tools';
import { styles } from './HomeScreen.styles';

export const HomeScreen = () => {
  const { categories, goals, transactions, loading } = useAppData();
  const navigation = useNavigation();

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { totalIncome, totalExpenses, balance } = getBalanceSummary(transactions);
  const featuredGoal = getFeaturedGoal(goals);
  const recent = getRecentTransactions(transactions, 3);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>planneL</Text>
          <Text style={styles.subtitle}>Resumen mensual</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
          <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
          <View style={styles.balanceMeta}>
            <Text style={styles.balanceMetaText}>Ingresos {formatCurrency(totalIncome)}</Text>
            <Text style={styles.balanceMetaText}>Gastos {formatCurrency(totalExpenses)}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Ahorro" value={formatCurrency(420)} hint="Objetivo mensual" tone="accent" />
          <View style={styles.spacer} />
          <StatCard label="Libre" value={formatCurrency(312)} hint="Disponible hoy" tone="success" />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Objetivo activo"
            actionLabel="Ver todo"
            onAction={() => navigation.navigate('Objetivos' as never)}
          />
          {featuredGoal ? (
            <View style={styles.goalCard}>
              <View style={styles.goalTop}>
                <Text style={styles.goalTitle}>{featuredGoal.title}</Text>
                <Text style={styles.goalAmount}>
                  {formatCurrency(featuredGoal.saved)} / {formatCurrency(featuredGoal.target)}
                </Text>
              </View>
              <ProgressBar value={featuredGoal.saved} max={featuredGoal.target} color={colors.accent} />
              <Text style={styles.goalHint}>Meta para {featuredGoal.due}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Ultimos movimientos"
            actionLabel="Detalle"
            onAction={() => navigation.navigate('Movimientos' as never)}
          />
          <View style={styles.listCard}>
            {recent.map((item) => {
              const category = categories.find((cat) => cat.id === item.categoryId);
              return (
                <TransactionRow
                  key={item.id}
                  title={item.title}
                  amount={formatCurrency(item.amount)}
                  date={formatShortDate(item.date)}
                  icon={category?.icon ?? 'wallet'}
                  color={category?.color ?? colors.accent}
                  type={item.type}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


