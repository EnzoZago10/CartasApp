import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';

const jogos = [
  { id: '1', nome: 'Truco',     emoji: '🃏', tela: 'Truco',    cor: '#e63946' },
  { id: '2', nome: 'Cacheta',   emoji: '🎴', tela: 'Cacheta',  cor: '#2a9d8f' },
  { id: '3', nome: 'Pôquer',    emoji: '♠️',  tela: 'Poker',    cor: '#457b9d' },
  { id: '4', nome: 'Paciência', emoji: '🂡',  tela: 'Paciencia',cor: '#e9c46a' },
  { id: '5', nome: 'Porco',     emoji: '🐷', tela: 'Porco',    cor: '#f4a261' },
];

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>🃏 CartasApp</Text>
      <Text style={styles.subtitulo}>Escolha um jogo para começar</Text>

      <FlatList
        data={jogos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { borderLeftColor: item.cor }]}
            onPress={() => navigation.navigate(item.tela)}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.nomeJogo}>{item.nome}</Text>
            <Text style={styles.seta}>›</Text>
          </TouchableOpacity>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 40,
  },
  lista: {
    gap: 16,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
  },
  emoji: {
    fontSize: 32,
    marginRight: 16,
  },
  nomeJogo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  seta: {
    fontSize: 28,
    color: '#aaa',
  },
});