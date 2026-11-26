import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, PaperProvider, Text } from 'react-native-paper';
import { queryClient } from '../src/services/query-client';
import { useSessionStore } from '../src/store/session-store';
import { theme } from '../src/theme';

export default function RootLayout() {
  const status = useSessionStore((state) => state.status);
  const restoreSession = useSessionStore((state) => state.restoreSession);

  // Ao abrir o app, tenta restaurar a sessão salva (GET /auth/me).
  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <StatusBar style="dark" />
        {status === 'restoring' || status === 'restoreError' ? (
          <RestoringScreen />
        ) : (
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#f5f7fa' },
              headerTintColor: '#17324d',
              contentStyle: { backgroundColor: '#f5f7fa' },
            }}
          >
            {/* Telas que exigem login */}
            <Stack.Protected guard={status === 'authenticated'}>
              <Stack.Screen name="index" options={{ title: 'Início' }} />
              <Stack.Screen name="comunicados/index" options={{ title: 'Mural' }} />
              <Stack.Screen name="comunicados/[id]" options={{ title: 'Comunicado' }} />
              <Stack.Screen name="comunicados/gerenciar" options={{ title: 'Gerenciar comunicados' }} />
              <Stack.Screen name="comunicados/formulario" options={{ title: 'Comunicado' }} />
              <Stack.Screen name="ocorrencias/index" options={{ title: 'Ocorrências' }} />
              <Stack.Screen name="ocorrencias/[id]" options={{ title: 'Ocorrência' }} />
              <Stack.Screen name="sobre" options={{ title: 'Sobre o projeto' }} />
              <Stack.Screen name="equipe" options={{ title: 'Equipe' }} />
            </Stack.Protected>

            {/* Telas para quem não está logado */}
            <Stack.Protected guard={status === 'unauthenticated'}>
              <Stack.Screen name="login" options={{ title: 'Entrar', headerShown: false }} />
            </Stack.Protected>
          </Stack>
        )}
      </PaperProvider>
    </QueryClientProvider>
  );
}

/** Exibida enquanto a sessão é validada, ou se o servidor não respondeu. */
function RestoringScreen() {
  const status = useSessionStore((state) => state.status);
  const restoreError = useSessionStore((state) => state.restoreError);
  const restoreSession = useSessionStore((state) => state.restoreSession);
  const signOut = useSessionStore((state) => state.signOut);

  if (status === 'restoring') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge">Carregando sua sessão...</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text variant="titleMedium">Não foi possível validar sua sessão</Text>
      <Text variant="bodyMedium" style={styles.error}>
        {restoreError}
      </Text>
      <Button mode="contained" onPress={() => restoreSession()}>
        Tentar novamente
      </Button>
      <Button mode="text" onPress={() => signOut()}>
        Entrar com outra conta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: '#f5f7fa',
  },
  error: {
    color: '#b3261e',
    textAlign: 'center',
  },
});
