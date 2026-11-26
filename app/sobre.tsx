import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Sobre o projeto</Text>
      <Text variant="bodyLarge">
        Esta tela é um ponto de partida para apresentar o propósito do
        aplicativo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    padding: 24,
  },
});
