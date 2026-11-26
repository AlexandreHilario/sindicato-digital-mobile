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
import { Button, Card, Dialog, Portal, Text } from 'react-native-paper';

import {
  type Apartamento,
  excluirApartamento,
  listarApartamentos,
  mensagemDeErroApartamento,
} from '../../src/services/apartamentos';
import {
  listarCondominiosDoSindico,
  type Condominio,
} from '../../src/services/sindicos';
import { podeGerenciar, useUsuarioLogado } from '../../src/services/usuario';

function idDoCondominio(condominio: Condominio) {
  return (
    condominio.condominio_id ??
    condominio.id ??
    condominio.condominio?.id
  );
}

export default function ApartamentosScreen() {
  const queryClient = useQueryClient();
  const usuario = useUsuarioLogado();
  const podeGerenciarApartamento = podeGerenciar(usuario.data);
  const sindico = usuario.data?.tipo === 'SINDICO';
  const [excluindo, setExcluindo] = useState<Apartamento | null>(null);

  const lista = useQuery({
    queryKey: ['apartamentos'],
    queryFn: listarApartamentos,
    enabled: podeGerenciarApartamento,
  });

  const condominios = useQuery({
    queryKey: ['condominios-sindico'],
    queryFn: listarCondominiosDoSindico,
    enabled: sindico,
  });

  const exclusao = useMutation({
    mutationFn: excluirApartamento,
    onSuccess: async () => {
      setExcluindo(null);
      await queryClient.invalidateQueries({ queryKey: ['apartamentos'] });
    },
  });

  function fecharDialogo() {
    setExcluindo(null);
    exclusao.reset();
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

  if (!podeGerenciarApartamento) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Você não tem permissão para gerenciar apartamentos.
        </Text>
      </View>
    );
  }

  if (lista.isPending || (sindico && condominios.isPending)) {
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
          {mensagemDeErroApartamento(lista.error)}
        </Text>
        <Button mode="contained" onPress={() => lista.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (sindico && condominios.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Não foi possível carregar os condomínios associados.
        </Text>
        <Button mode="contained" onPress={() => condominios.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  const apartamentosExibidos = sindico
    ? lista.data.filter((apartamento) => {
        const condominiosAssociados = new Set(
          (condominios.data ?? [])
            .map(idDoCondominio)
            .filter((id): id is number => id !== undefined),
        );
        return condominiosAssociados.has(apartamento.condominio_id);
      })
    : lista.data;

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        style={styles.novo}
        onPress={() => router.push('/apartamentos/formulario')}
      >
        Adicionar apartamento
      </Button>
      <FlatList
        data={apartamentosExibidos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={
          apartamentosExibidos.length === 0
            ? styles.emptyContainer
            : styles.list
        }
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
            Nenhum apartamento encontrado.
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <Card.Title
              title={`Apartamento ${item.numero}`}
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
            <Card.Actions>
              <Button
                onPress={() =>
                  router.push({
                    pathname: '/apartamentos/formulario',
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
        <Dialog visible={excluindo !== null} onDismiss={fecharDialogo}>
          <Dialog.Title>Excluir apartamento?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              O apartamento {excluindo?.numero}, bloco {excluindo?.bloco}, será removido.
              Esta ação não pode ser desfeita.
            </Text>
            {exclusao.isError && (
              <Text variant="bodyMedium" style={styles.erro}>
                {mensagemDeErroApartamento(exclusao.error)}
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
