import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/tabs';
import type { ColorValue } from 'react-native';
import type { IconName } from '../../src/navigation/menu';
import { useSessionStore } from '../../src/store/session-store';

function tabIcon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <MaterialCommunityIcons
      name={name}
      color={typeof color === 'string' ? color : undefined}
      size={size}
    />
  );
}

/**
 * Abas das telas internas. O _layout raiz já garante que só usuários logados
 * chegam aqui; o Tabs.Protected esconde (e bloqueia por URL) as abas que não
 * são do tipo de conta logado, voltando para "Início".
 */
export default function AppTabsLayout() {
  const tipo = useSessionStore((state) => state.usuario?.tipo);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#f5f7fa' },
        headerTintColor: '#17324d',
        sceneStyle: { backgroundColor: '#f5f7fa' },
        tabBarActiveTintColor: '#17324d',
        tabBarInactiveTintColor: '#7a8a9a',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Início', tabBarIcon: tabIcon('home') }}
      />

      <Tabs.Protected guard={tipo === 'MORADOR'}>
        <Tabs.Screen
          name="unidades"
          options={{ title: 'Minhas unidades', tabBarLabel: 'Unidades', tabBarIcon: tabIcon('home-city') }}
        />
      </Tabs.Protected>

      <Tabs.Protected guard={tipo === 'SINDICO'}>
        <Tabs.Screen
          name="condominios"
          options={{ title: 'Meus condomínios', tabBarLabel: 'Condomínios', tabBarIcon: tabIcon('office-building') }}
        />
      </Tabs.Protected>

      <Tabs.Screen
        name="perfil"
        options={{ title: 'Meu perfil', tabBarLabel: 'Perfil', tabBarIcon: tabIcon('account-circle') }}
      />
    </Tabs>
  );
}
