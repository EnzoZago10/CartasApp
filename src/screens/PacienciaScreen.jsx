import { View, Text, StyleSheet } from 'react-native';

export default function TrucoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Paciência</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a2e' },
  texto: { color: '#fff', fontSize: 24 },
});