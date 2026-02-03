import { Modal, Pressable, Text, View } from 'react-native';
import { styles } from './BottomSheet.styles';

type SheetOption = {
  label: string;
  onPress: () => void;
};

type BottomSheetProps = {
  visible: boolean;
  title?: string;
  options: SheetOption[];
  onClose: () => void;
};

export const BottomSheet = ({ visible, title, options, onClose }: BottomSheetProps) => {
  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => null}>
          <View style={styles.handle} />
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {options.map((option) => (
            <Pressable
              key={option.label}
              style={styles.option}
              onPress={() => {
                option.onPress();
                onClose();
              }}
            >
              <Text style={styles.optionText}>{option.label}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
