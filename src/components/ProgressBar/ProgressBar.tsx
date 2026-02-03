import { View } from 'react-native';
import { colors } from '../../theme';
import { styles } from './ProgressBar.styles';

type Props = {
  value: number;
  max: number;
  color?: string;
};

export const ProgressBar = ({ value, max, color = colors.accent }: Props) => {
  const ratio = Math.min(value / max, 1);
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
    </View>
  );
};
