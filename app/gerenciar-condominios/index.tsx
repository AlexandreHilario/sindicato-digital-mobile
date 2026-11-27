import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import {
  listarTodosCondominios,
  mensagemDeErroCondominio,
} from '../../src/services/condominios';
import { useUsuarioLogado } from '../../src/services/usuario';

export default function CondominiosAdminScreen() {
  const usuario = useUsuarioLogado();
  const administrador = usuario.data?.tipo === 'ADMIN';

  const condominios = useQuery({
    queryKey: ['condominios'],
    queryFn: listarTodosCondominios,
    enabled: administrador,
  });

  if (usuario.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (usuario.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Não foi possível verificar suas permissões.
        </Text>
        <Button mode="contained" onPress={() => usuario.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (!administrador) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Somente administradores podem gerenciar condomínios.
        </Text>
      </View>
    );
  }

  if (condominios.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (condominios.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {mensagemDeErroCondominio(condominios.error)}
        </Text>
        <Button mode="contained" onPress={() => condominios.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        style={styles.novo}
        onPress={() => router.push('/gerenciar-condominios/formulario')}
      >
        Novo condomínio
      </Button>
      <FlatList
        data={condominios.data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={
          condominios.data.length === 0 ? styles.emptyContainer : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={condominios.isRefetching}
            onRefresh={() => {
              condominios.refetch();
            }}
          />
        }
        ListEmptyComponent={
          <Text variant="bodyLarge" style={styles.message}>
            Nenhum condomínio cadastrado.
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <Card.Title title={item.nome} subtitle={`Código ${item.codigo}`} />
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  novo: {
    margin: 16,
    marginBottom: 0,
  },
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
