import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Icon, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandLogo } from '../src/components/brand-logo';
import { ConnectionBanner } from '../src/components/connection-banner';
import { getErrorMessage } from '../src/services/api-error';
import { signup } from '../src/services/auth';
import { palette, radius, spacing } from '../src/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mesmas regras do POST /auth/signup. */
function validar(nome: string, email: string, senha: string, confirmacao: string): string[] {
  const erros: string[] = [];
  const nomeLimpo = nome.trim();
  const emailLimpo = email.trim();

  if (nomeLimpo.length < 2 || nomeLimpo.length > 100) {
    erros.push('O nome deve ter entre 2 e 100 caracteres.');
  }
  if (emailLimpo.length > 254 || !EMAIL_REGEX.test(emailLimpo)) {
    erros.push('Informe um e-mail válido.');
  }
  if (senha.length < 6) {
    erros.push('A senha deve ter pelo menos 6 caracteres.');
  } else if (new TextEncoder().encode(senha).length > 72) {
    erros.push('A senha deve ter no máximo 72 bytes.');
  }
  if (senha !== confirmacao) {
    erros.push('A confirmação de senha não confere.');
  }
  return erros;
}

export default function CadastroScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (submitting) return;

    const erros = validar(nome, email, senha, confirmacao);
    if (erros.length > 0) {
      setError(erros.join(' '));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await signup(nome, email, senha);
      router.replace({ pathname: '/login', params: { cadastro: 'sucesso' } });
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
              Crie sua conta
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Cadastre seus dados para acessar os serviços do seu condomínio.
            </Text>

            <ConnectionBanner />

            <View style={styles.notice}>
              <Icon source="information-outline" size={20} color={palette.primary} />
              <Text variant="bodyMedium" style={styles.noticeText}>
                Após criar a conta, se nenhuma unidade estiver vinculada, solicite o vínculo à
                administração do condomínio.
              </Text>
            </View>

            <TextInput
              label="Nome completo"
              mode="outlined"
              value={nome}
              onChangeText={setNome}
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              maxLength={100}
              disabled={submitting}
              left={<TextInput.Icon icon="account-outline" color={palette.textMuted} />}
              outlineStyle={styles.inputOutline}
            />
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
              maxLength={254}
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
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
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
            <TextInput
              label="Confirmar senha"
              mode="outlined"
              value={confirmacao}
              onChangeText={setConfirmacao}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              disabled={submitting}
              outlineStyle={styles.inputOutline}
              left={<TextInput.Icon icon="lock-check-outline" color={palette.textMuted} />}
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
              disabled={submitting}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Criar conta
            </Button>

            <Button mode="text" onPress={() => router.replace('/login')} disabled={submitting}>
              Já tenho conta
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
    backgroundColor: palette.primarySoft,
  },
  noticeText: {
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
