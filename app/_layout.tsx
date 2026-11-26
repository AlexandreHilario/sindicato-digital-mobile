import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, PaperProvider, Text } from 'react-native-paper';
import { BrandLogo } from '../src/components/brand-logo';
import { queryClient } from '../src/services/query-client';
import { useSessionStore } from '../src/store/session-store';
import { palette, spacing, theme } from '../src/theme';

/**
 * Cabeçalho das telas empilhadas sobre as abas (Mural, Ocorrências): mostra o
 * título e o botão de voltar, e o Mural usa a área da direita para o botão
 * Gerenciar.
 */
const stackHeader = {
  headerShown: true,
  headerStyle: { backgroundColor: palette.surface },
  headerTintColor: palette.text,
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
};

export default function RootLayout() {
  const status = useSessionStore((state) => state.status);
  const restoreSession = useSessionStore((state) => state.restoreSession);

  // Ao abrir o app, tenta restaurar a sessão salva (GET /auth/me).
  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const restoring = status === 'restoring' || status === 'restoreError';

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <StatusBar style={restoring || status === 'unauthenticated' ? 'light' : 'dark'} />
        {restoring ? (
          <SplashScreen />
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.background },
            }}
          >
            {/* Área logada: abas em app/(app)/ e telas empilhadas da equipe */}
            <Stack.Protected guard={status === 'authenticated'}>
              <Stack.Screen name="(app)" />
              <Stack.Screen name="comunicados/index" options={{ ...stackHeader, title: 'Mural' }} />
              <Stack.Screen name="comunicados/[id]" options={{ ...stackHeader, title: 'Comunicado' }} />
              <Stack.Screen
                name="comunicados/gerenciar"
                options={{ ...stackHeader, title: 'Gerenciar comunicados' }}
              />
              <Stack.Screen name="comunicados/formulario" options={{ ...stackHeader, title: 'Comunicado' }} />
              <Stack.Screen name="ocorrencias/index" options={{ ...stackHeader, title: 'Ocorrências' }} />
              <Stack.Screen name="ocorrencias/[id]" options={{ ...stackHeader, title: 'Ocorrência' }} />
            </Stack.Protected>

            {/* Quem não está logado só acessa o login */}
            <Stack.Protected guard={status === 'unauthenticated'}>
              <Stack.Screen name="login" />
            </Stack.Protected>
          </Stack>
        )}
      </PaperProvider>
    </QueryClientProvider>
  );
}

/** Abertura do app: valida a sessão salva ou mostra a falha com opções. */
function SplashScreen() {
  const status = useSessionStore((state) => state.status);
  const restoreError = useSessionStore((state) => state.restoreError);
  const restoreSession = useSessionStore((state) => state.restoreSession);
  const signOut = useSessionStore((state) => state.signOut);

  return (
    <View style={styles.splash}>
      <BrandLogo variant="light" size="lg" />

      {status === 'restoring' ? (
        <ActivityIndicator color={palette.textOnPrimary} style={styles.loader} />
      ) : (
        <View style={styles.errorBox}>
          <Text variant="titleMedium" style={styles.errorTitle}>
            Não foi possível continuar
          </Text>
          <Text variant="bodyMedium" style={styles.errorText}>
            {restoreError}
          </Text>
          <Button
            mode="contained"
            buttonColor={palette.textOnPrimary}
            textColor={palette.primary}
            onPress={() => restoreSession()}
            style={styles.errorButton}
          >
            Tentar novamente
          </Button>
          <Button mode="text" textColor={palette.textOnPrimary} onPress={() => signOut()}>
            Entrar com outra conta
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: palette.primary,
  },
  loader: {
    marginTop: spacing.xl,
  },
  errorBox: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    maxWidth: 340,
  },
  errorTitle: {
    color: palette.textOnPrimary,
    fontWeight: '700',
  },
  errorText: {
    color: palette.textOnPrimaryMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorButton: {
    alignSelf: 'stretch',
  },
});
