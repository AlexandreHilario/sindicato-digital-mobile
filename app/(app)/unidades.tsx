import { useQuery } from '@tanstack/react-query';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Card, Icon, Text } from 'react-native-paper';
import { QueryState } from '../../src/components/query-state';
import { getMinhasUnidades } from '../../src/services/unidades';
import { useSessionStore } from '../../src/store/session-store';

export default function UnidadesScreen() {
  const usuarioId = useSessionStore((state) => state.usuario?.id);
  const { data, error, isPending, isRefetching, refetch } = useQuery({
    queryKey: ['me', usuarioId, 'unidades'],
    queryFn: getMinhasUnidades,
  });

  return (
    <QueryState
      isPending={isPending}
      error={error}
      isEmpty={data?.length === 0}
      emptyIcon="home-off-outline"
      emptyMessage="Você ainda não está vinculado a nenhuma unidade. Procure o síndico do seu condomínio."
      onRetry={refetch}
    >
      <FlatList
        data={data}
        keyExtractor={(unidade) => unidade.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        ListHeaderComponent={
          <Text variant="bodyMedium" style={styles.count}>
            {data?.length === 1 ? '1 unidade' : `${data?.length ?? 0} unidades`}
          </Text>
        }
        renderItem={({ item }) => (
          <Card mode="outlined" style={styles.card}>
            <Card.Title
              title={`Bloco ${item.bloco} · Apto ${item.numero}`}
              subtitle={item.condominio}
              left={({ size }) => <Icon source="door" size={size} color="#17324d" />}
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
