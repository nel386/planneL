import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  main: {
    flex: 1,
  },
  title: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.ink,
  },
  meta: {
    fontSize: typography.small,
    color: colors.muted,
    marginTop: 2,
  },
  amount: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.danger,
  },
  income: {
    color: colors.success,
  },
});
