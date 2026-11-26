import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Icon, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandLogo } from '../../src/components/brand-logo';
import { IconBadge } from '../../src/components/icon-badge';
import { MENU_POR_TIPO, TIPO_ICON, TIPO_LABEL } from '../../src/navigation/menu';
import { useSessionStore } from '../../src/store/session-store';
import { palette, radius, spacing } from '../../src/theme';
import { iniciais, primeiroNome, saudacao } from '../../src/utils/formatters';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const usuario = useSessionStore((state) => state.usuario);
  if (!usuario) return null;

  const menu = MENU_POR_TIPO[usuario.tipo] ?? [];

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.topBar}>
          <BrandLogo variant="light" layout="inline" size="sm" />
          <Pressable
            onPress={() => router.navigate('/perfil')}
            accessibilityRole="button"
            accessibilityLabel="Abrir meu perfil"
            hitSlop={8}
          >
            <Avatar.Text
              size={40}
              label={iniciais(usuario.nome)}
              style={styles.avatar}
              color={palette.primary}
              labelStyle={styles.avatarLabel}
            />
          </Pressable>
        </View>

        <Text variant="bodyLarge" style={styles.greeting}>
          {saudacao()},
        </Text>
        <Text variant="headlineMedium" style={styles.name} numberOfLines={1}>
          {primeiroNome(usuario.nome)}
        </Text>

        <View style={styles.roleBadge}>
          <Icon source={TIPO_ICON[usuario.tipo]} size={16} color={palette.textOnPrimary} />
          <Text variant="labelLarge" style={styles.roleText}>
            {TIPO_LABEL[usuario.tipo] ?? usuario.tipo}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Acesso rápido
        </Text>

        {menu.map((item) => (
          <Pressable
            key={item.title}
            onPress={() => router.navigate(item.href)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <IconBadge icon={item.icon} />
            <View style={styles.itemTexts}>
              <Text variant="titleMedium" style={styles.itemTitle}>
                {item.title}
              </Text>
              <Text variant="bodyMedium" style={styles.itemDescription}>
                {item.description}
              </Text>
            </View>
            <Icon source="chevron-right" size={24} color="#9aa8b6" />
          </Pressable>
        ))}

        {usuario.tipo === 'ADMIN' ? (
          <View style={styles.info}>
            <Icon source="information-outline" size={20} color={palette.accent} />
            <Text variant="bodyMedium" style={styles.infoText}>
              Os recursos de gestão de usuários, síndicos e condomínios ficarão
              disponíveis nesta área.
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: palette.background,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: palette.primary,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  avatar: {
    backgroundColor: palette.textOnPrimary,
  },
  avatarLabel: {
    fontWeight: '700',
    fontSize: 15,
  },
  greeting: {
    color: palette.textOnPrimaryMuted,
  },
  name: {
    color: palette.textOnPrimary,
    fontWeight: '700',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  roleText: {
    color: palette.textOnPrimary,
  },
  content: {
    gap: 12,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: palette.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  itemPressed: {
    backgroundColor: palette.primarySoft,
  },
  itemTexts: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    color: palette.text,
    fontWeight: '600',
  },
  itemDescription: {
    color: palette.textMuted,
  },
  info: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: palette.primarySoft,
  },
  infoText: {
    flex: 1,
    color: palette.text,
  },
});
