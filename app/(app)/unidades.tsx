import { useQuery } from '@tanstack/react-query';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { IconBadge } from '../../src/components/icon-badge';
import { QueryState } from '../../src/components/query-state';
import { getMinhasUnidades } from '../../src/services/unidades';
import { useSessionStore } from '../../src/store/session-store';
import { palette, radius, spacing } from '../../src/theme';

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
      emptyIcon="home-search-outline"
      emptyTitle="Nenhuma unidade vinculada"
      emptyMessage="Quando o síndico vincular você a uma unidade, ela aparecerá aqui."
      onRetry={refetch}
    >
      <FlatList
        data={data}
        keyExtractor={(unidade) => String(unidade.id)}
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
            {data?.length === 1 ? '1 unidade vinculada' : `${data?.length ?? 0} unidades vinculadas`}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <IconBadge icon="door-closed" />
            <View style={styles.texts}>
              <Text variant="titleMedium" style={styles.title}>
                Apartamento {item.numero}
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Bloco {item.bloco}
              </Text>
              <View style={styles.tag}>
                <Text variant="labelMedium" style={styles.tagText} numberOfLines={1}>
                  {item.condominio}
                </Text>
              </View>
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
  tag: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: palette.primarySoft,
  },
  tagText: {
    color: palette.primary,
  },
});
