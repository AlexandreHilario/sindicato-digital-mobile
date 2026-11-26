import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { ApiStatus } from '../src/components/api-status';
import { getErrorMessage } from '../src/services/api-error';
import { useSessionStore } from '../src/store/session-store';

export default function LoginScreen() {
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
      // Sucesso: o Stack.Protected do _layout troca para a tela inicial.
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineMedium" style={styles.title}>
          Sindicato Digital
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Entre com seu e-mail e senha.
        </Text>

        {notice ? (
          <Text variant="bodyMedium" style={styles.notice}>
            {notice}
          </Text>
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
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword((value) => !value)}
              accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            />
          }
        />

        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={!canSubmit}
        >
          Entrar
        </Button>

        <ApiStatus />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  title: {
    color: '#17324d',
    fontWeight: '700',
  },
  subtitle: {
    color: '#526579',
    marginBottom: 8,
  },
  notice: {
    color: '#8a5a00',
    backgroundColor: '#fff4e0',
    padding: 12,
    borderRadius: 8,
  },
});
