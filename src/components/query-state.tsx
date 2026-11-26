import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import type { IconName } from '../navigation/menu';
import { getErrorMessage } from '../services/api-error';
import { palette, spacing } from '../theme';
import { IconBadge } from './icon-badge';

type Props = {
  isPending: boolean;
  error: unknown;
  isEmpty: boolean;
  emptyIcon: IconName;
  emptyTitle?: string;
  emptyMessage: string;
  onRetry: () => void;
  children: ReactNode;
};

/** Mostra carregando / erro com "Tentar novamente" / lista vazia / conteúdo. */
export function QueryState({
  isPending,
  error,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  onRetry,
  children,
}: Props) {
  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <IconBadge
          icon="alert-circle-outline"
          size={64}
          color={palette.danger}
          background={palette.dangerSoft}
        />
        <Text variant="titleMedium" style={styles.title}>
          Não foi possível carregar
        </Text>
        <Text variant="bodyMedium" style={styles.message}>
          {getErrorMessage(error)}
        </Text>
        <Button mode="contained" onPress={onRetry} style={styles.button}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.center}>
        <IconBadge icon={emptyIcon} size={64} />
        {emptyTitle ? (
          <Text variant="titleMedium" style={styles.title}>
            {emptyTitle}
          </Text>
        ) : null}
        <Text variant="bodyMedium" style={styles.message}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: palette.background,
  },
  title: {
    color: palette.text,
    fontWeight: '700',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  message: {
    color: palette.textMuted,
    textAlign: 'center',
    maxWidth: 320,
  },
  button: {
    marginTop: spacing.md,
  },
});
