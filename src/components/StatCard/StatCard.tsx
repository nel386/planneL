import { Text, View } from 'react-native';
import { styles } from './StatCard.styles';

type Props = {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'accent' | 'success';
};

export const StatCard = ({ label, value, hint, tone = 'default' }: Props) => {
  return (
    <View style={[styles.card, tone === 'accent' && styles.accentCard]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, tone === 'success' && styles.successValue]}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
};
