import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Sindicato Digital
      </Text>
      <Text variant="bodyLarge" style={styles.description}>
        Base inicial do aplicativo. As funcionalidades do projeto serão
        construídas pela equipe.
      </Text>
      <Link href="/comunicados" asChild>
        <Button mode="contained">Mural de comunicados</Button>
      </Link>
      <Link href="/sobre" asChild>
        <Button mode="contained">Sobre o projeto</Button>
      </Link>
      <Link href="/equipe" asChild>
        <Button mode="outlined">Equipe</Button>
      </Link>
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
