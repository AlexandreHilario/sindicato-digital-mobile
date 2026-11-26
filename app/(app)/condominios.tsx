import { useQuery } from '@tanstack/react-query';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Card, Icon, Text } from 'react-native-paper';
import { QueryState } from '../../src/components/query-state';
import { getMeusCondominios } from '../../src/services/condominios';
import { useSessionStore } from '../../src/store/session-store';

export default function CondominiosScreen() {
  const usuarioId = useSessionStore((state) => state.usuario?.id);
  const { data, error, isPending, isRefetching, refetch } = useQuery({
    queryKey: ['me', usuarioId, 'condominios'],
    queryFn: getMeusCondominios,
  });

  return (
    <QueryState
      isPending={isPending}
      error={error}
      isEmpty={data?.length === 0}
      emptyIcon="office-building-remove-outline"
      emptyMessage="Nenhum condomínio está associado à sua conta. Peça a um administrador para fazer a associação."
      onRetry={refetch}
    >
      <FlatList
        data={data}
        keyExtractor={(condominio) => condominio.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        ListHeaderComponent={
          <Text variant="bodyMedium" style={styles.count}>
            {data?.length === 1 ? '1 condomínio' : `${data?.length ?? 0} condomínios`}
          </Text>
        }
        renderItem={({ item }) => (
          <Card mode="outlined" style={styles.card}>
            <Card.Title
              title={item.nome}
              subtitle={`Código: ${item.codigo}`}
              left={({ size }) => <Icon source="office-building" size={size} color="#17324d" />}
            />
          </Card>
        )}
      />
    </QueryState>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
    padding: 24,
  },
  count: {
    color: '#526579',
  },
  card: {
    backgroundColor: '#ffffff',
  },
});
