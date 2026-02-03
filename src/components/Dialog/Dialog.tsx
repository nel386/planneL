import { Modal, Pressable, Text, View } from 'react-native';
import { styles } from './Dialog.styles';

type DialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  destructive?: boolean;
};

export const Dialog = ({
  visible,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  destructive,
}: DialogProps) => {
  if (!visible) return null;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            {onCancel ? (
              <Pressable style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelText}>{cancelLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={[styles.confirmButton, destructive && styles.destructiveButton]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmText, destructive && styles.destructiveText]}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
