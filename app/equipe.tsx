import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function TeamScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Equipe</Text>
      <Text variant="bodyLarge">
        Adicione aqui a apresentação dos integrantes e suas contribuições.
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
