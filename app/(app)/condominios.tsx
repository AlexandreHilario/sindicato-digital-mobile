import { useQuery } from '@tanstack/react-query';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { IconBadge } from '../../src/components/icon-badge';
import { QueryState } from '../../src/components/query-state';
import { getMeusCondominios } from '../../src/services/condominios';
import { useSessionStore } from '../../src/store/session-store';
import { palette, radius, spacing } from '../../src/theme';

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
      emptyTitle="Nenhum condomínio associado"
      emptyMessage="Quando um administrador associar você a um condomínio, ele aparecerá aqui."
      onRetry={refetch}
    >
      <FlatList
        data={data}
        keyExtractor={(condominio) => condominio.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
        ListHeaderComponent={
          <Text variant="bodyMedium" style={styles.count}>
            {data?.length === 1
              ? '1 condomínio sob sua administração'
              : `${data?.length ?? 0} condomínios sob sua administração`}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <IconBadge icon="office-building" />
            <View style={styles.texts}>
              <Text variant="titleMedium" style={styles.title}>
                {item.nome}
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Código {item.codigo}
              </Text>
            </View>
          </View>
        )}
      />
    </QueryState>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
    padding: spacing.lg,
  },
  count: {
    color: palette.textMuted,
    marginBottom: spacing.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: palette.text,
    fontWeight: '600',
  },
  subtitle: {
    color: palette.textMuted,
  },
});
