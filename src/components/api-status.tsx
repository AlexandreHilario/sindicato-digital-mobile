import { useQuery } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';
import { API_URL, checkHealth } from '../services/api';
import { getErrorMessage } from '../services/api-error';

/** Cartão que consulta GET /health e mostra se o backend está acessível. */
export function ApiStatus() {
  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    retry: false,
  });

  return (
    <Card mode="outlined">
      <Card.Content style={styles.content}>
        <Text variant="titleSmall">Conexão com a API</Text>
        <Text variant="bodySmall" style={styles.url}>
          {API_URL || 'EXPO_PUBLIC_API_URL não definido'}
        </Text>

        {isPending ? (
          <View style={styles.row}>
            <ActivityIndicator size="small" />
            <Text variant="bodyMedium">Verificando...</Text>
          </View>
        ) : error ? (
          <Text variant="bodyMedium" style={styles.error}>
            {getErrorMessage(error)}
          </Text>
        ) : (
          <Text variant="bodyMedium" style={styles.ok}>
            {data?.message ?? 'API disponível'}
          </Text>
        )}
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => refetch()} loading={isFetching} disabled={isFetching}>
          Testar novamente
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 6,
  },
  url: {
    color: '#526579',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ok: {
    color: '#1b7f3b',
  },
  error: {
    color: '#b3261e',
  },
});
