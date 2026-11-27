import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Menu, Text, TextInput } from 'react-native-paper';

import { SeletorComBusca } from '../../src/components/SeletorComBusca';
import { listarTodosCondominios } from '../../src/services/condominios';
import {
  atualizarApartamento,
  buscarApartamentoPorId,
  criarApartamento,
  mensagemDeErroApartamento,
  validarApartamento,
  type Apartamento,
  type ApartamentoUpdate,
} from '../../src/services/apartamentos';
import {
  listarCondominiosDoSindico,
  type Condominio,
} from '../../src/services/sindicos';
import { podeGerenciar, useUsuarioLogado } from '../../src/services/usuario';

function idDoCondominio(condominio: Condominio) {
  return condominio.condominio_id ??
    condominio.id ??
    condominio.condominio?.id;
}

function nomeDoCondominio(condominio: Condominio) {
  return condominio.condominio_nome ??
    condominio.nome ??
    condominio.condominio?.nome ??
    `Condomínio ${idDoCondominio(condominio) ?? ''}`;
}

export default function FormularioScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const usuario = useUsuarioLogado();
  const podeGerenciarApartamento = podeGerenciar(usuario.data);

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

  if (id) {
    return <FormularioEdicao id={id} />;
  }

  return <Formulario />;
}

function FormularioEdicao({ id }: { id: string }) {
  const apartamento = useQuery({
    queryKey: ['apartamentos', id],
    queryFn: () => buscarApartamentoPorId(id),
  });

  if (apartamento.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (apartamento.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {mensagemDeErroApartamento(apartamento.error)}
        </Text>
        <Button mode="contained" onPress={() => apartamento.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  return <Formulario apartamento={apartamento.data} />;
}

function Formulario({ apartamento }: { apartamento?: Apartamento }) {
  const queryClient = useQueryClient();
  const usuario = useUsuarioLogado();
  const sindico = usuario.data?.tipo === 'SINDICO';
  const [condominioIdTexto, setCondominioIdTexto] = useState(
    apartamento ? String(apartamento.condominio_id) : '',
  );
  const [condominioIdSelecionado, setCondominioIdSelecionado] = useState(
    apartamento?.condominio_id,
  );
  const [bloco, setBloco] = useState(apartamento?.bloco ?? '');
  const [numero, setNumero] = useState(apartamento?.numero ?? '');
  const [menuAberto, setMenuAberto] = useState(false);
  const [erros, setErros] = useState<
    ReturnType<typeof validarApartamento>
  >({});

  const condominios = useQuery({
    queryKey: ['condominios-sindico'],
    queryFn: listarCondominiosDoSindico,
    enabled: sindico,
  });
  const todosCondominios = useQuery({
    queryKey: ['condominios'],
    queryFn: listarTodosCondominios,
    enabled: !sindico,
  });

  const salvar = useMutation({
    mutationFn: () => {
      const condominioId = sindico
        ? condominioIdSelecionado
        : Number(condominioIdTexto);
      const dados: ApartamentoUpdate = {
        bloco: bloco.trim(),
        numero: numero.trim(),
      };

      if (condominioId !== undefined && Number(condominioId) > 0) {
        dados.condominio_id = Number(condominioId);
      }

      return apartamento
        ? atualizarApartamento(apartamento.id, dados)
        : criarApartamento({
            condominio_id: condominioId as number,
            bloco: bloco.trim(),
            numero: numero.trim(),
          });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['apartamentos'] }),
        queryClient.invalidateQueries({
          queryKey: ['apartamentos', String(apartamento?.id)],
        }),
      ]);
      router.back();
    },
  });

  function enviar() {
    const condominioId = sindico
      ? condominioIdSelecionado
      : Number(condominioIdTexto);
    const errosValidacao = validarApartamento(
      {
        condominio_id: condominioId,
        bloco,
        numero,
      },
      true,
    );
    if (sindico && condominioId === undefined) {
      errosValidacao.condominio_id = 'Selecione um condomínio.';
    }
    setErros(errosValidacao);

    if (Object.keys(errosValidacao).length === 0) {
      salvar.mutate();
    }
  }

  if (sindico && condominios.isPending) {
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
          Não foi possível carregar seus condomínios.
        </Text>
        <Button mode="contained" onPress={() => condominios.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  const condominioSelecionado = condominios.data?.find(
    (condominio) => idDoCondominio(condominio) === condominioIdSelecionado,
  );

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {sindico ? (
        <View>
          <Menu
            visible={menuAberto}
            onDismiss={() => setMenuAberto(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMenuAberto(true)}
                style={styles.seletor}
              >
                {condominioSelecionado
                  ? nomeDoCondominio(condominioSelecionado)
                  : 'Selecionar condomínio'}
              </Button>
            }
          >
            {condominios.data?.map((condominio) => {
              const condominioId = idDoCondominio(condominio);
              if (condominioId === undefined) {
                return null;
              }
              return (
                <Menu.Item
                  key={condominioId}
                  title={nomeDoCondominio(condominio)}
                  onPress={() => {
                    setCondominioIdSelecionado(condominioId);
                    setMenuAberto(false);
                  }}
                />
              );
            })}
          </Menu>
          <HelperText type="error" visible={Boolean(erros.condominio_id)}>
            {erros.condominio_id}
          </HelperText>
        </View>
      ) : (
        <View>
          <SeletorComBusca
            label="Condomínio"
            opcoes={todosCondominios.data?.map((item) => ({
              id: item.id,
              titulo: item.nome,
            })) ?? []}
            valor={condominioIdTexto}
            onSelecionar={(id) => setCondominioIdTexto(String(id))}
            erro={Boolean(erros.condominio_id)}
          />
          <HelperText type="error" visible={Boolean(erros.condominio_id)}>
            {erros.condominio_id}
          </HelperText>
        </View>
      )}
      <View>
        <TextInput
          label="Bloco"
          mode="outlined"
          value={bloco}
          onChangeText={setBloco}
          error={Boolean(erros.bloco)}
        />
        <HelperText type="error" visible={Boolean(erros.bloco)}>
          {erros.bloco}
        </HelperText>
      </View>
      <View>
        <TextInput
          label="Número"
          mode="outlined"
          value={numero}
          onChangeText={setNumero}
          error={Boolean(erros.numero)}
        />
        <HelperText type="error" visible={Boolean(erros.numero)}>
          {erros.numero}
        </HelperText>
      </View>
      {salvar.isError && (
        <HelperText type="error" visible>
          {mensagemDeErroApartamento(salvar.error)}
        </HelperText>
      )}
      <Button
        mode="contained"
        onPress={enviar}
        loading={salvar.isPending}
        disabled={salvar.isPending}
      >
        {apartamento ? 'Salvar alterações' : 'Cadastrar'}
      </Button>
    </ScrollView>
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
  content: {
    gap: 4,
    padding: 24,
  },
  seletor: {
    width: '100%',
  },
  message: {
    color: '#526579',
    textAlign: 'center',
  },
});
