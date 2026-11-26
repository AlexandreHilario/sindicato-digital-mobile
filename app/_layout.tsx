import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#f5f7fa' },
            headerTintColor: '#17324d',
            contentStyle: { backgroundColor: '#f5f7fa' },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Início' }} />
          <Stack.Screen name="comunicados/index" options={{ title: 'Mural' }} />
          <Stack.Screen name="comunicados/[id]" options={{ title: 'Comunicado' }} />
          <Stack.Screen name="comunicados/gerenciar" options={{ title: 'Gerenciar comunicados' }} />
          <Stack.Screen name="comunicados/formulario" options={{ title: 'Comunicado' }} />
          <Stack.Screen name="unidades/index" options={{ title: 'Vínculos de moradores' }} />
          <Stack.Screen name="unidades/[unidadeId]/moradores" options={{ title: 'Moradores da unidade' }} />
          <Stack.Screen name="unidades/minhas" options={{ title: 'Minhas unidades' }} />
          <Stack.Screen name="sindicos/vinculos" options={{ title: 'Vínculos de síndicos' }} />
          <Stack.Screen name="sindicos/meus-condominios" options={{ title: 'Meus condomínios' }} />
          <Stack.Screen name="sobre" options={{ title: 'Sobre o projeto' }} />
          <Stack.Screen name="equipe" options={{ title: 'Equipe' }} />
        </Stack>
      </PaperProvider>
    </QueryClientProvider>
  );
}
