import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/tabs';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { IconName } from '../../src/navigation/menu';
import { useSessionStore } from '../../src/store/session-store';
import { palette } from '../../src/theme';

const TAB_BAR_HEIGHT = 68;

function tabIcon(name: IconName, focusedName: IconName) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <MaterialCommunityIcons
      name={focused ? focusedName : name}
      color={typeof color === 'string' ? color : undefined}
      size={size}
    />
  );
}

/**
 * Abas da área logada. O _layout raiz já garante que só usuários logados
 * chegam aqui; o Tabs.Protected esconde (e bloqueia por URL) as abas que não
 * são do tipo de conta logado, voltando para "Início".
 */
export default function AppTabsLayout() {
  const tipo = useSessionStore((state) => state.usuario?.tipo);
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: palette.surface,
          borderBottomWidth: 1,
          borderBottomColor: palette.border,
        },
        headerShadowVisible: false,
        headerTintColor: palette.text,
        headerTitleStyle: { fontWeight: '700' },
        headerTitleAlign: 'left',
        sceneStyle: { backgroundColor: palette.background },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: '#8796a6',
        tabBarLabelStyle: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
        // Altura explícita: na padrão, cada aba fica com ~37px úteis e o texto
        // (ícone 25px + rótulo 16px) é esmagado e cortado. A área segura
        // inferior (barra de gestos do celular) é somada à altura.
        tabBarStyle: {
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 6,
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerShown: false,
          tabBarIcon: tabIcon('home-outline', 'home'),
        }}
      />

      <Tabs.Protected guard={tipo === 'MORADOR'}>
        <Tabs.Screen
          name="unidades"
          options={{
            title: 'Minhas unidades',
            tabBarLabel: 'Unidades',
            tabBarIcon: tabIcon('home-city-outline', 'home-city'),
          }}
        />
      </Tabs.Protected>

      <Tabs.Protected guard={tipo === 'SINDICO'}>
        <Tabs.Screen
          name="condominios"
          options={{
            title: 'Meus condomínios',
            tabBarLabel: 'Condomínios',
            tabBarIcon: tabIcon('office-building-outline', 'office-building'),
          }}
        />
      </Tabs.Protected>

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Meu perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: tabIcon('account-circle-outline', 'account-circle'),
        }}
      />
    </Tabs>
  );
}
