import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.body,
    color: colors.muted,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 4,
    fontSize: typography.body,
    color: colors.muted,
  },
  balanceCard: {
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceLabel: {
    fontSize: typography.small,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.ink,
    marginTop: spacing.sm,
  },
  balanceMeta: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceMetaText: {
    fontSize: typography.small,
    color: colors.muted,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  spacer: {
    width: spacing.md,
  },
  section: {
    marginTop: spacing.xl,
  },
  goalCard: {
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.ink,
  },
  goalAmount: {
    fontSize: typography.small,
    color: colors.muted,
  },
  goalHint: {
    marginTop: spacing.sm,
    fontSize: typography.small,
    color: colors.muted,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
});
