import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { ApiStatus } from '../src/components/api-status';
import { useSessionStore } from '../src/store/session-store';

const TIPO_LABEL = {
  MORADOR: 'Morador(a)',
  SINDICO: 'Síndico(a)',
  ADMIN: 'Administrador(a)',
} as const;

export default function HomeScreen() {
  const usuario = useSessionStore((state) => state.usuario);
  const signOut = useSessionStore((state) => state.signOut);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    // O Stack.Protected do _layout leva de volta ao login.
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Olá, {usuario?.nome ?? 'usuário'}
      </Text>
      {usuario ? (
        <Text variant="bodyLarge" style={styles.description}>
          {usuario.email} · {TIPO_LABEL[usuario.tipo] ?? usuario.tipo}
        </Text>
      ) : null}

      <ApiStatus />

      <Link href="/comunicados" asChild>
        <Button mode="contained">Mural de comunicados</Button>
      </Link>
      <Link href="/sobre" asChild>
        <Button mode="contained">Sobre o projeto</Button>
      </Link>
      <Link href="/equipe" asChild>
        <Button mode="outlined">Equipe</Button>
      </Link>
      <Button
        mode="text"
        icon="logout"
        onPress={handleSignOut}
        loading={signingOut}
        disabled={signingOut}
      >
        Sair
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  title: {
    color: '#17324d',
    fontWeight: '700',
  },
  description: {
    color: '#526579',
    marginBottom: 8,
  },
});
