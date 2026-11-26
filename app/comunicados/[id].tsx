import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { buscarComunicado, formatarData, mensagemDeErro } from '../../src/services/comunicados';

export default function ComunicadoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text variant="headlineSmall" style={styles.title}>
        {data.titulo}
      </Text>
      <Text variant="bodyMedium" style={styles.meta}>
        {data.autor_nome} • {formatarData(data.criado_em)}
      </Text>
      <Text variant="bodyLarge">{data.conteudo}</Text>
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
  title: {
    color: '#17324d',
    fontWeight: '700',
  },
  message: {
    color: '#526579',
    textAlign: 'center',
  },
  meta: {
    color: '#526579',
  },
});
