import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import {
  criarCondominio,
  mensagemDeErroCondominio,
  validarCondominio,
} from '../../src/services/condominios';
import { useUsuarioLogado } from '../../src/services/usuario';

export default function FormularioCondominioScreen() {
  const usuario = useUsuarioLogado();

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

  if (usuario.data.tipo !== 'ADMIN') {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.message}>
          Somente administradores podem cadastrar condomínios.
        </Text>
      </View>
    );
  }

  return <Formulario />;
}

function Formulario() {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [erros, setErros] = useState<ReturnType<typeof validarCondominio>>({});

  const salvar = useMutation({
    mutationFn: () =>
      criarCondominio({ nome: nome.trim(), codigo: codigo.trim() }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['condominios'] }),
        queryClient.invalidateQueries({ queryKey: ['condominios-gestao'] }),
      ]);
      router.back();
    },
  });

  function enviar() {
    const errosValidacao = validarCondominio({ nome, codigo });
    setErros(errosValidacao);
    if (Object.keys(errosValidacao).length === 0) {
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
            setErros((atual) => ({ ...atual, nome: undefined }));
          }}
          error={Boolean(erros.nome)}
        />
        <HelperText type="error" visible={Boolean(erros.nome)}>
          {erros.nome}
        </HelperText>
      </View>
      <View>
        <TextInput
          label="Código"
          mode="outlined"
          value={codigo}
          onChangeText={(value) => {
            setCodigo(value);
            setErros((atual) => ({ ...atual, codigo: undefined }));
          }}
          autoCapitalize="none"
          autoCorrect={false}
          error={Boolean(erros.codigo)}
        />
        <HelperText type="error" visible={Boolean(erros.codigo)}>
          {erros.codigo}
        </HelperText>
      </View>
      {salvar.isError && (
        <HelperText type="error" visible>
          {mensagemDeErroCondominio(salvar.error)}
        </HelperText>
      )}
      <Button
        mode="contained"
        onPress={enviar}
        loading={salvar.isPending}
        disabled={salvar.isPending}
      >
        Cadastrar condomínio
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
