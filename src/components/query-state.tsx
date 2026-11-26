import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Icon, Text } from 'react-native-paper';
import { getErrorMessage } from '../services/api-error';
import type { IconName } from '../navigation/menu';

type Props = {
  isPending: boolean;
  error: unknown;
  isEmpty: boolean;
  emptyIcon: IconName;
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
  emptyMessage,
  onRetry,
  children,
}: Props) {
  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Icon source="alert-circle-outline" size={40} color="#b3261e" />
        <Text variant="bodyLarge" style={styles.error}>
          {getErrorMessage(error)}
        </Text>
        <Button mode="contained" onPress={onRetry}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.center}>
        <Icon source={emptyIcon} size={40} color="#526579" />
        <Text variant="bodyLarge" style={styles.empty}>
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
    gap: 12,
    padding: 24,
  },
  error: {
    color: '#b3261e',
    textAlign: 'center',
  },
  empty: {
    color: '#526579',
    textAlign: 'center',
  },
});
