import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import { formatarData, listarComunicados, mensagemDeErro } from '../../src/services/comunicados';

export default function MuralScreen() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['comunicados'],
    queryFn: listarComunicados,
  });
  const [atualizando, setAtualizando] = useState(false);

  async function atualizar() {
    setAtualizando(true);
    await refetch();
    setAtualizando(false);
  }

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {mensagemDeErro(error)}
        </Text>
        <Button mode="contained" onPress={() => refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={data.length === 0 ? styles.emptyContainer : styles.list}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}
      ListEmptyComponent={
        <Text variant="bodyLarge" style={styles.message}>
          O mural está vazio.
        </Text>
      }
      renderItem={({ item }) => (
        <Card onPress={() => router.push(`/comunicados/${item.id}`)}>
          <Card.Title
            title={item.titulo}
            subtitle={`${item.autor_nome} • ${formatarData(item.criado_em)}`}
          />
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  list: {
    gap: 12,
    padding: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    color: '#526579',
    textAlign: 'center',
  },
});
