import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  accentCard: {
    borderColor: colors.accentSoft,
    backgroundColor: '#FFF7E8',
  },
  label: {
    fontSize: typography.small,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: colors.ink,
    marginTop: spacing.xs,
  },
  successValue: {
    color: colors.success,
  },
  hint: {
    marginTop: spacing.xs,
    fontSize: typography.small,
    color: colors.muted,
  },
});
