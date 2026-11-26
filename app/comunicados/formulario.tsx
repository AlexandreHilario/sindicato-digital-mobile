import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import {
  atualizarComunicado,
  buscarComunicado,
  type Comunicado,
  criarComunicado,
  mensagemDeErro,
  validarComunicado,
} from '../../src/services/comunicados';

export default function FormularioScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  if (!id) {
    return <Formulario />;
  }
  return <FormularioEdicao id={id} />;
}

function FormularioEdicao({ id }: { id: string }) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['comunicados', id],
    queryFn: () => buscarComunicado(id),
  });

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          {mensagemDeErro(error)}
        </Text>
        <Button mode="contained" onPress={() => refetch()}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  return <Formulario comunicado={data} />;
}

function Formulario({ comunicado }: { comunicado?: Comunicado }) {
  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState(comunicado?.titulo ?? '');
  const [conteudo, setConteudo] = useState(comunicado?.conteudo ?? '');
  const [erros, setErros] = useState<ReturnType<typeof validarComunicado>>({});

  const salvar = useMutation({
    mutationFn: () => {
      const dados = { titulo: titulo.trim(), conteudo: conteudo.trim() };
      return comunicado
        ? atualizarComunicado(String(comunicado.id), dados)
        : criarComunicado(dados);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comunicados'] });
      router.back();
    },
  });

  function enviar() {
    const errosValidacao = validarComunicado({ titulo, conteudo });
    setErros(errosValidacao);
    if (Object.keys(errosValidacao).length === 0) {
      salvar.mutate();
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View>
        <TextInput
          label="Título"
          mode="outlined"
          value={titulo}
          onChangeText={setTitulo}
          error={Boolean(erros.titulo)}
          maxLength={150}
        />
        <HelperText type="error" visible={Boolean(erros.titulo)}>
          {erros.titulo}
        </HelperText>
      </View>
      <View>
        <TextInput
          label="Conteúdo"
          mode="outlined"
          value={conteudo}
          onChangeText={setConteudo}
          error={Boolean(erros.conteudo)}
          multiline
          numberOfLines={8}
          maxLength={5000}
        />
        <HelperText type="error" visible={Boolean(erros.conteudo)}>
          {erros.conteudo}
        </HelperText>
      </View>
      {salvar.isError && (
        <HelperText type="error" visible>
          {mensagemDeErro(salvar.error)}
        </HelperText>
      )}
      <Button
        mode="contained"
        onPress={enviar}
        loading={salvar.isPending}
        disabled={salvar.isPending}
      >
        {comunicado ? 'Salvar alterações' : 'Publicar'}
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
  message: {
    color: '#526579',
    textAlign: 'center',
  },
});
