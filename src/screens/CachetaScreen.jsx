import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, FlatList
} from 'react-native';
import { criarBaralho, embaralhar } from '../game/deck';
import {
  podeBater, calcularLixo, encontrarGrupos,
  tipoCombinacao, pontosLixo,
} from '../game/cachetaRules';
import {
  iaDescartarCacheta, iaDeveComprarDescarte,
  iaVerificarBateCacheta
} from '../game/aiLogic';
import Card from '../components/Card';
import ScoreBoard from '../components/ScoreBoard';

// Cacheta: cada jogador começa com 9 cartas
const CARTAS_INICIAIS = 9;

export default function CachetaScreen() {
  const [maoJogador, setMaoJogador]       = useState([]);
  const [maoIA, setMaoIA]                 = useState([]);
  const [pilha, setPilha]                 = useState([]);
  const [descarte, setDescarte]           = useState([]);
  const [pontos, setPontos]               = useState({ jogador: 0, ia: 0 });
  const [rodada, setRodada]               = useState(1);
  const [mensagem, setMensagem]           = useState('');
  const [fase, setFase]                   = useState('comprar'); // 'comprar' | 'descartar'
  const [cartaSelecionada, setCartaSelecionada] = useState(null);

  useEffect(() => { iniciarPartida(); }, []);

  function iniciarPartida() {
    const baralho = embaralhar(criarBaralho());

    // Cada jogador recebe 9 cartas
    const maoJ = baralho.slice(0, CARTAS_INICIAIS);
    const maoI = baralho.slice(CARTAS_INICIAIS, CARTAS_INICIAIS * 2);
    const resto = baralho.slice(CARTAS_INICIAIS * 2);

    // Primeira carta do resto vai para o descarte
    setMaoJogador(maoJ);
    setMaoIA(maoI);
    setPilha(resto.slice(1));
    setDescarte([resto[0]]);
    setCartaSelecionada(null);
    setFase('comprar');
    setMensagem('Compre uma carta da pilha ou do descarte!');
  }

  // ── TURNO DO JOGADOR ──────────────────────────────

  function comprarDaPilha() {
    if (fase !== 'comprar') return;
    if (pilha.length === 0) { setMensagem('Pilha vazia!'); return; }

    const carta    = pilha[0];
    const novaPilha = pilha.slice(1);
    setPilha(novaPilha);

    // Jogador fica momentaneamente com 10 cartas
    const novaMao = [...maoJogador, carta];
    setMaoJogador(novaMao);
    setCartaSelecionada(null);
    setFase('descartar');
    setMensagem(`Você comprou ${carta.valor}. Agora descarte uma carta (${novaMao.length} cartas).`);

    verificarBateAposCompra(novaMao);
  }

  function comprarDoDescarte() {
    if (fase !== 'comprar') return;
    if (descarte.length === 0) return;

    const carta    = descarte[descarte.length - 1];
    const novoDesc = descarte.slice(0, -1);
    setDescarte(novoDesc);

    const novaMao = [...maoJogador, carta];
    setMaoJogador(novaMao);
    setCartaSelecionada(null);
    setFase('descartar');
    setMensagem(`Você pegou ${carta.valor} do descarte. Agora descarte uma carta (${novaMao.length} cartas).`);

    verificarBateAposCompra(novaMao);
  }

  function verificarBateAposCompra(mao) {
    // Com 10 cartas, verifica se pode bater descartando alguma
    for (const carta of mao) {
      const maoSemCarta = mao.filter(c => c !== carta);
      if (podeBater(maoSemCarta)) {
        setMensagem(`🎉 Você pode BATER! Descarte ${carta.valor} para vencer!`);
        return;
      }
    }
  }

  function descartarCarta(carta) {
    if (fase !== 'descartar') return;

    const novaMao = maoJogador.filter(c => c !== carta);

    // Deve ficar com exatamente 9 cartas após descartar
    if (novaMao.length !== 9) {
      setMensagem('Erro: você deve ficar com 9 cartas!');
      return;
    }

    setMaoJogador(novaMao);
    setDescarte(prev => [...prev, carta]);
    setCartaSelecionada(null);

    // Verifica se pode bater após descartar
    if (podeBater(novaMao)) {
      setMensagem('🎉 Você tem um jogo completo! Clique em BATER para vencer!');
      setFase('comprar');
      return;
    }

    const lixo = calcularLixo(novaMao);
    setFase('comprar');
    setMensagem(`Descartou ${carta.valor}. Lixo: ${lixo.length} carta(s). Vez da IA...`);

    setTimeout(() => turnoIA(novaMao, [...descarte, carta]), 800);
  }

  function bater() {
    if (!podeBater(maoJogador)) {
      setMensagem('❌ Você ainda não pode bater! Todas as 9 cartas precisam estar em combinações válidas.');
      return;
    }

    const grupos = encontrarGrupos(maoJogador);
    const descricao = grupos.map((g, i) =>
      `Grupo ${i + 1}: ${tipoCombinacao(g)} (${g.map(c => `${c.valor}${c.naipe[0]}`).join(', ')})`
    ).join('\n');

    const novosPontos = { ...pontos, jogador: pontos.jogador + 1 };
    setPontos(novosPontos);

    Alert.alert(
      '🏆 CACHETA! Você bateu!',
      `Suas combinações:\n${descricao}\n\nPlacar: Você ${novosPontos.jogador} x ${novosPontos.ia} IA`,
      [{ text: 'Nova Partida', onPress: () => { setRodada(p => p + 1); iniciarPartida(); } }]
    );
  }

  // ── TURNO DA IA ───────────────────────────────────

  function turnoIA(maoAtualJogador, descarteAtual) {
    setMensagem('IA está jogando...');

    // IA decide comprar do descarte ou da pilha
    const topoDescarte = descarteAtual[descarteAtual.length - 1];
    const deveComprarDesc = iaDeveComprarDescarte(maoIA, topoDescarte);

    let cartaComprada, novaPilha, novoDescarte;

    if (deveComprarDesc && topoDescarte) {
      cartaComprada = topoDescarte;
      novoDescarte  = descarteAtual.slice(0, -1);
      novaPilha     = pilha;
    } else {
      if (pilha.length === 0) {
        setMensagem('Pilha vazia! Sua vez.');
        setFase('comprar');
        return;
      }
      cartaComprada = pilha[0];
      novaPilha     = pilha.slice(1);
      novoDescarte  = descarteAtual;
    }

    // IA fica com 10 cartas
    const maoIAComCarta = [...maoIA, cartaComprada];

    // IA verifica se pode bater com 10 cartas (descartando alguma)
    for (const carta of maoIAComCarta) {
      const maoSemCarta = maoIAComCarta.filter(c => c !== carta);
      if (iaVerificarBateCacheta(maoSemCarta)) {
        const novosPontos = { ...pontos, ia: pontos.ia + 1 };
        setPontos(novosPontos);
        setMaoIA(maoSemCarta);
        setPilha(novaPilha);
        setDescarte([...novoDescarte, carta]);
        Alert.alert(
          '😢 A IA bateu!',
          `A IA formou todas as combinações!\n\nPlacar: Você ${novosPontos.jogador} x ${novosPontos.ia} IA`,
          [{ text: 'Nova Partida', onPress: () => { setRodada(p => p + 1); iniciarPartida(); } }]
        );
        return;
      }
    }

    // IA descarta a pior carta
    const cartaDescartada = iaDescartarCacheta(maoIAComCarta);
    const maoIAFinal      = maoIAComCarta.filter(c => c !== cartaDescartada);

    setMaoIA(maoIAFinal);
    setPilha(novaPilha);
    setDescarte([...novoDescarte, cartaDescartada]);
    setFase('comprar');
    setMensagem('Sua vez! Compre uma carta da pilha ou do descarte.');
  }

  // ── RENDER ────────────────────────────────────────

  const topoDescarte   = descarte.length > 0 ? descarte[descarte.length - 1] : null;
  const podeVencer     = podeBater(maoJogador);
  const lixoAtual      = calcularLixo(maoJogador);
  const pontosLixoAtual = pontosLixo(maoJogador);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>

      <ScoreBoard
        pontuacaoJogador={pontos.jogador}
        pontuacaoIA={pontos.ia}
        rodada={rodada}
      />

      {/* Info do jogo */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTexto}>
          🎯 Monte 3 grupos de 3 cartas (trinca ou sequência) para bater!
        </Text>
      </View>

      {/* Cartas da IA */}
      <View style={styles.secao}>
        <Text style={styles.label}>IA — {maoIA.length} cartas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.maoContainer}>
            {maoIA.map((_, i) => (
              <Card key={i} carta={{ valor: '?', naipe: 'paus' }} virada />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Pilha e Descarte */}
      <View style={styles.pilhasContainer}>
        <View style={styles.pilha}>
          <Text style={styles.label}>Pilha ({pilha.length})</Text>
          <TouchableOpacity
            onPress={comprarDaPilha}
            disabled={fase !== 'comprar'}
            style={fase !== 'comprar' ? styles.desabilitado : null}
          >
            <Card carta={{ valor: '?', naipe: 'paus' }} virada />
          </TouchableOpacity>
        </View>

        <View style={styles.pilha}>
          <Text style={styles.label}>Descarte</Text>
          {topoDescarte
            ? <TouchableOpacity
                onPress={comprarDoDescarte}
                disabled={fase !== 'comprar'}
                style={fase !== 'comprar' ? styles.desabilitado : null}
              >
                <Card carta={topoDescarte} />
              </TouchableOpacity>
            : <View style={styles.espacoCarta} />
          }
        </View>
      </View>

      {/* Mensagem */}
      <View style={[styles.mensagemBox, podeVencer && styles.mensagemVitoria]}>
        <Text style={styles.mensagem}>{mensagem}</Text>
      </View>

      {/* Status do lixo */}
      <View style={styles.statusBox}>
        <Text style={styles.statusTexto}>
          📊 Lixo: {lixoAtual.length} carta(s) | Pontos de lixo: {pontosLixoAtual}
        </Text>
      </View>

      {/* Sua mão — com 9 ou 10 cartas */}
      <View style={styles.secao}>
        <Text style={styles.label}>
          Sua mão ({maoJogador.length} cartas)
          {fase === 'descartar' ? ' — Toque para descartar' : ''}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.maoContainer}>
            {maoJogador.map((carta, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  if (fase === 'descartar') {
                    descartarCarta(carta);
                  } else {
                    setCartaSelecionada(cartaSelecionada === carta ? null : carta);
                  }
                }}
                style={cartaSelecionada === carta ? styles.cartaSelecionada : null}
              >
                <Card
                  carta={carta}
                  desabilitada={false}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Botões */}
      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={[styles.botao, styles.botaoBater, !podeVencer && styles.botaoDesabilitado]}
          onPress={bater}
          disabled={!podeVencer}
        >
          <Text style={styles.botaoTexto}>🏆 BATER!</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, styles.botaoNovo]}
          onPress={() => { setRodada(p => p + 1); iniciarPartida(); }}
        >
          <Text style={styles.botaoTexto}>🔄 Nova Partida</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#1a1a2e' },
  conteudo:         { paddingBottom: 40 },
  infoBox: {
    backgroundColor: '#16213e',
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 10, padding: 10,
  },
  infoTexto:        { color: '#e9c46a', fontSize: 13, textAlign: 'center' },
  secao:            { marginVertical: 8, paddingHorizontal: 10 },
  label:            { color: '#aaa', fontSize: 13, marginBottom: 6, paddingHorizontal: 6 },
  maoContainer:     { flexDirection: 'row', paddingHorizontal: 4 },
  pilhasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingHorizontal: 30,
  },
  pilha:            { alignItems: 'center' },
  espacoCarta: {
    width: 70, height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  desabilitado:     { opacity: 0.4 },
  mensagemBox: {
    backgroundColor: '#16213e',
    marginHorizontal: 16, marginVertical: 6,
    borderRadius: 10, padding: 12,
  },
  mensagemVitoria:  { backgroundColor: '#2a9d3a', borderWidth: 2, borderColor: '#4ade80' },
  mensagem:         { color: '#fff', fontSize: 14, textAlign: 'center' },
  statusBox: {
    marginHorizontal: 16, marginBottom: 6,
    alignItems: 'center',
  },
  statusTexto:      { color: '#aaa', fontSize: 12 },
  cartaSelecionada: { transform: [{ translateY: -10 }] },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  botao: {
    flex: 1, padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  botaoBater:       { backgroundColor: '#2a9d8f' },
  botaoNovo:        { backgroundColor: '#555' },
  botaoDesabilitado:{ opacity: 0.4 },
  botaoTexto:       { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});