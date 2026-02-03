import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 46,
    height: 5,
    borderRadius: 999,
    alignSelf: 'center',
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.md,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.ink,
  },
  cancel: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.muted,
  },
});
