import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Dialog,
  HelperText,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';

import {
  associarSindico,
  desassociarSindico,
  mensagemDeErroSindico,
} from '../../src/services/sindicos';
import { useUsuarioLogado } from '../../src/services/usuario';

function validarId(valor: string) {
  const texto = valor.trim();
  if (!/^\d+$/.test(texto)) {
    return undefined;
  }
  const id = Number(texto);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

export default function VinculosSindicosScreen() {
  const queryClient = useQueryClient();
  const usuario = useUsuarioLogado();
  const [sindicoIdTexto, setSindicoIdTexto] = useState('');
  const [condominioIdTexto, setCondominioIdTexto] = useState('');
  const [erroSindicoId, setErroSindicoId] = useState('');
  const [erroCondominioId, setErroCondominioId] = useState('');
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [vinculoRemocao, setVinculoRemocao] = useState<{
    sindicoId: number;
    condominioId: number;
  } | null>(null);
  const [sucesso, setSucesso] = useState('');
  const administrador = usuario.data?.tipo === 'ADMIN';

  const aoConcluir = async (mensagem: string) => {
    setSucesso(mensagem);
    await queryClient.invalidateQueries({ queryKey: ['meus-condominios'] });
  };
  const associacao = useMutation({
    mutationFn: ({
      sindicoId,
      condominioId,
    }: {
      sindicoId: number;
      condominioId: number;
    }) => associarSindico(sindicoId, condominioId),
    onSuccess: () => aoConcluir('Síndico associado ao condomínio.'),
  });
  const desassociacao = useMutation({
    mutationFn: ({
      sindicoId,
      condominioId,
    }: {
      sindicoId: number;
      condominioId: number;
    }) => desassociarSindico(sindicoId, condominioId),
    onSuccess: async () => {
      setConfirmacaoAberta(false);
      setVinculoRemocao(null);
      await aoConcluir('Vínculo removido do condomínio.');
    },
  });

  function lerIds() {
    const sindicoId = validarId(sindicoIdTexto);
    const condominioId = validarId(condominioIdTexto);
    setErroSindicoId(sindicoId ? '' : 'Informe um ID de síndico positivo.');
    setErroCondominioId(
      condominioId ? '' : 'Informe um ID de condomínio positivo.',
    );
    return sindicoId && condominioId ? { sindicoId, condominioId } : undefined;
  }

  function abrirConfirmacao() {
    const ids = lerIds();
    if (ids) {
      desassociacao.reset();
      setVinculoRemocao(ids);
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
    <View style={styles.container}>
      <Text variant="titleLarge">Gerenciar vínculos de síndicos</Text>
      <Text variant="bodyMedium" style={styles.description}>
        Informe os IDs do síndico e do condomínio para associar ou remover o
        vínculo. Não há uma consulta administrativa de vínculos disponível.
      </Text>
      <View>
        <TextInput
          label="ID do síndico"
          mode="outlined"
          value={sindicoIdTexto}
          onChangeText={(value) => {
            setSindicoIdTexto(value);
            setErroSindicoId('');
          }}
          keyboardType="number-pad"
          error={Boolean(erroSindicoId)}
        />
        <HelperText type="error" visible={Boolean(erroSindicoId)}>
          {erroSindicoId}
        </HelperText>
      </View>
      <View>
        <TextInput
          label="ID do condomínio"
          mode="outlined"
          value={condominioIdTexto}
          onChangeText={(value) => {
            setCondominioIdTexto(value);
            setErroCondominioId('');
          }}
          keyboardType="number-pad"
          error={Boolean(erroCondominioId)}
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
          const ids = lerIds();
          if (ids) {
            associacao.mutate(ids);
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
              Remover o vínculo do síndico {vinculoRemocao?.sindicoId} com o
              condomínio {vinculoRemocao?.condominioId}?
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
