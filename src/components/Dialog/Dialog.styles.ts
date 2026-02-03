import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: '800',
    color: colors.ink,
  },
  message: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: spacing.sm,
  },
  cancelText: {
    color: colors.muted,
    fontWeight: '700',
    fontSize: typography.small,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.ink,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: typography.small,
  },
  destructiveButton: {
    backgroundColor: colors.danger,
  },
  destructiveText: {
    color: '#fff',
  },
});
