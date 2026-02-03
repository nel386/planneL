export type AddScreenDialogState = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
};

export type AmountSource = 'total' | 'sum' | 'manual';

