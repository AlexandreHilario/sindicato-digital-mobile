import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Dialog,
  HelperText,
  Portal,
  Snackbar,
  Text,
} from 'react-native-paper';

import { SeletorComBusca } from '../../src/components/SeletorComBusca';
import { listarTodosCondominios } from '../../src/services/condominios';
import {
  associarSindico,
  desassociarSindico,
  mensagemDeErroSindico,
} from '../../src/services/sindicos';
import { listarUsuarios, useUsuarioLogado } from '../../src/services/usuario';

type Vinculo = {
  sindicoId: number;
  condominioId: number;
};

export default function VinculosSindicosScreen() {
  const queryClient = useQueryClient();
  const usuario = useUsuarioLogado();
  const [sindicoId, setSindicoId] = useState<string | number | null>(null);
  const [condominioId, setCondominioId] = useState<string | number | null>(
    null,
  );
  const [erroSindicoId, setErroSindicoId] = useState('');
  const [erroCondominioId, setErroCondominioId] = useState('');
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [vinculoRemocao, setVinculoRemocao] = useState<Vinculo | null>(null);
  const [sucesso, setSucesso] = useState('');
  const administrador = usuario.data?.tipo === 'ADMIN';

  const usuarios = useQuery({
    queryKey: ['usuarios'],
    queryFn: listarUsuarios,
    enabled: administrador,
  });
  const condominios = useQuery({
    queryKey: ['condominios'],
    queryFn: listarTodosCondominios,
    enabled: administrador,
  });

  const sindicos = usuarios.data?.filter((item) => item.tipo === 'SINDICO') ?? [];
  const opcoesSindicos = sindicos.map((item) => ({
    id: item.id,
    titulo: item.nome,
    subtitulo: item.email,
  }));
  const opcoesCondominios =
    condominios.data?.map((item) => ({ id: item.id, titulo: item.nome })) ?? [];
  const nomeDoSindico = (id: number) =>
    sindicos.find((item) => Number(item.id) === id)?.nome ?? `ID ${id}`;
  const nomeDoCondominio = (id: number) =>
    condominios.data?.find((item) => Number(item.id) === id)?.nome ??
    `ID ${id}`;

  const aoConcluir = async (mensagem: string) => {
    setSucesso(mensagem);
    await queryClient.invalidateQueries({ queryKey: ['meus-condominios'] });
  };
  const associacao = useMutation({
    mutationFn: (vinculo: Vinculo) =>
      associarSindico(vinculo.sindicoId, vinculo.condominioId),
    onSuccess: () => aoConcluir('Síndico associado ao condomínio.'),
  });
  const desassociacao = useMutation({
    mutationFn: (vinculo: Vinculo) =>
      desassociarSindico(vinculo.sindicoId, vinculo.condominioId),
    onSuccess: async () => {
      setConfirmacaoAberta(false);
      setVinculoRemocao(null);
      await aoConcluir('Vínculo removido do condomínio.');
    },
  });

  function lerVinculo(): Vinculo | undefined {
    setErroSindicoId(sindicoId === null ? 'Selecione um síndico.' : '');
    setErroCondominioId(condominioId === null ? 'Selecione um condomínio.' : '');
    return sindicoId !== null && condominioId !== null
      ? { sindicoId: Number(sindicoId), condominioId: Number(condominioId) }
      : undefined;
  }

  function abrirConfirmacao() {
    const vinculo = lerVinculo();
    if (vinculo) {
      desassociacao.reset();
      setVinculoRemocao(vinculo);
      setConfirmacaoAberta(true);
    }
  }

  if (usuario.isPending) {
    return (
      <View style={styles.center}>
        <Text>Carregando...</Text>
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
          Somente administradores podem gerenciar vínculos de síndicos.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text variant="titleLarge">Gerenciar vínculos de síndicos</Text>
      <Text variant="bodyMedium" style={styles.description}>
        Busque o síndico e o condomínio pelo nome para associar ou remover o
        vínculo. Não há uma consulta administrativa de vínculos disponível.
      </Text>
      {(usuarios.isError || condominios.isError) && (
        <>
          <Text variant="bodyMedium" style={styles.message}>
            Não foi possível carregar síndicos e condomínios.
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              usuarios.refetch();
              condominios.refetch();
            }}
          >
            Tentar novamente
          </Button>
        </>
      )}
      <View>
        <SeletorComBusca
          label="Síndico"
          opcoes={opcoesSindicos}
          valor={sindicoId}
          onSelecionar={(id) => {
            setSindicoId(id);
            setErroSindicoId('');
          }}
          erro={Boolean(erroSindicoId)}
        />
        <HelperText type="error" visible={Boolean(erroSindicoId)}>
          {erroSindicoId}
        </HelperText>
      </View>
      <View>
        <SeletorComBusca
          label="Condomínio"
          opcoes={opcoesCondominios}
          valor={condominioId}
          onSelecionar={(id) => {
            setCondominioId(id);
            setErroCondominioId('');
          }}
          erro={Boolean(erroCondominioId)}
        />
        <HelperText type="error" visible={Boolean(erroCondominioId)}>
          {erroCondominioId}
        </HelperText>
      </View>
      {associacao.isError && (
        <HelperText type="error" visible>
          {mensagemDeErroSindico(associacao.error)}
        </HelperText>
      )}
      <Button
        mode="contained"
        onPress={() => {
          const vinculo = lerVinculo();
          if (vinculo) {
            associacao.mutate(vinculo);
          }
        }}
        loading={associacao.isPending}
        disabled={associacao.isPending || desassociacao.isPending}
      >
        Associar síndico
      </Button>
      <Button
        mode="outlined"
        textColor="#b3261e"
        onPress={abrirConfirmacao}
        disabled={associacao.isPending || desassociacao.isPending}
      >
        Remover associação
      </Button>
      <Portal>
        <Dialog
          visible={confirmacaoAberta}
          onDismiss={() => setConfirmacaoAberta(false)}
        >
          <Dialog.Title>Remover associação?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Remover o vínculo do síndico{' '}
              {vinculoRemocao && nomeDoSindico(vinculoRemocao.sindicoId)} com o
              condomínio{' '}
              {vinculoRemocao && nomeDoCondominio(vinculoRemocao.condominioId)}?
            </Text>
            {desassociacao.isError && (
              <HelperText type="error" visible>
                {mensagemDeErroSindico(desassociacao.error)}
              </HelperText>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setConfirmacaoAberta(false);
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
                if (vinculoRemocao) {
                  desassociacao.mutate(vinculoRemocao);
                }
              }}
            >
              Remover
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  description: {
    color: '#526579',
  },
  message: {
    color: '#526579',
    textAlign: 'center',
  },
});
