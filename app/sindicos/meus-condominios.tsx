import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import {
  listarMeusCondominios,
  mensagemDeErroSindico,
} from '../../src/services/sindicos';
import { useSessionStore } from '../../src/store/session-store';
import { useUsuarioLogado } from '../../src/services/usuario';

export default function MeusCondominiosScreen() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const usuario = useUsuarioLogado();
  const permitido = usuario.data?.tipo === 'SINDICO';
  const condominios = useQuery({
    queryKey: ['meus-condominios', accessToken],
    queryFn: listarMeusCondominios,
    enabled: permitido,
  });

  if (usuario.isPending || (permitido && condominios.isPending)) {
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
          Não foi possível verificar seu perfil.
        </Text>
        <Button mode="contained" onPress={() => usuario.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (!permitido) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Esta área está disponível apenas para síndicos.
        </Text>
      </View>
    );
  }

  if (condominios.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {mensagemDeErroSindico(condominios.error)}
        </Text>
        <Button mode="contained" onPress={() => condominios.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (!condominios.data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
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
          Você não tem condomínios vinculados.
        </Text>
      }
      renderItem={({ item }) => (
        <Card>
          <Card.Title title={item.nome} subtitle={`ID ${item.id}`} />
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
