import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, Chip, Icon, Text } from 'react-native-paper';
import { MENU_POR_TIPO, TIPO_LABEL } from '../../src/navigation/menu';
import { useSessionStore } from '../../src/store/session-store';

export default function HomeScreen() {
  const usuario = useSessionStore((state) => state.usuario);
  if (!usuario) return null;

  const menu = MENU_POR_TIPO[usuario.tipo] ?? [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Olá, {usuario.nome.split(' ')[0]}
      </Text>
      <Chip icon="badge-account" style={styles.chip} compact>
        {TIPO_LABEL[usuario.tipo] ?? usuario.tipo}
      </Chip>

      {usuario.tipo === 'ADMIN' ? (
        <Text variant="bodyMedium" style={styles.hint}>
          As ferramentas de administração serão adicionadas nas próximas etapas.
        </Text>
      ) : null}

      {menu.map((item) => (
        <Card
          key={item.title}
          mode="outlined"
          style={styles.card}
          onPress={() => router.navigate(item.href)}
          accessibilityRole="button"
        >
          <Card.Title
            title={item.title}
            subtitle={item.description}
            left={({ size }) => <Icon source={item.icon} size={size} color="#17324d" />}
            right={({ size }) => <Icon source="chevron-right" size={size} color="#7a8a9a" />}
            rightStyle={styles.chevron}
          />
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 24,
  },
  title: {
    color: '#17324d',
    fontWeight: '700',
  },
  chip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  hint: {
    color: '#526579',
  },
  card: {
    backgroundColor: '#ffffff',
  },
  chevron: {
    marginRight: 12,
  },
});
