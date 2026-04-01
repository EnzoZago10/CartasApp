import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { carregarPontuacao, limparPontuacoes } from '../utils/storage';

const jogos = [
  { id: '1', nome: 'Truco',     emoji: '🃏', tela: 'Truco',     cor: '#e63946', chave: 'truco'     },
  { id: '2', nome: 'Cacheta',   emoji: '🎴', tela: 'Cacheta',   cor: '#2a9d8f', chave: 'cacheta'   },
  { id: '3', nome: 'Pôquer',    emoji: '♠️',  tela: 'Poker',     cor: '#457b9d', chave: 'poker'     },
  { id: '4', nome: 'Paciência', emoji: '🂡',  tela: 'Paciencia', cor: '#e9c46a', chave: 'paciencia' },
  { id: '5', nome: 'Porco',     emoji: '🐷', tela: 'Porco',     cor: '#f4a261', chave: 'porco'     },
];

export default function HomeScreen({ navigation }) {
  const [placar, setPlacar] = useState({});

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarTodosPlacar();
    });
    return unsubscribe;
  }, [navigation]);

  async function carregarTodosPlacar() {
    const resultados = {};
    for (const jogo of jogos) {
      resultados[jogo.chave] = await carregarPontuacao(jogo.chave);
    }
    setPlacar(resultados);
  }

  async function resetarPlacar() {
    await limparPontuacoes();
    carregarTodosPlacar();
  }

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>🃏 CartasApp</Text>
      <Text style={styles.subtitulo}>Escolha um jogo para começar</Text>

      <FlatList
        data={jogos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => {
          const p = placar[item.chave];
          return (
            <TouchableOpacity
              style={[styles.card, { borderLeftColor: item.cor }]}
              onPress={() => navigation.navigate(item.tela)}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={styles.info}>
                <Text style={styles.nomeJogo}>{item.nome}</Text>
                {p && (
                  <Text style={styles.placar}>
                    Você {p.jogador} x {p.ia} IA
                  </Text>
                )}
              </View>
              <Text style={styles.seta}>›</Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.botaoReset} onPress={resetarPlacar}>
        <Text style={styles.botaoResetTexto}>🗑️ Resetar Placar</Text>
      </TouchableOpacity>

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
  info: {
    flex: 1,
  },
  nomeJogo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placar: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 2,
  },
  seta: {
    fontSize: 28,
    color: '#aaa',
  },
  botaoReset: {
    margin: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff11',
  },
  botaoResetTexto: {
    color: '#aaa',
    fontSize: 14,
  },
});