import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { criarBaralho, embaralhar } from '../game/deck';
import { temQuadra, iaEscolherCartaPorco, distribuirCartas4 } from '../game/porcoRules';
import Card from '../components/Card';
import ScoreBoard from '../components/ScoreBoard';

export default function PorcoScreen() {
  const [maoJogador, setMaoJogador]   = useState([]);
  const [maoIA, setMaoIA]             = useState([]);
  const [pontos, setPontos]           = useState({ jogador: 0, ia: 0 });
  const [rodada, setRodada]           = useState(1);
  const [mensagem, setMensagem]       = useState('Escolha uma carta para passar para a IA!');
  const [fase, setFase]               = useState('jogando'); // 'jogando' | 'nariz' | 'fim'
  const [narizVisivel, setNarizVisivel] = useState(false);
  const piscar                          = useRef(new Animated.Value(1)).current;

  useEffect(() => { iniciarPartida(); }, []);

  // Animação do botão nariz piscando
  useEffect(() => {
    if (narizVisivel) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(piscar, { toValue: 0.2, duration: 300, useNativeDriver: true }),
          Animated.timing(piscar, { toValue: 1,   duration: 300, useNativeDriver: true }),
        ])
      ).start();
    } else {
      piscar.setValue(1);
    }
  }, [narizVisivel]);

  function iniciarPartida() {
    const baralho = embaralhar(criarBaralho());
    const { maoJogador, maoIA } = distribuirCartas4(baralho);
    setMaoJogador(maoJogador);
    setMaoIA(maoIA);
    setFase('jogando');
    setNarizVisivel(false);
    setMensagem('Escolha uma carta para passar para a IA!');
  }

  function passarCarta(carta) {
    if (fase !== 'jogando') return;

    // Jogador passa a carta escolhida para a IA
    const novaMaoJogador = maoJogador.filter(c => c !== carta);

    // IA escolhe qual carta vai passar para o jogador
    const cartaPassadaIA = iaEscolherCartaPorco(maoIA);
    const novaMaoIA = maoIA.filter(c => c !== cartaPassadaIA);

    // Troca: jogador recebe carta da IA, IA recebe carta do jogador
    const maoJogadorFinal = [...novaMaoJogador, cartaPassadaIA];
    const maoIAFinal      = [...novaMaoIA, carta];

    setMaoJogador(maoJogadorFinal);
    setMaoIA(maoIAFinal);

    // Verifica se a IA formou quadra
    if (temQuadra(maoIAFinal)) {
      setMensagem('👃 A IA tocou o nariz! Toque rápido antes que seja tarde!');
      setNarizVisivel(true);
      setFase('nariz');

      // IA "tocou o nariz" — jogador tem 3 segundos para reagir
      setTimeout(() => {
        if (fase !== 'fim') {
          // Jogador não tocou a tempo
          const novosPontos = { ...pontos, ia: pontos.ia + 1 };
          setPontos(novosPontos);
          setNarizVisivel(false);
          setFase('fim');
          Alert.alert(
            '😢 Tarde demais!',
            `A IA formou quadra de ${maoIAFinal[0].valor} e você não tocou o nariz a tempo!\n\nPlacar: Você ${novosPontos.jogador} x ${novosPontos.ia} IA`,
            [{ text: 'Nova Rodada', onPress: () => { setRodada(p => p + 1); iniciarPartida(); } }]
          );
        }
      }, 3000);
      return;
    }

    // Verifica se o jogador formou quadra
    if (temQuadra(maoJogadorFinal)) {
      setMensagem('👃 Você formou quadra! Toque no nariz agora!');
      setNarizVisivel(true);
      setFase('nariz');
      return;
    }

    setMensagem('Boa troca! Escolha outra carta para passar.');
  }

  function tocarNariz() {
    if (fase !== 'nariz') return;

    setNarizVisivel(false);
    setFase('fim');

    // Verifica se o jogador formou quadra (tocou certo)
    if (temQuadra(maoJogador)) {
      const novosPontos = { ...pontos, jogador: pontos.jogador + 1 };
      setPontos(novosPontos);
      Alert.alert(
        '🏆 Você tocou o nariz!',
        `Você formou quadra de ${maoJogador[0].valor} e tocou o nariz!\n\nPlacar: Você ${novosPontos.jogador} x ${novosPontos.ia} IA`,
        [{ text: 'Nova Rodada', onPress: () => { setRodada(p => p + 1); iniciarPartida(); } }]
      );
    } else {
      // Tocou o nariz sem ter quadra — perde!
      const novosPontos = { ...pontos, ia: pontos.ia + 1 };
      setPontos(novosPontos);
      Alert.alert(
        '😅 Falso alarme!',
        `Você tocou o nariz sem ter quadra! A IA ganha o ponto.\n\nPlacar: Você ${novosPontos.jogador} x ${novosPontos.ia} IA`,
        [{ text: 'Nova Rodada', onPress: () => { setRodada(p => p + 1); iniciarPartida(); } }]
      );
    }
  }

  // Conta cartas iguais na mão do jogador para mostrar progresso
  function progressoQuadra(mao) {
    const contagem = {};
    for (const c of mao) contagem[c.valor] = (contagem[c.valor] || 0) + 1;
    return Math.max(...Object.values(contagem));
  }

  const progresso = progressoQuadra(maoJogador);

  return (
    <View style={styles.container}>

      <ScoreBoard
        pontuacaoJogador={pontos.jogador}
        pontuacaoIA={pontos.ia}
        rodada={rodada}
      />

      {/* Instrução */}
      <View style={styles.instrucao}>
        <Text style={styles.instrucaoTexto}>
          🎯 Colete 4 cartas do mesmo valor e toque o nariz!
        </Text>
      </View>

      {/* Cartas da IA (todas viradas) */}
      <View style={styles.secao}>
        <Text style={styles.label}>IA — {maoIA.length} cartas</Text>
        <View style={styles.maoContainer}>
          {maoIA.map((_, i) => (
            <Card key={i} carta={{ valor: '?', naipe: 'paus' }} virada />
          ))}
        </View>
      </View>

      {/* Progresso do jogador */}
      <View style={styles.progressoContainer}>
        <Text style={styles.progressoTexto}>
          Seu progresso: {progresso}/4 cartas iguais
        </Text>
        <View style={styles.progressoBarra}>
          {[1, 2, 3, 4].map(i => (
            <View
              key={i}
              style={[styles.progressoPonto, i <= progresso && styles.progressoAtivo]}
            />
          ))}
        </View>
      </View>

      {/* Mensagem */}
      <Text style={styles.mensagem}>{mensagem}</Text>

      {/* Suas cartas — toque para passar */}
      <View style={styles.secao}>
        <Text style={styles.label}>
          {fase === 'jogando' ? 'Toque em uma carta para passá-la à IA' : 'Sua mão'}
        </Text>
        <View style={styles.maoContainer}>
          {maoJogador.map((carta, i) => (
            <Card
              key={i}
              carta={carta}
              onPress={() => passarCarta(carta)}
              desabilitada={fase !== 'jogando'}
            />
          ))}
        </View>
      </View>

      {/* Botão Nariz — aparece quando alguém forma quadra */}
      {narizVisivel && (
        <Animated.View style={[styles.narizContainer, { opacity: piscar }]}>
          <TouchableOpacity style={styles.botaoNariz} onPress={tocarNariz}>
            <Text style={styles.botaoNarizTexto}>👃 TOQUE O NARIZ!</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <TouchableOpacity
        style={[styles.botao, styles.botaoNovo]}
        onPress={() => { setRodada(p => p + 1); iniciarPartida(); }}
      >
        <Text style={styles.botaoTexto}>🔄 Nova Partida</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 10 },
  instrucao:          { backgroundColor: '#16213e', marginHorizontal: 20, marginBottom: 10, borderRadius: 10, padding: 10 },
  instrucaoTexto:     { color: '#e9c46a', fontSize: 13, textAlign: 'center' },
  secao:              { alignItems: 'center', marginVertical: 8 },
  label:              { color: '#aaa', fontSize: 13, marginBottom: 6 },
  maoContainer:       { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  progressoContainer: { alignItems: 'center', marginVertical: 8 },
  progressoTexto:     { color: '#aaa', fontSize: 13, marginBottom: 6 },
  progressoBarra:     { flexDirection: 'row', gap: 8 },
  progressoPonto: {
    width: 20, height: 20,
    borderRadius: 10,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555',
  },
  progressoAtivo:     { backgroundColor: '#e9c46a' },
  mensagem:           { color: '#fff', fontSize: 15, textAlign: 'center', marginVertical: 6, paddingHorizontal: 20 },
  narizContainer:     { alignItems: 'center', marginVertical: 10 },
  botaoNariz: {
    backgroundColor: '#e63946',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  botaoNarizTexto:    { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  botao:              { padding: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 20, marginTop: 8 },
  botaoNovo:          { backgroundColor: '#555' },
  botaoTexto:         { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});