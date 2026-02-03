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
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
});
