import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Dialog,
  Portal,
  Snackbar,
  Text,
} from 'react-native-paper';

import {
  excluirCategoria,
  listarCategorias,
  mensagemDeErroCategoria,
  type Categoria,
} from '../../src/services/categorias';
import { useSessionStore } from '../../src/store/session-store';
import { podeGerenciar, useUsuarioLogado } from '../../src/services/usuario';

export default function CategoriasScreen() {
  const queryClient = useQueryClient();
  const accessToken = useSessionStore((state) => state.accessToken);
  const usuario = useUsuarioLogado();
  const permitido = podeGerenciar(usuario.data);
  const [excluindo, setExcluindo] = useState<Categoria | null>(null);
  const [sucesso, setSucesso] = useState('');
  const categorias = useQuery({
    queryKey: ['categorias'],
    queryFn: listarCategorias,
    enabled: permitido,
  });

  const exclusao = useMutation({
    mutationFn: excluirCategoria,
    onSuccess: async () => {
      setExcluindo(null);
      setSucesso('Categoria excluída.');
      await queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  function fecharConfirmacao() {
    setExcluindo(null);
    exclusao.reset();
  }

  if (!accessToken) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Faça login para gerenciar categorias.
        </Text>
      </View>
    );
  }

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

  if (!permitido) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Somente administradores e síndicos podem gerenciar categorias.
        </Text>
      </View>
    );
  }

  if (categorias.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (categorias.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {mensagemDeErroCategoria(categorias.error)}
        </Text>
        <Button mode="contained" onPress={() => categorias.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        style={styles.nova}
        onPress={() => router.push('/categorias/formulario')}
      >
        Nova categoria
      </Button>
      <FlatList
        data={categorias.data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={
          categorias.data.length === 0 ? styles.emptyContainer : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={categorias.isRefetching}
            onRefresh={() => {
              categorias.refetch();
            }}
          />
        }
        ListEmptyComponent={
          <Text variant="bodyLarge" style={styles.message}>
            Nenhuma categoria cadastrada.
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <Card.Title
              title={item.nome}
              subtitle={item.descricao || 'Sem descrição'}
            />
            <Card.Actions>
              <Button
                onPress={() =>
                  router.push({
                    pathname: '/categorias/formulario',
                    params: { id: String(item.id) },
                  })
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
        <Dialog
          visible={excluindo !== null}
          onDismiss={fecharConfirmacao}
        >
          <Dialog.Title>Excluir categoria?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              A categoria “{excluindo?.nome}” será removida. Se estiver vinculada
              a ocorrências, a API impedirá a exclusão.
            </Text>
            {exclusao.isError && (
              <Text variant="bodyMedium" style={styles.error}>
                {mensagemDeErroCategoria(exclusao.error)}
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={fecharConfirmacao} disabled={exclusao.isPending}>
              Cancelar
            </Button>
            <Button
              textColor="#b3261e"
              loading={exclusao.isPending}
              disabled={exclusao.isPending}
              onPress={() => {
                if (excluindo) {
                  exclusao.mutate(excluindo.id);
                }
              }}
            >
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Snackbar
          visible={Boolean(sucesso)}
          onDismiss={() => setSucesso('')}
          duration={3000}
        >
          {sucesso}
        </Snackbar>
      </Portal>
    </View>
  );
}

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
  error: {
    color: '#b3261e',
    marginTop: 12,
  },
});
