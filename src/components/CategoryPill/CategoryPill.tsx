import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CategoryPill.styles';

type Props = {
  label: string;
  icon: string;
  color: string;
  selected?: boolean;
  onPress?: () => void;
};

export const CategoryPill = ({ label, icon, color, selected, onPress }: Props) => {
  return (
    <Pressable onPress={onPress} style={[styles.pill, selected && styles.selected]}>
      <View style={[styles.icon, { backgroundColor: `${color}22` }]}> 
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};
