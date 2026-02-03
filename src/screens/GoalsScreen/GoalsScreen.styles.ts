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
  title: {
    fontSize: typography.h1,
    fontWeight: '800',
    color: colors.ink,
  },
  subtitle: {
    marginTop: 4,
    fontSize: typography.body,
    color: colors.muted,
  },
  section: {
    marginTop: spacing.xl,
  },
  card: {
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.ink,
  },
  cardMeta: {
    fontSize: typography.small,
    color: colors.muted,
  },
  cardAmount: {
    fontSize: typography.small,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  tipCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF7E8',
  },
  tipTitle: {
    fontSize: typography.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.accent,
  },
  tipText: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    color: colors.ink,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.h2,
    fontWeight: '800',
    color: colors.ink,
  },
  modalSubtitle: {
    marginTop: 4,
    fontSize: typography.small,
    color: colors.muted,
  },
  label: {
    fontSize: typography.small,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.muted,
    marginTop: spacing.md,
  },
  input: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: typography.body,
    color: colors.ink,
    backgroundColor: '#FFFCF8',
  },
  dateButton: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: '#FFFCF8',
  },
  dateText: {
    fontSize: typography.body,
    color: colors.ink,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.muted,
    fontWeight: '700',
    fontSize: typography.small,
  },
  saveButton: {
    flex: 1,
    marginLeft: spacing.sm,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.ink,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: typography.small,
  },
});
