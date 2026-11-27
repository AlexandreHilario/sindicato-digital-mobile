import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';

import { SeletorComBusca } from '../../src/components/SeletorComBusca';
import { listarTodosCondominios } from '../../src/services/condominios';
import { listarMeusCondominios } from '../../src/services/sindicos';
import { listarUnidadesParaOcorrencia } from '../../src/services/unidades';
import { podeGerenciar, useUsuarioLogado } from '../../src/services/usuario';

export default function UnidadesScreen() {
  const usuario = useUsuarioLogado();
  const [unidadeId, setUnidadeId] = useState<string | number | null>(null);
  const [erro, setErro] = useState('');
  const permitido = podeGerenciar(usuario.data);
  const tipo = usuario.data?.tipo;

  const unidades = useQuery({
    queryKey: ['unidades-gestao', tipo],
    queryFn: () => listarUnidadesParaOcorrencia(tipo as 'SINDICO' | 'ADMIN'),
    enabled: permitido,
  });
  const condominios = useQuery({
    queryKey: ['condominios-gestao', tipo],
    queryFn: async () => {
      const lista =
        tipo === 'ADMIN'
          ? await listarTodosCondominios()
          : await listarMeusCondominios();
      return lista.map((condominio) => ({
        id: String(condominio.id),
        nome: condominio.nome,
      }));
    },
    enabled: permitido,
  });

  const nomesDosCondominios = new Map(
    condominios.data?.map((condominio) => [condominio.id, condominio.nome]),
  );
  const opcoes =
    unidades.data?.map((unidade) => ({
      id: unidade.id,
      titulo: `Bloco ${unidade.bloco} • Unidade ${unidade.numero}`,
      subtitulo: nomesDosCondominios.get(String(unidade.condominio_id)),
    })) ?? [];

  function abrirGerenciamento() {
    if (unidadeId === null) {
      setErro('Selecione uma unidade.');
      return;
    }

    setErro('');
    router.push({
      pathname: '/unidades/[unidadeId]/moradores',
      params: { unidadeId: String(unidadeId) },
    });
  }

  if (usuario.isPending) {
    return (
      <View style={styles.center}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (usuario.isError || !permitido) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {usuario.isError
            ? 'Não foi possível verificar suas permissões.'
            : 'Você não tem permissão para gerenciar vínculos de moradores.'}
        </Text>
        {usuario.isError && (
          <Button mode="contained" onPress={() => usuario.refetch()}>
            Tentar novamente
          </Button>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text variant="titleLarge">Gerenciar moradores de uma unidade</Text>
      <Text variant="bodyMedium" style={styles.description}>
        Busque a unidade pelo bloco, número ou condomínio para consultar e
        administrar os moradores vinculados.
      </Text>
      {unidades.isError ? (
        <>
          <Text variant="bodyMedium" style={styles.message}>
            Não foi possível carregar as unidades.
          </Text>
          <Button mode="contained" onPress={() => unidades.refetch()}>
            Tentar novamente
          </Button>
        </>
      ) : (
        <>
          <SeletorComBusca
            label="Unidade"
            opcoes={opcoes}
            valor={unidadeId}
            onSelecionar={(id) => {
              setUnidadeId(id);
              setErro('');
            }}
            erro={Boolean(erro)}
          />
          <HelperText type="error" visible={Boolean(erro)}>
            {erro}
          </HelperText>
          <Button
            mode="contained"
            onPress={abrirGerenciamento}
            loading={unidades.isPending}
            disabled={unidades.isPending}
          >
            Continuar
          </Button>
        </>
      )}
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
