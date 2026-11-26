import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Text } from 'react-native-paper';
import { IconBadge } from '../../src/components/icon-badge';
import { QueryState } from '../../src/components/query-state';
import { TIPO_ICON, TIPO_LABEL, type IconName } from '../../src/navigation/menu';
import { fetchCurrentUser } from '../../src/services/auth';
import { useSessionStore } from '../../src/store/session-store';
import { palette, radius, spacing } from '../../src/theme';
import { formatarData, iniciais } from '../../src/utils/formatters';

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
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={palette.primary}
              colors={[palette.primary]}
            />
          }
        >
          <View style={styles.header}>
            <Avatar.Text
              size={88}
              label={iniciais(usuario.nome)}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <Text variant="headlineSmall" style={styles.name}>
              {usuario.nome}
            </Text>
            <Text variant="bodyMedium" style={styles.email}>
              {TIPO_LABEL[usuario.tipo] ?? usuario.tipo}
            </Text>
          </View>

          <Text variant="labelLarge" style={styles.sectionTitle}>
            INFORMAÇÕES DA CONTA
          </Text>
          <View style={styles.card}>
            <InfoRow icon="email-outline" label="E-mail" value={usuario.email} />
            <View style={styles.divider} />
            <InfoRow
              icon={TIPO_ICON[usuario.tipo]}
              label="Tipo de conta"
              value={TIPO_LABEL[usuario.tipo] ?? usuario.tipo}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="calendar-blank-outline"
              label="Membro desde"
              value={formatarData(usuario.criado_em)}
            />
          </View>

          <Button
            mode="outlined"
            icon="logout"
            onPress={handleSignOut}
            loading={signingOut}
            disabled={signingOut}
            textColor={palette.danger}
            style={styles.logout}
            contentStyle={styles.logoutContent}
          >
            Sair da conta
          </Button>
        </ScrollView>
      ) : null}
    </QueryState>
  );
}

function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <IconBadge icon={icon} size={40} />
      <View style={styles.rowTexts}>
        <Text variant="bodySmall" style={styles.rowLabel}>
          {label}
        </Text>
        <Text variant="bodyLarge" style={styles.rowValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  avatar: {
    backgroundColor: palette.primary,
    marginBottom: spacing.sm,
  },
  avatarLabel: {
    fontWeight: '700',
  },
  name: {
    color: palette.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  email: {
    color: palette.textMuted,
  },
  sectionTitle: {
    color: palette.textMuted,
    letterSpacing: 0.8,
    marginTop: spacing.sm,
  },
  card: {
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  rowTexts: {
    flex: 1,
  },
  rowLabel: {
    color: palette.textMuted,
  },
  rowValue: {
    color: palette.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginLeft: 56,
  },
  logout: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    borderColor: palette.danger,
  },
  logoutContent: {
    height: 48,
  },
});
