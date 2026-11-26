import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import {
  atualizarCategoria,
  buscarCategoriaPorId,
  criarCategoria,
  mensagemDeErroCategoria,
  validarCategoria,
  type Categoria,
} from '../../src/services/categorias';
import { useSessionStore } from '../../src/store/session-store';
import { podeGerenciar, useUsuarioLogado } from '../../src/services/usuario';

export default function FormularioCategoriaScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const accessToken = useSessionStore((state) => state.accessToken);
  const usuario = useUsuarioLogado();
  const permitido = podeGerenciar(usuario.data);

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

  return id ? <FormularioEdicao id={id} /> : <Formulario />;
}

function FormularioEdicao({ id }: { id: string }) {
  const categoria = useQuery({
    queryKey: ['categorias', id],
    queryFn: () => buscarCategoriaPorId(id),
  });

  if (categoria.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (categoria.isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {mensagemDeErroCategoria(categoria.error)}
        </Text>
        <Button mode="contained" onPress={() => categoria.refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  return <Formulario categoria={categoria.data} />;
}

function Formulario({ categoria }: { categoria?: Categoria }) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState(categoria?.nome ?? '');
  const [descricao, setDescricao] = useState(categoria?.descricao ?? '');
  const [erroNome, setErroNome] = useState('');

  const salvar = useMutation({
    mutationFn: () => {
      const input = {
        nome: nome.trim(),
        descricao: descricao.trim() || null,
      };
      return categoria
        ? atualizarCategoria(categoria.id, input)
        : criarCategoria(input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categorias'] });
      router.back();
    },
  });

  function enviar() {
    const erros = validarCategoria({ nome, descricao });
    setErroNome(erros.nome ?? '');
    if (Object.keys(erros).length === 0) {
      salvar.mutate();
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <TextInput
          label="Nome"
          mode="outlined"
          value={nome}
          onChangeText={(value) => {
            setNome(value);
            setErroNome('');
          }}
          error={Boolean(erroNome)}
        />
        <HelperText type="error" visible={Boolean(erroNome)}>
          {erroNome}
        </HelperText>
      </View>
      <TextInput
        label="Descrição (opcional)"
        mode="outlined"
        value={descricao}
        onChangeText={setDescricao}
        multiline
        numberOfLines={4}
      />
      {salvar.isError && (
        <HelperText type="error" visible>
          {mensagemDeErroCategoria(salvar.error)}
        </HelperText>
      )}
      <Button
        mode="contained"
        onPress={enviar}
        loading={salvar.isPending}
        disabled={salvar.isPending}
      >
        {categoria ? 'Salvar alterações' : 'Cadastrar categoria'}
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
    gap: 12,
    padding: 24,
  },
  message: {
    color: '#526579',
    textAlign: 'center',
  },
});
