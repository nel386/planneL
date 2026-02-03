import { createContext, useContext, useMemo, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { styles } from './Toast.styles';

type ToastType = 'success' | 'error' | 'info';

type ToastState = {
  visible: boolean;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  show: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'info' });

  const show = (message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2200);
  };

  const value = useMemo(() => ({ show }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Modal transparent visible={toast.visible} animationType="fade">
        <View style={styles.backdrop}>
          <View style={[styles.toast, styles[toast.type]]}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      </Modal>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};
