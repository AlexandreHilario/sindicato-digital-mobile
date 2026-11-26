import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import {
  formatarStatusOcorrencia,
  listarOcorrencias,
  mensagemDeErroOcorrencia,
  type Ocorrencia,
} from '../../src/services/ocorrencias';

export default function OcorrenciasScreen() {
  const router = useRouter();

  const ocorrencias = useQuery({
    queryKey: ['ocorrencias'],
    queryFn: listarOcorrencias,
  });

  // Estado de carregamento
  if (ocorrencias.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Carregando ocorrências...</Text>
      </View>
    );
  }

  // Estado de erro
  if (ocorrencias.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {mensagemDeErroOcorrencia(ocorrencias.error)}
        </Text>
        <Button mode="contained" onPress={() => ocorrencias.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (!ocorrencias.data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Renderização de cada ocorrência
  function renderOcorrencia({ item }: { item: Ocorrencia }) {
    return (
      <Card
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/ocorrencias/[id]',
            params: { id: String(item.id) },
          })
        }
      >
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" style={styles.titulo}>
            {item.titulo}
          </Text>

          <Text variant="bodyMedium" style={styles.descricao}>
            {item.descricao}
          </Text>
          <Text variant="bodySmall" style={styles.metadata}>
            Categoria: {item.categoria_nome ?? '—'}
          </Text>
          <Text variant="bodySmall" style={styles.metadata}>
            {[
              item.bloco ? `Bloco ${item.bloco}` : null,
              item.unidade_numero ? `Unidade ${item.unidade_numero}` : null,
            ].filter(Boolean).join(', ') || 'Unidade não informada'}
          </Text>

          <View style={styles.statusContainer}>
            <Text variant="labelMedium" style={styles.status}>
              Status: {formatarStatusOcorrencia(item.status)}
            </Text>
          </View>

          <Text variant="bodySmall" style={styles.data}>
            {new Date(item.criado_em).toLocaleDateString('pt-BR')}
          </Text>
        </Card.Content>
      </Card>
    );
  }

  // Listagem
  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        style={styles.nova}
        onPress={() => router.push('/ocorrencias/formulario')}
      >
        Nova ocorrência
      </Button>
      <FlatList
        data={ocorrencias.data.ocorrencias}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderOcorrencia}
        contentContainerStyle={
          ocorrencias.data.ocorrencias.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={ocorrencias.isRefetching}
            onRefresh={() => {
              ocorrencias.refetch();
            }}
          />
        }
        ListEmptyComponent={
          <Text variant="bodyLarge" style={styles.message}>
            Nenhuma ocorrência encontrada.
          </Text>
        }
      />
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nova: {
    margin: 16,
    marginBottom: 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  list: {
    gap: 12,
    padding: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 12,
  },
  cardContent: {
    gap: 10,
  },
  titulo: {
    color: '#17324d',
    fontWeight: '700',
  },
  descricao: {
    color: '#526579',
  },
  metadata: {
    color: '#7a8794',
  },
  statusContainer: {
    backgroundColor: '#e8eef5',
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  status: {
    color: '#17324d',
  },
  data: {
    color: '#7a8794',
  },
  message: {
    color: '#526579',
    textAlign: 'center',
  },
});