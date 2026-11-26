
import { useLocalSearchParams } from 'expo-router';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';

import {
  buscarOcorrencia,
  atualizarOcorrencia,
  atualizarStatusOcorrencia,
  formatarStatusOcorrencia,
  mensagemDeErroOcorrencia,
  type StatusOcorrencia,
} from '../../src/services/ocorrencias';

import {
  useUsuarioLogado,
  podeGerenciar,
} from '../../src/services/usuario';

export default function DetalhesOcorrenciaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Usuário e permissões
  const usuario = useUsuarioLogado();
  const podeAlterarStatus = podeGerenciar(usuario.data);

  // Estados da tela
  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [statusSelecionado, setStatusSelecionado] =
    useState<StatusOcorrencia | null>(null);

  // Buscar ocorrência
  const ocorrencia = useQuery({
    queryKey: ['ocorrencia', id],
    queryFn: () => buscarOcorrencia(id),
    enabled: Boolean(id),
  });

  // Mutation para editar ocorrência
  const mutation = useMutation({
    mutationFn: () =>
      atualizarOcorrencia(id, {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
      }),

    onSuccess: (dadosAtualizados) => {
      queryClient.setQueryData(
        ['ocorrencia', id],
        dadosAtualizados,
      );

      queryClient.invalidateQueries({
        queryKey: ['ocorrencias'],
      });

      setEditando(false);
      setMensagem('Ocorrência atualizada com sucesso!');
    },
  });

  // Mutation para atualizar status
  const statusMutation = useMutation({
    mutationFn: () =>
      atualizarStatusOcorrencia(id, {
        status: statusSelecionado!,
      }),

    onSuccess: (dadosAtualizados) => {
      queryClient.setQueryData(
        ['ocorrencia', id],
        dadosAtualizados,
      );

      queryClient.invalidateQueries({
        queryKey: ['ocorrencias'],
      });

      setStatusSelecionado(null);
      setMensagem('Status atualizado com sucesso!');
    },
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

  // Erro ao buscar
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

  // Ocorrência não encontrada
  if (!item) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Ocorrência não encontrada.
        </Text>
      </View>
    );
  }

  // Iniciar edição
  function iniciarEdicao() {
    setTitulo(item.titulo);
    setDescricao(item.descricao);
    setMensagem('');
    mutation.reset();
    setEditando(true);
  }

  // Cancelar edição
  function cancelarEdicao() {
    setTitulo(item.titulo);
    setDescricao(item.descricao);
    setMensagem('');
    mutation.reset();
    setEditando(false);
  }

  // Salvar edição
  function salvarEdicao() {
    if (!titulo.trim() || !descricao.trim()) {
      setMensagem('Preencha o título e a descrição.');
      return;
    }

    setMensagem('');
    mutation.mutate();
  }

  // Selecionar status
  function selecionarStatus(status: StatusOcorrencia) {
    setStatusSelecionado(status);
    setMensagem('');
    statusMutation.reset();
  }

  // Salvar status
  function salvarStatus() {
    const statusAtual = statusSelecionado ?? item.status;

    if (statusAtual === item.status) {
      setMensagem('A ocorrência já está com esse status.');
      return;
    }

    setMensagem('');
    statusMutation.mutate();
  }

  // Status disponíveis
  const statusDisponiveis: StatusOcorrencia[] = [
    'ABERTA',
    'EM_ANDAMENTO',
    'CONCLUIDA',
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          {editando ? (
            <>
              <Text variant="headlineSmall" style={styles.titulo}>
                Editar ocorrência
              </Text>

              <TextInput
                label="Título"
                value={titulo}
                onChangeText={setTitulo}
                mode="outlined"
                style={styles.input}
                maxLength={100}
              />

              <TextInput
                label="Descrição"
                value={descricao}
                onChangeText={setDescricao}
                mode="outlined"
                multiline
                numberOfLines={5}
                style={styles.input}
              />

              {mutation.isError && (
                <Text style={styles.error}>
                  {mensagemDeErroOcorrencia(mutation.error)}
                </Text>
              )}

              {mensagem !== '' && (
                <Text style={styles.error}>{mensagem}</Text>
              )}

              <Button
                mode="contained"
                onPress={salvarEdicao}
                loading={mutation.isPending}
                disabled={mutation.isPending}
                style={styles.button}
              >
                Salvar alterações
              </Button>

              <Button
                mode="outlined"
                onPress={cancelarEdicao}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Text variant="headlineSmall" style={styles.titulo}>
                {item.titulo}
              </Text>

              <View style={styles.statusContainer}>
                <Text variant="labelLarge" style={styles.status}>
                  Status: {formatarStatusOcorrencia(item.status)}
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

              {/* Gerenciamento de status */}
              {podeAlterarStatus && (
                <>
                  <View style={styles.divider} />

                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Gerenciar status
                  </Text>

                  <Text variant="bodyMedium" style={styles.message}>
                    Selecione o novo status da ocorrência:
                  </Text>

                  {statusDisponiveis.map((status) => (
                    <Button
                      key={status}
                      mode={
                        (statusSelecionado ?? item.status) === status
                          ? 'contained'
                          : 'outlined'
                      }
                      onPress={() => selecionarStatus(status)}
                      disabled={statusMutation.isPending}
                      style={styles.statusButton}
                    >
                      {formatarStatusOcorrencia(status)}
                    </Button>
                  ))}

                  {statusMutation.isError && (
                    <Text style={styles.error}>
                      {mensagemDeErroOcorrencia(statusMutation.error)}
                    </Text>
                  )}

                  <Button
                    mode="contained"
                    onPress={salvarStatus}
                    loading={statusMutation.isPending}
                    disabled={statusMutation.isPending}
                    style={styles.button}
                  >
                    Salvar status
                  </Button>
                </>
              )}

              {mensagem !== '' && (
                <Text
                  style={
                    statusMutation.isError || mutation.isError
                      ? styles.error
                      : styles.success
                  }
                >
                  {mensagem}
                </Text>
              )}

              <Button
                mode="contained"
                onPress={iniciarEdicao}
                style={styles.button}
              >
                Editar ocorrência
              </Button>
            </>
          )}
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

  input: {
    backgroundColor: '#fff',
  },

  button: {
    marginTop: 8,
  },

  statusButton: {
    marginTop: 4,
  },

  error: {
    color: '#b3261e',
  },

  success: {
    color: '#267344',
    fontWeight: '600',
  },

  message: {
    color: '#526579',
    textAlign: 'center',
  },
});
