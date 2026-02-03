import { Pressable, Text, View } from 'react-native';
import { styles } from './SectionHeader.styles';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const SectionHeader = ({ title, actionLabel, onAction }: Props) => {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};
