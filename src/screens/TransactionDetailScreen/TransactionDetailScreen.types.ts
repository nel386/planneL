export type TransactionDetailRouteParams = {
  transactionId: string;
};

export type TransactionDetailDialogState = {
  title: string;
  message?: string;
  onConfirm?: () => void;
};

export type ReceiptCategoryPickerState = {
  itemId: string;
  currentCategoryId?: string;
};

