import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { criarBaralho, embaralhar } from '../game/deck';
import { podeBater, calcularPontuacao } from '../game/cachetaRules';
import { iaDescartarCacheta, iaVerificarBateCacheta } from '../game/aiLogic';
import Card from '../components/Card';
import ScoreBoard from '../components/ScoreBoard';

export default function CachetaScreen() {
  const [maoJogador, setMaoJogador]     = useState([]);
  const [maoIA, setMaoIA]               = useState([]);
  const [pilha, setPilha]               = useState([]);
  const [descarte, setDescarte]         = useState([]);
  const [pontos, setPontos]             = useState({ jogador: 0, ia: 0 });
  const [rodada, setRodada]             = useState(1);
  const [mensagem, setMensagem]         = useState('Compre uma carta para começar!');
  const [cartaComprada, setCartaComprada] = useState(null);
  const [fase, setFase]                 = useState('comprar'); // 'comprar' ou 'descartar'

  useEffect(() => { iniciarPartida(); }, []);

  function iniciarPartida() {
    const baralho = embaralhar(criarBaralho());
    setMaoJogador(baralho.slice(0, 3));
    setMaoIA(baralho.slice(3, 6));
    setPilha(baralho.slice(7));
    setDescarte([baralho[6]]);
    setCartaComprada(null);
    setFase('comprar');
    setRodada(1);
    setMensagem('Compre uma carta para começar!');
  }

  function comprarDaPilha() {
    if (fase !== 'comprar') return;
    if (pilha.length === 0) {
      setMensagem('Pilha vazia!');
      return;
    }
    const carta = pilha[0];
    setPilha(prev => prev.slice(1));
    setCartaComprada(carta);
    setMaoJogador(prev => [...prev, carta]);
    setFase('descartar');
    setMensagem('Agora descarte uma carta da sua mão.');
  }

  function comprarDoDescarte() {
    if (fase !== 'comprar') return;
    if (descarte.length === 0) return;
    const carta = descarte[descarte.length - 1];
    setDescarte(prev => prev.slice(0, -1));
    setCartaComprada(carta);
    setMaoJogador(prev => [...prev, carta]);
    setFase('descartar');
    setMensagem('Agora descarte uma carta da sua mão.');
  }

  function descartarCarta(carta) {
    if (fase !== 'descartar') return;
    const novaMao = maoJogador.filter(c => c !== carta);
    setMaoJogador(novaMao);
    setDescarte(prev => [...prev, carta]);
    setCartaComprada(null);
    setFase('comprar');
    setMensagem('Sua vez! Compre uma carta.');

    // Verifica se pode bater
    if (podeBater(novaMao)) {
      setMensagem('Você pode bater! Clique em Bater.');
      return;
    }

    // Vez da IA
    setTimeout(() => turnoIA(novaMao), 800);
  }

  function turnoIA(maoAtualJogador) {
    setMensagem('IA está jogando...');

    // IA compra da pilha
    if (pilha.length === 0) return;
    const cartaCompradaIA = pilha[0];
    const novaPilha = pilha.slice(1);
    setPilha(novaPilha);

    const novaMaoIA = [...maoIA, cartaCompradaIA];

    // IA verifica se pode bater
    if (iaVerificarBateCacheta(novaMaoIA)) {
      const novosPontos = { ...pontos, ia: pontos.ia + 1 };
      setPontos(novosPontos);
      Alert.alert('😢 A IA bateu!', `Placar: Você ${novosPontos.jogador} x ${novosPontos.ia} IA`, [
        { text: 'Nova Partida', onPress: iniciarPartida },
      ]);
      return;
    }

    // IA descarta
    const cartaDescartadaIA = iaDescartarCacheta(novaMaoIA, null);
    const maoIAFinal = novaMaoIA.filter(c => c !== cartaDescartadaIA);
    setMaoIA(maoIAFinal);
    setDescarte(prev => [...prev, cartaDescartadaIA]);
    setMensagem('Sua vez! Compre uma carta.');
  }

  function bater() {
    if (!podeBater(maoJogador)) {
      setMensagem('Você ainda não pode bater!');
      return;
    }
    const novosPontos = { ...pontos, jogador: pontos.jogador + 1 };
    setPontos(novosPontos);
    Alert.alert('🏆 Você bateu!', `Placar: Você ${novosPontos.jogador} x ${novosPontos.ia} IA`, [
      { text: 'Nova Partida', onPress: iniciarPartida },
    ]);
  }

  const topoDescarte = descarte.length > 0 ? descarte[descarte.length - 1] : null;

  return (
    <View style={styles.container}>

      <ScoreBoard
        pontuacaoJogador={pontos.jogador}
        pontuacaoIA={pontos.ia}
        rodada={rodada}
      />

      {/* Cartas da IA (viradas) */}
      <View style={styles.secao}>
        <Text style={styles.label}>IA ({maoIA.length} cartas)</Text>
        <View style={styles.maoContainer}>
          {maoIA.map((_, i) => (
            <Card key={i} carta={{ valor: '?', naipe: 'paus' }} virada />
          ))}
        </View>
      </View>

      {/* Pilha e Descarte */}
      <View style={styles.pilhasContainer}>
        <View style={styles.pilha}>
          <Text style={styles.label}>Pilha</Text>
          <TouchableOpacity onPress={comprarDaPilha} disabled={fase !== 'comprar'}>
            <Card carta={{ valor: '?', naipe: 'paus' }} virada />
          </TouchableOpacity>
          <Text style={styles.qtd}>{pilha.length} cartas</Text>
        </View>

        <View style={styles.pilha}>
          <Text style={styles.label}>Descarte</Text>
          {topoDescarte
            ? <TouchableOpacity onPress={comprarDoDescarte} disabled={fase !== 'comprar'}>
                <Card carta={topoDescarte} desabilitada={fase !== 'comprar'} />
              </TouchableOpacity>
            : <View style={styles.espacoCarta} />
          }
        </View>
      </View>

      {/* Mensagem */}
      <Text style={styles.mensagem}>{mensagem}</Text>

      {/* Mão do jogador */}
      <View style={styles.secao}>
        <Text style={styles.label}>Sua mão — toque para descartar</Text>
        <View style={styles.maoContainer}>
          {maoJogador.map((carta, i) => (
            <Card
              key={i}
              carta={carta}
              onPress={() => descartarCarta(carta)}
              desabilitada={fase !== 'descartar'}
            />
          ))}
        </View>
      </View>

      {/* Botões */}
      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={[styles.botao, styles.botaoBater]}
          onPress={bater}
        >
          <Text style={styles.botaoTexto}>🏆 Bater</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, styles.botaoNovo]}
          onPress={iniciarPartida}
        >
          <Text style={styles.botaoTexto}>🔄 Nova Partida</Text>
        </TouchableOpacity>
      </View>

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
  },
  pilhasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingHorizontal: 40,
  },
  pilha: {
    alignItems: 'center',
  },
  qtd: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
  },
  espacoCarta: {
    width: 70,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
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
  botaoBater: {
    backgroundColor: '#2a9d8f',
  },
  botaoNovo: {
    backgroundColor: '#e63946',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});