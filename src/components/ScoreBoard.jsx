import { View, Text, StyleSheet } from 'react-native';

export default function ScoreBoard({ pontuacaoJogador, pontuacaoIA, rodada }) {
  return (
    <View style={styles.container}>

      <View style={styles.lado}>
        <Text style={styles.label}>Você</Text>
        <Text style={styles.pontos}>{pontuacaoJogador}</Text>
      </View>

      <View style={styles.centro}>
        <Text style={styles.rodada}>Rodada {rodada}</Text>
      </View>

      <View style={styles.lado}>
        <Text style={styles.label}>IA</Text>
        <Text style={styles.pontos}>{pontuacaoIA}</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  lado: {
    flex: 1,
    alignItems: 'center',
  },
  centro: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  pontos: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  rodada: {
    color: '#e9c46a',
    fontSize: 14,
    fontWeight: 'bold',
  },
});