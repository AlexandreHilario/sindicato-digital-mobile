import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Card, Text, Button } from 'react-native-paper';

import {
  listarMinhasUnidades,
  mensagemDeErroVinculo,
} from '../../src/services/unidades';
import { useSessionStore } from '../../src/store/session-store';
import { useUsuarioLogado } from '../../src/services/usuario';

export default function MinhasUnidadesScreen() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const usuario = useUsuarioLogado();
  const permitido = usuario.data?.tipo === 'MORADOR';
  const [atualizando, setAtualizando] = useState(false);
  const unidades = useQuery({
    queryKey: ['minhas-unidades', accessToken],
    queryFn: listarMinhasUnidades,
    enabled: permitido,
  });

  if (usuario.isPending || (permitido && unidades.isPending)) {
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
          Esta área está disponível apenas para moradores.
        </Text>
      </View>
    );
  }

  if (unidades.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {mensagemDeErroVinculo(unidades.error)}
        </Text>
        <Button mode="contained" onPress={() => unidades.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (!unidades.data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  async function atualizar() {
    setAtualizando(true);
    await unidades.refetch();
    setAtualizando(false);
  }

  return (
    <FlatList
      data={unidades.data}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={
        unidades.data.length === 0 ? styles.emptyContainer : styles.list
      }
      refreshControl={
        <RefreshControl refreshing={atualizando} onRefresh={atualizar} />
      }
      ListEmptyComponent={
        <Text variant="bodyLarge" style={styles.message}>
          Você não tem unidades vinculadas.
        </Text>
      }
      renderItem={({ item }) => (
        <Card>
          <Card.Title
            title={`Unidade ${item.numero}`}
            subtitle={`Bloco ${item.bloco}`}
          />
          <Card.Content>
            <Text variant="bodyMedium">
              Condomínio:{' '}
              {item.condominio_nome ??
                item.condominio?.nome ??
                `ID ${item.condominio_id}`}
            </Text>
          </Card.Content>
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
