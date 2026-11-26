import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { podeGerenciar, useUsuarioLogado } from '../../src/services/usuario';

export default function UnidadesScreen() {
  const usuario = useUsuarioLogado();
  const [unidadeId, setUnidadeId] = useState('');
  const [erro, setErro] = useState('');
  const permitido = podeGerenciar(usuario.data);

  function abrirGerenciamento() {
    const texto = unidadeId.trim();
    const id = Number(texto);
    if (!/^\d+$/.test(texto) || !Number.isSafeInteger(id) || id <= 0) {
      setErro('Informe um ID de unidade positivo.');
      return;
    }

    setErro('');
    router.push({
      pathname: '/unidades/[unidadeId]/moradores',
      params: { unidadeId: String(id) },
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
    <View style={styles.container}>
      <Text variant="titleLarge">Gerenciar moradores de uma unidade</Text>
      <Text variant="bodyMedium" style={styles.description}>
        Informe o ID da unidade para consultar e administrar os moradores
        vinculados.
      </Text>
      <TextInput
        label="ID da unidade"
        mode="outlined"
        value={unidadeId}
        onChangeText={(value) => {
          setUnidadeId(value);
          setErro('');
        }}
        keyboardType="number-pad"
        error={Boolean(erro)}
      />
      <HelperText type="error" visible={Boolean(erro)}>
        {erro}
      </HelperText>
      <Button mode="contained" onPress={abrirGerenciamento}>
        Continuar
      </Button>
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
