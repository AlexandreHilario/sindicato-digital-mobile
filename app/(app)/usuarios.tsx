
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Dialog,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';

import {
  listarApartamentos,
  type Apartamento,
} from '../../src/services/apartamentos';
import { getErrorMessage } from '../../src/services/api-error';
import {
  type TipoUsuario,
  type Usuario,
  atualizarUsuario,
  criarUsuario,
  excluirUsuario,
  listarUsuarios,
  useUsuarioLogado,
} from '../../src/services/usuario';

const TIPOS: { label: string; value: TipoUsuario }[] = [
  { label: 'Morador', value: 'MORADOR' },
  { label: 'Síndico', value: 'SINDICO' },
  { label: 'Administrador', value: 'ADMIN' },
];

export default function UsuariosScreen() {
  const queryClient = useQueryClient();
  const sessao = useUsuarioLogado();
  const admin = sessao.data?.tipo === 'ADMIN';

  const [formVisivel, setFormVisivel] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [excluindo, setExcluindo] = useState<Usuario | null>(null);
  const [apartamentoVisivel, setApartamentoVisivel] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState<TipoUsuario>('MORADOR');
  const [unidadeId, setUnidadeId] = useState('');
  const [erroValidacao, setErroValidacao] = useState('');

  const lista = useQuery<Usuario[]>({
    queryKey: ['usuarios'],
    queryFn: listarUsuarios,
    enabled:
      sessao.data?.tipo === 'ADMIN' || sessao.data?.tipo === 'SINDICO',
  });

  const apartamentos = useQuery<Apartamento[]>({
    queryKey: ['apartamentos'],
    queryFn: listarApartamentos,
    enabled: formVisivel && tipo === 'MORADOR',
  });

  const cadastro = useMutation({
    mutationFn: criarUsuario,
    onSuccess: async () => {
      fecharFormulario();
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const edicao = useMutation({
    mutationFn: ({
      id,
      dados,
    }: {
      id: string;
      dados: { nome: string; email: string; senha?: string };
    }) => atualizarUsuario(id, dados),
    onSuccess: async () => {
      fecharFormulario();
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const exclusao = useMutation({
    mutationFn: excluirUsuario,
    onSuccess: async () => {
      setExcluindo(null);
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  function limparFormulario() {
    setNome('');
    setEmail('');
    setSenha('');
    setTipo('MORADOR');
    setUnidadeId('');
    setEditando(null);
    setErroValidacao('');
    cadastro.reset();
    edicao.reset();
  }

  function fecharFormulario() {
    setFormVisivel(false);
    limparFormulario();
  }

  function abrirCadastro() {
    limparFormulario();
    setFormVisivel(true);
  }

  function abrirEdicao(usuario: Usuario) {
    setEditando(usuario);
    setNome(usuario.nome);
    setEmail(usuario.email);
    setSenha('');
    setFormVisivel(true);
  }

  function salvar() {
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();

    setErroValidacao('');

    if (nomeLimpo.length < 2) {
      setErroValidacao('O nome deve ter ao menos 2 caracteres.');
      return;
    }

    if (!emailLimpo.includes('@')) {
      setErroValidacao('Informe um e-mail válido.');
      return;
    }

    if (senha && senha.length < 6) {
      setErroValidacao('A senha deve ter ao menos 6 caracteres.');
      return;
    }

    if (editando) {
      edicao.mutate({
        id: String(editando.id),
        dados: {
          nome: nomeLimpo,
          email: emailLimpo,
          ...(senha ? { senha } : {}),
        },
      });
      return;
    }

    if (!senha) {
      setErroValidacao('Informe uma senha.');
      return;
    }

    if (tipo === 'MORADOR' && !unidadeId) {
      setErroValidacao('Selecione um apartamento.');
      return;
    }

    cadastro.mutate({
      nome: nomeLimpo,
      email: emailLimpo,
      senha,
      tipo,
      ...(tipo === 'MORADOR' ? { unidadeId } : {}),
    });
  }

  function nomeApartamento(item: Apartamento) {
    return `Bloco ${item.bloco ?? '—'} • Apartamento ${item.numero}`;
  }

  const salvando = cadastro.isPending || edicao.isPending;
  const erroFormulario = cadastro.error || edicao.error;

  const apartamentoSelecionado = apartamentos.data?.find(
    (item) => String(item.id) === unidadeId,
  );

  if (sessao.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (sessao.isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          {getErrorMessage(sessao.error)}
        </Text>
        <Button
          mode="contained"
          onPress={() => {
            void sessao.refetch();
          }}
        >
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (
    sessao.data?.tipo !== 'ADMIN' &&
    sessao.data?.tipo !== 'SINDICO'
  ) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Você não tem permissão para gerenciar usuários.
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
        <Text style={styles.message}>
          {getErrorMessage(lista.error)}
        </Text>
        <Button
          mode="contained"
          onPress={() => {
            void lista.refetch();
          }}
        >
          Tentar novamente
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        icon="account-plus"
        style={styles.novo}
        onPress={abrirCadastro}
      >
        Novo usuário
      </Button>

      <FlatList
        data={lista.data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={
          lista.data.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={lista.isRefetching}
            onRefresh={() => {
              void lista.refetch();
            }}
          />
        }
        ListEmptyComponent={
          <Text style={styles.message}>
            Nenhum usuário encontrado.
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <Card.Title
              title={item.nome}
              subtitle={`${item.email} • ${
                TIPOS.find((t) => t.value === item.tipo)?.label ??
                item.tipo
              }`}
              left={(props) => (
                <Avatar.Icon
                  {...props}
                  icon="account"
                  size={42}
                />
              )}
            />
            <Card.Actions>
              <Button onPress={() => abrirEdicao(item)}>
                Editar
              </Button>
              <Button
                textColor="#b3261e"
                onPress={() => setExcluindo(item)}
              >
                Excluir
              </Button>
            </Card.Actions>
          </Card>
        )}
      />

      <Portal>
        <Dialog
          visible={formVisivel}
          onDismiss={fecharFormulario}
          style={styles.dialog}
        >
          <Dialog.Title>
            {editando ? 'Editar usuário' : 'Novo usuário'}
          </Dialog.Title>

          <Dialog.ScrollArea>
            <View style={styles.form}>
              <TextInput
                label="Nome completo"
                value={nome}
                onChangeText={setNome}
                mode="outlined"
                autoCapitalize="words"
              />

              <TextInput
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                label={editando ? 'Nova senha (opcional)' : 'Senha'}
                value={senha}
                onChangeText={setSenha}
                mode="outlined"
                secureTextEntry
              />

              {!editando && (
                <>
                  <Text variant="labelLarge">
                    Tipo de usuário
                  </Text>

                  {TIPOS.filter(
                    (item) => admin || item.value === 'MORADOR',
                  ).map((item) => (
                    <Button
                      key={item.value}
                      mode={
                        tipo === item.value ? 'contained' : 'outlined'
                      }
                      onPress={() => {
                        setTipo(item.value);
                        setUnidadeId('');
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </>
              )}

              {!editando && tipo === 'MORADOR' && (
                <>
                  <Text variant="labelLarge">
                    Apartamento obrigatório
                  </Text>

                  <Button
                    mode="outlined"
                    icon="home-city-outline"
                    onPress={() => setApartamentoVisivel(true)}
                  >
                    {apartamentoSelecionado
                      ? nomeApartamento(apartamentoSelecionado)
                      : 'Selecionar apartamento'}
                  </Button>

                  {apartamentos.isLoading && (
                    <ActivityIndicator />
                  )}

                  {apartamentos.isError && (
                    <Text style={styles.erro}>
                      {getErrorMessage(apartamentos.error)}
                    </Text>
                  )}

                  {apartamentos.data?.length === 0 && (
                    <Text style={styles.erro}>
                      Nenhum apartamento disponível.
                    </Text>
                  )}
                </>
              )}

              {erroValidacao !== '' && (
                <Text style={styles.erro}>{erroValidacao}</Text>
              )}

              {erroFormulario && (
                <Text style={styles.erro}>
                  {getErrorMessage(erroFormulario)}
                </Text>
              )}
            </View>
          </Dialog.ScrollArea>

          <Dialog.Actions>
            <Button onPress={fecharFormulario} disabled={salvando}>
              Cancelar
            </Button>

            <Button
              mode="contained"
              onPress={salvar}
              loading={salvando}
              disabled={
                salvando ||
                !nome.trim() ||
                !email.trim() ||
                (editando === null && senha.length < 6) ||
                (!editando && tipo === 'MORADOR' && !unidadeId)
              }
            >
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={apartamentoVisivel}
          onDismiss={() => setApartamentoVisivel(false)}
        >
          <Dialog.Title>Selecionar apartamento</Dialog.Title>

          <Dialog.ScrollArea>
            <FlatList
              data={apartamentos.data ?? []}
              keyExtractor={(item) => String(item.id)}
              ListEmptyComponent={
                <Text style={styles.message}>
                  Nenhum apartamento disponível.
                </Text>
              }
              renderItem={({ item }) => (
                <Button
                  mode={
                    unidadeId === String(item.id)
                      ? 'contained'
                      : 'text'
                  }
                  onPress={() => {
                    setUnidadeId(String(item.id));
                    setApartamentoVisivel(false);
                  }}
                >
                  {nomeApartamento(item)}
                </Button>
              )}
            />
          </Dialog.ScrollArea>

          <Dialog.Actions>
            <Button onPress={() => setApartamentoVisivel(false)}>
              Fechar
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={excluindo !== null}
          onDismiss={() => {
            setExcluindo(null);
            exclusao.reset();
          }}
        >
          <Dialog.Title>Excluir usuário?</Dialog.Title>

          <Dialog.Content>
            <Text>
              {excluindo?.nome} será removido, junto com os vínculos,
              ocorrências e comunicados desta conta. Esta ação não pode ser
              desfeita.
            </Text>

            {exclusao.isError && (
              <Text style={styles.erro}>
                {getErrorMessage(exclusao.error)}
              </Text>
            )}
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={() => {
                setExcluindo(null);
                exclusao.reset();
              }}
              disabled={exclusao.isPending}
            >
              Cancelar
            </Button>

            <Button
              textColor="#b3261e"
              loading={exclusao.isPending}
              disabled={exclusao.isPending}
              onPress={() => {
                if (excluindo) {
                  exclusao.mutate(String(excluindo.id));
                }
              }}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  novo: {
    margin: 16,
    marginBottom: 0,
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
  },
  form: {
    gap: 12,
    paddingVertical: 12,
  },
  dialog: {
    maxHeight: '90%',
  },
});
