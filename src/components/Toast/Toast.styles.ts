import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  toast: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 18,
    minWidth: '70%',
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    fontSize: typography.body,
    fontWeight: '700',
  },
  success: {
    backgroundColor: colors.success,
  },
  error: {
    backgroundColor: colors.danger,
  },
  info: {
    backgroundColor: colors.ink,
  },
});
