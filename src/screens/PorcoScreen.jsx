import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { criarBaralho, embaralhar } from '../game/deck';
import { calcularPontuacaoPorco, estourou, resolverPorco } from '../game/porcoRules';
import { iaDecidirPorco } from '../game/aiLogic';
import Card from '../components/Card';
import ScoreBoard from '../components/ScoreBoard';

export default function PorcoScreen() {
  const [maoJogador, setMaoJogador] = useState([]);
  const [maoIA, setMaoIA]           = useState([]);
  const [pilha, setPilha]           = useState([]);
  const [pontos, setPontos]         = useState({ jogador: 0, ia: 0 });
  const [rodada, setRodada]         = useState(1);
  const [fase, setFase]             = useState('jogando'); // 'jogando' ou 'fim'
  const [mensagem, setMensagem]     = useState('Compre uma carta ou pare!');
  const [iaParou, setIaParou]       = useState(false);

  useEffect(() => { iniciarPartida(); }, []);

  function iniciarPartida() {
    const baralho = embaralhar(criarBaralho());
    setMaoJogador([baralho[0]]);
    setMaoIA([baralho[1]]);
    setPilha(baralho.slice(2));
    setFase('jogando');
    setIaParou(false);
    setRodada(prev => prev + 1);
    setMensagem('Compre uma carta ou pare!');
  }

  function comprarCarta() {
    if (fase !== 'jogando') return;
    if (pilha.length === 0) {
      setMensagem('Pilha vazia!');
      return;
    }

    const novaCarta   = pilha[0];
    const novaPilha   = pilha.slice(1);
    const novaMao     = [...maoJogador, novaCarta];

    setPilha(novaPilha);
    setMaoJogador(novaMao);

    const pontuacao = calcularPontuacaoPorco(novaMao);

    if (estourou(novaMao)) {
      setMensagem(`💥 Você estourou com ${pontuacao} pontos!`);
      setFase('fim');
      setTimeout(() => encerrarRodada(novaMao, maoIA), 1000);
      return;
    }

    if (pontuacao === 21) {
      setMensagem('🎉 21 pontos exatos!');
      setFase('fim');
      setTimeout(() => encerrarRodada(novaMao, maoIA), 1000);
      return;
    }

    setMensagem(`Você tem ${pontuacao} pontos. Comprar mais ou parar?`);

    // IA joga se ainda não parou
    if (!iaParou) {
      setTimeout(() => turnoIA(novaPilha), 600);
    }
  }

  function turnoIA(pilhaAtual) {
    const pontuacaoIA = calcularPontuacaoPorco(maoIA);
    const decisao     = iaDecidirPorco(maoIA, pontuacaoIA);

    if (decisao === 'parar') {
      setIaParou(true);
      return;
    }

    if (pilhaAtual.length === 0) return;

    const novaCarta = pilhaAtual[0];
    const novaPilha = pilhaAtual.slice(1);
    const novaMaoIA = [...maoIA, novaCarta];

    setPilha(novaPilha);
    setMaoIA(novaMaoIA);

    if (estourou(novaMaoIA)) {
      setIaParou(true);
    }
  }

  function parar() {
    if (fase !== 'jogando') return;
    setFase('fim');
    encerrarRodada(maoJogador, maoIA);
  }

  function encerrarRodada(maoJ, maoI) {
    const resultado  = resolverPorco(maoJ, maoI);
    const pontuacaoJ = calcularPontuacaoPorco(maoJ);
    const pontuacaoI = calcularPontuacaoPorco(maoI);

    let titulo, novosPontos;

    if (resultado === 'jogador') {
      titulo      = `🏆 Você ganhou!\nVocê: ${pontuacaoJ} pts | IA: ${pontuacaoI} pts`;
      novosPontos = { ...pontos, jogador: pontos.jogador + 1 };
    } else if (resultado === 'ia') {
      titulo      = `😢 A IA ganhou!\nVocê: ${pontuacaoJ} pts | IA: ${pontuacaoI} pts`;
      novosPontos = { ...pontos, ia: pontos.ia + 1 };
    } else {
      titulo      = `🤝 Empate!\nVocê: ${pontuacaoJ} pts | IA: ${pontuacaoI} pts`;
      novosPontos = pontos;
    }

    setPontos(novosPontos);

    Alert.alert(titulo, `Placar: Você ${novosPontos.jogador} x ${novosPontos.ia} IA`, [
      { text: 'Nova Rodada', onPress: iniciarPartida },
    ]);
  }

  const pontuacaoJogador = calcularPontuacaoPorco(maoJogador);
  const pontuacaoIA      = calcularPontuacaoPorco(maoIA);

  return (
    <View style={styles.container}>

      <ScoreBoard
        pontuacaoJogador={pontos.jogador}
        pontuacaoIA={pontos.ia}
        rodada={rodada}
      />

      {/* Cartas da IA */}
      <View style={styles.secao}>
        <Text style={styles.label}>
          IA — {iaParou ? `${pontuacaoIA} pts (parou)` : `${maoIA.length} carta(s)`}
        </Text>
        <View style={styles.maoContainer}>
          {maoIA.map((carta, i) => (
            fase === 'fim'
              ? <Card key={i} carta={carta} desabilitada />
              : <Card key={i} carta={{ valor: '?', naipe: 'paus' }} virada />
          ))}
        </View>
      </View>

      {/* Mensagem */}
      <Text style={styles.mensagem}>{mensagem}</Text>

      {/* Suas cartas */}
      <View style={styles.secao}>
        <Text style={styles.label}>
          Sua mão — {pontuacaoJogador} pontos
        </Text>
        <View style={styles.maoContainer}>
          {maoJogador.map((carta, i) => (
            <Card key={i} carta={carta} desabilitada />
          ))}
        </View>
      </View>

      {/* Botões */}
      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={[styles.botao, styles.botaoComprar,
            fase !== 'jogando' && styles.botaoDesabilitado]}
          onPress={comprarCarta}
          disabled={fase !== 'jogando'}
        >
          <Text style={styles.botaoTexto}>🃏 Comprar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, styles.botaoParar,
            fase !== 'jogando' && styles.botaoDesabilitado]}
          onPress={parar}
          disabled={fase !== 'jogando'}
        >
          <Text style={styles.botaoTexto}>✋ Parar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.botao, styles.botaoNovo, { margin: 20 }]}
        onPress={iniciarPartida}
      >
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
  secao: {
    alignItems: 'center',
    marginVertical: 10,
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
  mensagem: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  botao: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  botaoComprar:      { backgroundColor: '#2a9d8f' },
  botaoParar:        { backgroundColor: '#e63946' },
  botaoNovo:         { backgroundColor: '#555' },
  botaoDesabilitado: { opacity: 0.4 },
  botaoTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});