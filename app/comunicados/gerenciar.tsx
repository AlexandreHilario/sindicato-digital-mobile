import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button, Card, Dialog, Portal, Text } from 'react-native-paper';

import {
  type Comunicado,
  excluirComunicado,
  formatarData,
  listarComunicados,
  listarMeusComunicados,
  mensagemDeErro,
} from '../../src/services/comunicados';
import { podeGerenciar, useUsuarioLogado } from '../../src/services/usuario';

export default function GerenciarScreen() {
  const queryClient = useQueryClient();
  const usuario = useUsuarioLogado();
  const admin = usuario.data?.tipo === 'ADMIN';
  const [excluindo, setExcluindo] = useState<Comunicado | null>(null);

  const lista = useQuery({
    queryKey: admin ? ['comunicados'] : ['comunicados', 'meus'],
    queryFn: admin ? listarComunicados : listarMeusComunicados,
    enabled: podeGerenciar(usuario.data),
  });

  const exclusao = useMutation({
    mutationFn: excluirComunicado,
    onSuccess: async () => {
      setExcluindo(null);
      await queryClient.invalidateQueries({ queryKey: ['comunicados'] });
    },
  });

  function fecharDialogo() {
    setExcluindo(null);
    exclusao.reset();
  }

  if (usuario.isLoading) {
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
          {mensagemDeErro(usuario.error)}
        </Text>
        <Button mode="contained" onPress={() => usuario.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (!podeGerenciar(usuario.data)) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Você não tem permissão para gerenciar comunicados.
        </Text>
      </View>
    );
  }

  if (lista.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (lista.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {mensagemDeErro(lista.error)}
        </Text>
        <Button mode="contained" onPress={() => lista.refetch()}>
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
        onPress={() => router.push('/comunicados/formulario')}
      >
        Novo comunicado
      </Button>
      <FlatList
        data={lista.data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={lista.data.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={lista.isRefetching}
            onRefresh={async () => {
              await lista.refetch();
            }}
          />
        }
        ListEmptyComponent={
          <Text variant="bodyLarge" style={styles.message}>
            Nenhum comunicado publicado.
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <Card.Title
              title={item.titulo}
              subtitle={`${item.autor_nome} • ${formatarData(item.criado_em)}`}
            />
            <Card.Actions>
              <Button
                onPress={() =>
                  router.push({ pathname: '/comunicados/formulario', params: { id: String(item.id) } })
                }
              >
                Editar
              </Button>
              <Button textColor="#b3261e" onPress={() => setExcluindo(item)}>
                Excluir
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
      <Portal>
        <Dialog visible={excluindo !== null} onDismiss={fecharDialogo}>
          <Dialog.Title>Excluir comunicado?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              “{excluindo?.titulo}” será removido do mural. Esta ação não pode ser desfeita.
            </Text>
            {exclusao.isError && (
              <Text variant="bodyMedium" style={styles.erro}>
                {mensagemDeErro(exclusao.error)}
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={fecharDialogo} disabled={exclusao.isPending}>
              Cancelar
            </Button>
            <Button
              textColor="#b3261e"
              loading={exclusao.isPending}
              disabled={exclusao.isPending}
              onPress={() => excluindo && exclusao.mutate(excluindo.id)}
            >
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  erro: {
    color: '#b3261e',
    marginTop: 12,
  },
});
