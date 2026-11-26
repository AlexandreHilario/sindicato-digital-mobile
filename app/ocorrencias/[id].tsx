import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Card, Text } from 'react-native-paper';

import {
  buscarOcorrencia,
  formatarStatusOcorrencia,
  mensagemDeErroOcorrencia,
} from '../../src/services/ocorrencias';

export default function DetalhesOcorrenciaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const ocorrencia = useQuery({
    queryKey: ['ocorrencia', id],
    queryFn: () => buscarOcorrencia(id),
    enabled: Boolean(id),
  });

  // Carregamento
  if (ocorrencia.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Carregando detalhes da ocorrência...</Text>
      </View>
    );
  }

  // Erro
  if (ocorrencia.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {mensagemDeErroOcorrencia(ocorrencia.error)}
        </Text>
      </View>
    );
  }

  const item = ocorrencia.data;

  // Proteção caso não exista informação
  if (!item) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Ocorrência não encontrada.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall" style={styles.titulo}>
            {item.titulo}
          </Text>

          <View style={styles.statusContainer}>
            <Text variant="labelLarge" style={styles.status}>
              {formatarStatusOcorrencia(item.status)}
            </Text>
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Descrição
          </Text>

          <Text variant="bodyLarge" style={styles.descricao}>
            {item.descricao}
          </Text>

          <View style={styles.divider} />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Informações da ocorrência
          </Text>

          <Text variant="bodyMedium" style={styles.info}>
            <Text style={styles.label}>ID: </Text>
            {item.id}
          </Text>

          <Text variant="bodyMedium" style={styles.info}>
            <Text style={styles.label}>Criada em: </Text>
            {new Date(item.criado_em).toLocaleString('pt-BR')}
          </Text>

          <Text variant="bodyMedium" style={styles.info}>
            <Text style={styles.label}>Última atualização: </Text>
            {new Date(item.atualizado_em).toLocaleString('pt-BR')}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  card: {
    borderRadius: 12,
  },
  content: {
    gap: 16,
  },
  titulo: {
    color: '#17324d',
    fontWeight: '700',
  },
  statusContainer: {
    backgroundColor: '#e8eef5',
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  status: {
    color: '#17324d',
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#17324d',
    fontWeight: '700',
  },
  descricao: {
    color: '#526579',
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e6ed',
  },
  info: {
    color: '#526579',
  },
  label: {
    fontWeight: '700',
    color: '#17324d',
  },
  message: {
    color: '#526579',
    textAlign: 'center',
  },
});