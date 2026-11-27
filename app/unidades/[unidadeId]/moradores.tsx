import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Dialog,
  HelperText,
  Portal,
  Snackbar,
  Text,
} from 'react-native-paper';

import {
  associarMorador,
  buscarUnidadePorId,
  desassociarMorador,
  listarMoradoresDaUnidade,
  mensagemDeErroVinculo,
  type MoradorVinculado,
} from '../../../src/services/unidades';
import { listarMeusCondominios } from '../../../src/services/sindicos';
import {
  listarUsuarios,
  podeGerenciar,
  useUsuarioLogado,
} from '../../../src/services/usuario';

function MoradoresDaUnidade({ unidadeId }: { unidadeId: number }) {
  const queryClient = useQueryClient();
  const usuario = useUsuarioLogado();
  const permitido = podeGerenciar(usuario.data);
  const sindico = usuario.data?.tipo === 'SINDICO';
  const [adicionarAberto, setAdicionarAberto] = useState(false);
  const [removendo, setRemovendo] = useState<MoradorVinculado | null>(null);
  const [sucesso, setSucesso] = useState('');

  const unidade = useQuery({
    queryKey: ['unidades', unidadeId],
    queryFn: () => buscarUnidadePorId(unidadeId),
    enabled: permitido,
  });
  const condominios = useQuery({
    queryKey: ['meus-condominios'],
    queryFn: listarMeusCondominios,
    enabled: permitido && sindico,
  });
  const unidadeNoEscopo =
    !sindico ||
    Boolean(
      unidade.data &&
        condominios.data?.some(
        (condominio) =>
          String(condominio.id) === String(unidade.data?.condominio_id),
        ),
    );
  const escopoVerificado =
    !sindico || (unidade.isSuccess && condominios.isSuccess);
  const podeGerenciarUnidade =
    permitido && escopoVerificado && unidadeNoEscopo;
  const moradores = useQuery({
    queryKey: ['moradores-unidade', unidadeId],
    queryFn: () => listarMoradoresDaUnidade(unidadeId),
    enabled: podeGerenciarUnidade,
  });
  const usuarios = useQuery({
    queryKey: ['usuarios'],
    queryFn: listarUsuarios,
    enabled: podeGerenciarUnidade && adicionarAberto,
  });

  const associacao = useMutation({
    mutationFn: (usuarioId: number) => associarMorador(unidadeId, usuarioId),
    onSuccess: async () => {
      setAdicionarAberto(false);
      setSucesso('Morador associado à unidade.');
      await queryClient.invalidateQueries({
        queryKey: ['moradores-unidade', unidadeId],
      });
      await queryClient.invalidateQueries({ queryKey: ['minhas-unidades'] });
      await queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });
    },
  });
  const desassociacao = useMutation({
    mutationFn: (usuarioId: number) => desassociarMorador(unidadeId, usuarioId),
    onSuccess: async () => {
      setRemovendo(null);
      setSucesso('Vínculo removido. A conta do morador continua ativa.');
      await queryClient.invalidateQueries({
        queryKey: ['moradores-unidade', unidadeId],
      });
      await queryClient.invalidateQueries({ queryKey: ['minhas-unidades'] });
      await queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });
    },
  });

  if (
    usuario.isPending ||
    (permitido &&
      (unidade.isPending ||
        (sindico && condominios.isPending) ||
        (podeGerenciarUnidade && moradores.isPending)))
  ) {
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
          Você não tem permissão para gerenciar moradores.
        </Text>
      </View>
    );
  }

  if (unidade.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Não foi possível consultar os dados da unidade. O vínculo não foi
          carregado.
        </Text>
        <Button mode="contained" onPress={() => unidade.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (!unidade.data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (sindico && condominios.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Não foi possível verificar os condomínios que você administra.
        </Text>
        <Button mode="contained" onPress={() => condominios.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (sindico && !unidadeNoEscopo) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Esta unidade não pertence a um condomínio que você administra.
        </Text>
      </View>
    );
  }

  if (moradores.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {mensagemDeErroVinculo(moradores.error)}
        </Text>
        <Button mode="contained" onPress={() => moradores.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (!moradores.data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const vinculadosIds = new Set(moradores.data.map((morador) => String(morador.id)));
  const candidatos =
    usuarios.data?.filter(
      (item) =>
        item.tipo === 'MORADOR' &&
        Number.isSafeInteger(Number(item.id)) &&
        Number(item.id) > 0 &&
        !vinculadosIds.has(String(item.id)),
    ) ?? [];
  const nomeCondominio =
    unidade.data.condominio_nome ??
    (typeof unidade.data.condominio === 'string'
      ? unidade.data.condominio
      : unidade.data.condominio?.nome);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge">
          Unidade {unidade.data.numero}
        </Text>
        <Text variant="bodyMedium">
          Bloco {unidade.data.bloco} • Condomínio{' '}
          {nomeCondominio ?? `ID ${unidade.data.condominio_id}`}
        </Text>
      </View>
      <Button
        mode="contained"
        style={styles.addButton}
        onPress={() => {
          associacao.reset();
          setAdicionarAberto(true);
        }}
      >
        Adicionar morador
      </Button>
      <FlatList
        data={moradores.data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={
          moradores.data.length === 0 ? styles.emptyContainer : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={moradores.isRefetching}
            onRefresh={async () => {
              await moradores.refetch();
            }}
          />
        }
        ListEmptyComponent={
          <Text variant="bodyLarge" style={styles.message}>
            Nenhum morador está vinculado a esta unidade.
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <Card.Title title={item.nome} subtitle={item.email} />
            <Card.Actions>
              <Button textColor="#b3261e" onPress={() => setRemovendo(item)}>
                Remover vínculo
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
      <Portal>
        <Dialog
          visible={adicionarAberto}
          onDismiss={() => setAdicionarAberto(false)}
        >
          <Dialog.Title>Adicionar morador</Dialog.Title>
          <Dialog.Content>
            {usuarios.isPending ? (
              <ActivityIndicator />
            ) : usuarios.isError ? (
              <>
                <Text variant="bodyMedium" style={styles.message}>
                  {mensagemDeErroVinculo(usuarios.error)}
                </Text>
                <Button onPress={() => usuarios.refetch()}>
                  Tentar novamente
                </Button>
              </>
            ) : candidatos.length === 0 ? (
              <Text variant="bodyMedium" style={styles.message}>
                Não há moradores disponíveis para associar.
              </Text>
            ) : (
              <ScrollView style={styles.candidates}>
                {candidatos.map((item) => (
                  <Card key={String(item.id)} style={styles.candidate}>
                    <Card.Title title={item.nome} subtitle={item.email} />
                    <Card.Actions>
                      <Button
                        loading={
                          associacao.isPending &&
                          String(associacao.variables) === String(item.id)
                        }
                        disabled={associacao.isPending}
                        onPress={() => associacao.mutate(Number(item.id))}
                      >
                        Associar
                      </Button>
                    </Card.Actions>
                  </Card>
                ))}
              </ScrollView>
            )}
            {associacao.isError && (
              <HelperText type="error" visible>
                {mensagemDeErroVinculo(associacao.error)}
              </HelperText>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setAdicionarAberto(false)}
              disabled={associacao.isPending}
            >
              Fechar
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={removendo !== null}
          onDismiss={() => setRemovendo(null)}
        >
          <Dialog.Title>Remover vínculo?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {removendo?.nome} deixará de estar associado a esta unidade. A
              conta do morador não será excluída.
            </Text>
            {desassociacao.isError && (
              <HelperText type="error" visible>
                {mensagemDeErroVinculo(desassociacao.error)}
              </HelperText>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setRemovendo(null);
                desassociacao.reset();
              }}
              disabled={desassociacao.isPending}
            >
              Cancelar
            </Button>
            <Button
              textColor="#b3261e"
              loading={desassociacao.isPending}
              disabled={desassociacao.isPending}
              onPress={() => {
                if (removendo) {
                  desassociacao.mutate(Number(removendo.id));
                }
              }}
            >
              Remover vínculo
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

export default function MoradoresScreen() {
  const { unidadeId } = useLocalSearchParams<{ unidadeId?: string }>();
  const unidadeIdNumero = Number(unidadeId);

  if (
    !unidadeId ||
    !/^\d+$/.test(unidadeId) ||
    !Number.isSafeInteger(unidadeIdNumero) ||
    unidadeIdNumero <= 0
  ) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          O ID da unidade informado é inválido.
        </Text>
      </View>
    );
  }

  return <MoradoresDaUnidade unidadeId={unidadeIdNumero} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  addButton: {
    marginHorizontal: 16,
    marginTop: 12,
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
  candidates: {
    maxHeight: 360,
  },
  candidate: {
    marginBottom: 8,
  },
  message: {
    color: '#526579',
    textAlign: 'center',
  },
});
