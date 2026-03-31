import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { criarBaralho, distribuirMaos } from '../game/deck';
import { avaliarMao, resolverPoker, COMBINACOES } from '../game/pokerRules';
import { iaDecidirPoker } from '../game/aiLogic';
import Card from '../components/Card';
import ScoreBoard from '../components/ScoreBoard';

export default function PokerScreen() {
  const [maoJogador, setMaoJogador]         = useState([]);
  const [maoIA, setMaoIA]                   = useState([]);
  const [pilha, setPilha]                   = useState([]);
  const [selecionadas, setSelecionadas]     = useState([]);
  const [fichas, setFichas]                 = useState({ jogador: 100, ia: 100 });
  const [pote, setPote]                     = useState(0);
  const [pontos, setPontos]                 = useState({ jogador: 0, ia: 0 });
  const [rodada, setRodada]                 = useState(1);
  const [fase, setFase]                     = useState('trocar'); // 'trocar' ou 'apostar'
  const [mensagem, setMensagem]             = useState('Selecione cartas para trocar (máx. 3)');
  const [aposta, setAposta]                 = useState(10);

  useEffect(() => { iniciarPartida(); }, []);

  function iniciarPartida() {
    const baralho = criarBaralho();
    const { maoJogador, maoIA, restante } = distribuirMaos(baralho, 5);
    setMaoJogador(maoJogador);
    setMaoIA(maoIA);
    setPilha(restante);
    setSelecionadas([]);
    setPote(0);
    setFase('trocar');
    setMensagem('Selecione cartas para trocar (máx. 3)');
  }

  function toggleSelecionada(carta) {
    if (fase !== 'trocar') return;
    setSelecionadas(prev => {
      if (prev.includes(carta)) return prev.filter(c => c !== carta);
      if (prev.length >= 3) return prev;
      return [...prev, carta];
    });
  }

  function trocarCartas() {
    if (fase !== 'trocar') return;
    if (pilha.length < selecionadas.length) {
      setMensagem('Pilha insuficiente!');
      return;
    }

    const novasCartas = pilha.slice(0, selecionadas.length);
    const novaPilha   = pilha.slice(selecionadas.length);
    const novaMao     = maoJogador
      .filter(c => !selecionadas.includes(c))
      .concat(novasCartas);

    setMaoJogador(novaMao);
    setPilha(novaPilha);
    setSelecionadas([]);
    setFase('apostar');
    setMensagem(`Sua mão: ${COMBINACOES[avaliarMao(novaMao)]}. Hora de apostar!`);
  }

  function apostar() {
    if (fichas.jogador < aposta) {
      setMensagem('Fichas insuficientes!');
      return;
    }

    const decisaoIA = iaDecidirPoker(maoIA, aposta, fichas.ia);
    const novoPote  = pote + aposta * 2;

    setFichas(prev => ({ ...prev, jogador: prev.jogador - aposta }));

    if (decisaoIA === 'desistir') {
      const novosPontos = { ...pontos, jogador: pontos.jogador + 1 };
      const novasFichas = { ...fichas, jogador: fichas.jogador - aposta + novoPote };
      setPontos(novosPontos);
      setFichas(novasFichas);
      Alert.alert('🏆 A IA desistiu! Você ganhou!', `+${novoPote} fichas`, [
        { text: 'Nova Mão', onPress: iniciarPartida },
      ]);
      return;
    }

    setFichas(prev => ({ ...prev, ia: prev.ia - aposta }));
    setPote(novoPote);
    resolverShowdown(novoPote);
  }

  function resolverShowdown(novoPote) {
    const resultado   = resolverPoker(maoJogador, maoIA);
    const combinacaoJ = COMBINACOES[avaliarMao(maoJogador)];
    const combinacaoI = COMBINACOES[avaliarMao(maoIA)];

    let titulo, novosPontos, novasFichas;

    if (resultado === 'jogador') {
      titulo       = `🏆 Você ganhou!\nSua mão: ${combinacaoJ}\nIA: ${combinacaoI}`;
      novosPontos  = { ...pontos, jogador: pontos.jogador + 1 };
      novasFichas  = { ...fichas, jogador: fichas.jogador + novoPote };
    } else if (resultado === 'ia') {
      titulo       = `😢 A IA ganhou!\nSua mão: ${combinacaoJ}\nIA: ${combinacaoI}`;
      novosPontos  = { ...pontos, ia: pontos.ia + 1 };
      novasFichas  = { ...fichas, ia: fichas.ia + novoPote };
    } else {
      titulo       = `🤝 Empate!\nSua mão: ${combinacaoJ}\nIA: ${combinacaoI}`;
      novosPontos  = pontos;
      novasFichas  = { jogador: fichas.jogador + novoPote / 2, ia: fichas.ia + novoPote / 2 };
    }

    setPontos(novosPontos);
    setFichas(novasFichas);
    setRodada(prev => prev + 1);

    Alert.alert(titulo, `Placar: Você ${novosPontos.jogador} x ${novosPontos.ia} IA`, [
      { text: 'Nova Mão', onPress: iniciarPartida },
    ]);
  }

  function desistir() {
    const novosPontos = { ...pontos, ia: pontos.ia + 1 };
    setPontos(novosPontos);
    Alert.alert('😢 Você desistiu!', `Placar: Você ${novosPontos.jogador} x ${novosPontos.ia} IA`, [
      { text: 'Nova Mão', onPress: iniciarPartida },
    ]);
  }

  return (
    <View style={styles.container}>

      <ScoreBoard
        pontuacaoJogador={pontos.jogador}
        pontuacaoIA={pontos.ia}
        rodada={rodada}
      />

      {/* Fichas e Pote */}
      <View style={styles.fichasContainer}>
        <Text style={styles.fichaTexto}>💰 Você: {fichas.jogador}</Text>
        <Text style={styles.poteTexto}>Pote: {pote}</Text>
        <Text style={styles.fichaTexto}>💰 IA: {fichas.ia}</Text>
      </View>

      {/* Cartas da IA */}
      <View style={styles.secao}>
        <Text style={styles.label}>Cartas da IA</Text>
        <View style={styles.maoContainer}>
          {maoIA.map((_, i) => (
            <Card key={i} carta={{ valor: '?', naipe: 'paus' }} virada />
          ))}
        </View>
      </View>

      {/* Mensagem */}
      <Text style={styles.mensagem}>{mensagem}</Text>

      {/* Suas cartas */}
      <View style={styles.secao}>
        <Text style={styles.label}>
          {fase === 'trocar'
            ? `Sua mão — toque para selecionar (${selecionadas.length}/3)`
            : 'Sua mão'}
        </Text>
        <View style={styles.maoContainer}>
          {maoJogador.map((carta, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => toggleSelecionada(carta)}
              style={selecionadas.includes(carta) ? styles.cartaSelecionada : null}
            >
              <Card
                carta={carta}
                desabilitada={fase !== 'trocar'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Botões */}
      <View style={styles.botoesContainer}>
        {fase === 'trocar' ? (
          <TouchableOpacity style={[styles.botao, styles.botaoTrocar]} onPress={trocarCartas}>
            <Text style={styles.botaoTexto}>
              {selecionadas.length > 0 ? `🔄 Trocar ${selecionadas.length} carta(s)` : '➡️ Manter mão'}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={[styles.botao, styles.botaoApostar]} onPress={apostar}>
              <Text style={styles.botaoTexto}>💰 Apostar {aposta}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.botao, styles.botaoDesistir]} onPress={desistir}>
              <Text style={styles.botaoTexto}>🏳️ Desistir</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity style={[styles.botao, styles.botaoNovo, { margin: 10 }]} onPress={iniciarPartida}>
        <Text style={styles.botaoTexto}>🔄 Nova Partida</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 10,
  },
  fichasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  fichaTexto: {
    color: '#e9c46a',
    fontSize: 14,
    fontWeight: 'bold',
  },
  poteTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  secao: {
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 6,
  },
  maoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  cartaSelecionada: {
    transform: [{ translateY: -12 }],
  },
  mensagem: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  botao: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  botaoTrocar:   { backgroundColor: '#457b9d' },
  botaoApostar:  { backgroundColor: '#2a9d8f' },
  botaoDesistir: { backgroundColor: '#e63946' },
  botaoNovo:     { backgroundColor: '#555', marginHorizontal: 20 },
  botaoTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});