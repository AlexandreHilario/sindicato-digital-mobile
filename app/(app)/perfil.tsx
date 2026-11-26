import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Divider, List, Text } from 'react-native-paper';
import { QueryState } from '../../src/components/query-state';
import { TIPO_LABEL } from '../../src/navigation/menu';
import { fetchCurrentUser } from '../../src/services/auth';
import { useSessionStore } from '../../src/store/session-store';

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

function formatarData(iso: string) {
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? '-' : data.toLocaleDateString('pt-BR');
}

export default function PerfilScreen() {
  const usuarioId = useSessionStore((state) => state.usuario?.id);
  const setUsuario = useSessionStore((state) => state.setUsuario);
  const signOut = useSessionStore((state) => state.signOut);
  const [signingOut, setSigningOut] = useState(false);

  // Sempre busca os dados atualizados no servidor (GET /auth/me).
  const { data: usuario, error, isPending, isRefetching, refetch } = useQuery({
    queryKey: ['me', usuarioId, 'perfil'],
    queryFn: fetchCurrentUser,
  });

  // Mantém o nome/tipo do restante do app (Início, abas) em sincronia.
  useEffect(() => {
    if (usuario) setUsuario(usuario);
  }, [usuario, setUsuario]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
  }

  return (
    <QueryState
      isPending={isPending}
      error={error}
      isEmpty={false}
      emptyIcon="account"
      emptyMessage=""
      onRetry={refetch}
    >
      {usuario ? (
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
        >
          <View style={styles.header}>
            <Avatar.Text size={72} label={iniciais(usuario.nome)} style={styles.avatar} />
            <Text variant="headlineSmall" style={styles.name}>
              {usuario.nome}
            </Text>
          </View>

          <Card mode="outlined" style={styles.card}>
            <List.Item
              title="E-mail"
              description={usuario.email}
              left={(props) => <List.Icon {...props} icon="email-outline" />}
            />
            <Divider />
            <List.Item
              title="Tipo de conta"
              description={TIPO_LABEL[usuario.tipo] ?? usuario.tipo}
              left={(props) => <List.Icon {...props} icon="badge-account" />}
            />
            <Divider />
            <List.Item
              title="Membro desde"
              description={formatarData(usuario.criado_em)}
              left={(props) => <List.Icon {...props} icon="calendar" />}
            />
          </Card>

          <Button
            mode="outlined"
            icon="logout"
            onPress={handleSignOut}
            loading={signingOut}
            disabled={signingOut}
            textColor="#b3261e"
            style={styles.logout}
          >
            Sair da conta
          </Button>
        </ScrollView>
      ) : null}
    </QueryState>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  avatar: {
    backgroundColor: '#17324d',
  },
  name: {
    color: '#17324d',
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
  },
  logout: {
    borderColor: '#b3261e',
  },
});
