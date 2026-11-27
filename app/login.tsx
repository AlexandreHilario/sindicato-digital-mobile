import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Icon, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandLogo } from '../src/components/brand-logo';
import { ConnectionBanner } from '../src/components/connection-banner';
import { getErrorMessage } from '../src/services/api-error';
import { useSessionStore } from '../src/store/session-store';
import { palette, radius, spacing } from '../src/theme';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cadastro } = useLocalSearchParams<{ cadastro?: string }>();
  const signIn = useSessionStore((state) => state.signIn);
  const notice = useSessionStore((state) => state.notice);
  const clearNotice = useSessionStore((state) => state.clearNotice);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && senha.length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    clearNotice();
    try {
      await signIn(email, senha);
      // Sucesso: o Stack.Protected do _layout troca para a área logada.
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.lg }]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={[styles.hero, { paddingTop: insets.top + spacing.xl * 1.5 }]}>
          <BrandLogo variant="light" size="lg" showTagline />
        </View>

        <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <Text variant="headlineSmall" style={styles.title}>
            Bem-vindo
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Entre com sua conta para continuar.
          </Text>

          <ConnectionBanner />

          {cadastro === 'sucesso' ? (
            <View style={styles.success}>
              <Icon source="check-circle-outline" size={20} color={palette.primary} />
              <Text variant="bodyMedium" style={styles.successText}>
                Conta criada. Entre com seu e-mail e senha. Se nenhuma unidade estiver
                vinculada, solicite o vínculo à administração do condomínio.
              </Text>
            </View>
          ) : null}

          {notice ? (
            <View style={styles.notice}>
              <Icon source="clock-alert-outline" size={20} color={palette.warning} />
              <Text variant="bodyMedium" style={styles.noticeText}>
                {notice}
              </Text>
            </View>
          ) : null}

          <TextInput
            label="E-mail"
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
            disabled={submitting}
            left={<TextInput.Icon icon="email-outline" color={palette.textMuted} />}
            outlineStyle={styles.inputOutline}
          />
          <TextInput
            label="Senha"
            mode="outlined"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            disabled={submitting}
            outlineStyle={styles.inputOutline}
            left={<TextInput.Icon icon="lock-outline" color={palette.textMuted} />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                color={palette.textMuted}
                onPress={() => setShowPassword((value) => !value)}
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              />
            }
          />

          {error ? (
            <HelperText type="error" visible style={styles.error}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={!canSubmit}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Entrar
          </Button>

          <Button mode="text" onPress={() => router.push('/cadastro')} disabled={submitting}>
            Criar conta
          </Button>
        </View>
        </View>

        <Text variant="bodySmall" style={styles.footer}>
          © {new Date().getFullYear()} SíndicoDigital
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2.5,
    backgroundColor: palette.primary,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  // O wrapper dá a margem lateral; o cartão ocupa a largura restante
  // (até 440px em telas largas, centralizado).
  cardWrapper: {
    alignItems: 'center',
    marginTop: -spacing.xl * 1.5,
    paddingHorizontal: spacing.md,
  },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    shadowColor: palette.primaryDark,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    width: '100%',
    maxWidth: 440,
  },
  title: {
    color: palette.text,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.xs,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: palette.warningSoft,
  },
  noticeText: {
    flex: 1,
    color: palette.warning,
  },
  success: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: palette.primarySoft,
  },
  successText: {
    flex: 1,
    color: palette.primary,
  },
  inputOutline: {
    borderRadius: radius.md,
  },
  error: {
    marginTop: -spacing.sm,
    paddingHorizontal: 0,
  },
  button: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.xl,
    textAlign: 'center',
    color: palette.textMuted,
  },
});
