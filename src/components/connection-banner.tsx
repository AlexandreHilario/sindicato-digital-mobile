import { useQuery } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text } from 'react-native-paper';
import { checkHealth } from '../services/api';
import { palette, radius } from '../theme';

/**
 * Verifica a conexão com o servidor (GET /health) e só aparece quando ela
 * falha, para orientar o usuário antes de tentar entrar.
 */
export function ConnectionBanner() {
  const { isError, isFetching, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    retry: false,
  });

  if (!isError) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Icon source="wifi-off" size={20} color={palette.warning} />
      <View style={styles.texts}>
        <Text variant="labelLarge" style={styles.title}>
          Sem conexão com o servidor
        </Text>
        <Text variant="bodySmall" style={styles.text}>
          Verifique sua internet e tente novamente.
        </Text>
      </View>
      <Button
        compact
        onPress={() => refetch()}
        loading={isFetching}
        disabled={isFetching}
        textColor={palette.warning}
      >
        Tentar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: palette.warningSoft,
  },
  texts: {
    flex: 1,
  },
  title: {
    color: palette.warning,
  },
  text: {
    color: palette.warning,
  },
});
