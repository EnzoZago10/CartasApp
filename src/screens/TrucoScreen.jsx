import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { criarBaralhoTruco, distribuirMaos } from '../game/deck';
import { getManilha, resolverRodada, forcaCarta } from '../game/trucoRules';
import { iaEscolherCartaTruco, iaDecidirTruco } from '../game/aiLogic';
import Card from '../components/Card';
import ScoreBoard from '../components/ScoreBoard';

// Truco Paulista vai até 12 pontos
const PONTOS_VITORIA = 12;

export default function TrucoScreen() {
  const [maoJogador, setMaoJogador]     = useState([]);
  const [maoIA, setMaoIA]               = useState([]);
  const [vira, setVira]                 = useState(null);
  const [manilha, setManilha]           = useState(null);
  const [cartaJogador, setCartaJogador] = useState(null);
  const [cartaIA, setCartaIA]           = useState(null);
  const [pontos, setPontos]             = useState({ jogador: 0, ia: 0 });
  const [vitorias, setVitorias]         = useState({ jogador: 0, ia: 0 });
  const [pontosRodada, setPontosRodada] = useState(1); // 1, 3, 6, 9 ou 12
  const [rodada, setRodada]             = useState(1);
  const [mensagem, setMensagem]         = useState('Sua vez! Escolha uma carta.');
  const [aguardando, setAguardando]     = useState(false);

  useEffect(() => { iniciarMao(); }, []);

  function iniciarMao() {
    const baralho = criarBaralhoTruco(); // 40 cartas
    const { maoJogador, maoIA, restante } = distribuirMaos(baralho, 3);
    const novaVira    = restante[0];
    const novaManilha = getManilha(novaVira);

    setMaoJogador(maoJogador);
    setMaoIA(maoIA);
    setVira(novaVira);
    setManilha(novaManilha);
    setCartaJogador(null);
    setCartaIA(null);
    setVitorias({ jogador: 0, ia: 0 });
    setPontosRodada(1);
    setRodada(1);
    setMensagem('Sua vez! Escolha uma carta.');
    setAguardando(false);

    // IA decide se pede Truco logo de início
    if (iaDecidirTruco(maoIA, novaManilha)) {
      setTimeout(() => {
        Alert.alert(
          '🗣️ TRUCO!',
          'A IA pediu Truco! Vale 3 pontos. Você aceita?',
          [
            { text: '✅ Aceitar (3pts)', onPress: () => setPontosRodada(3) },
            { text: '❌ Correr (IA ganha 1pt)', onPress: () => registrarPonto('ia', 1) },
          ]
        );
      }, 800);
    }
  }

  function pedirTruco() {
    if (pontosRodada >= 3) {
      Alert.alert('Já foi pedido Truco!');
      return;
    }
    Alert.alert(
      '🗣️ TRUCO!',
      'Você pediu Truco! A IA aceita?',
      [
        { text: 'IA aceita (3pts)', onPress: () => setPontosRodada(3) },
        { text: 'IA corre (você ganha 1pt)', onPress: () => registrarPonto('jogador', 1) },
      ]
    );
  }

  function jogarCarta(carta) {
    if (aguardando) return;

    setCartaJogador(carta);
    setMaoJogador(prev => prev.filter(c => c !== carta));
    setAguardando(true);
    setMensagem('IA está pensando...');

    setTimeout(() => {
      const cartaEscolhidaIA = iaEscolherCartaTruco(maoIA, carta, manilha);
      setCartaIA(cartaEscolhidaIA);
      setMaoIA(prev => prev.filter(c => c !== cartaEscolhidaIA));

      const resultado = resolverRodada(carta, cartaEscolhidaIA, manilha);

      const novasVitorias = {
        jogador: vitorias.jogador + (resultado === 'jogador' ? 1 : 0),
        ia:      vitorias.ia      + (resultado === 'ia'      ? 1 : 0),
      };

      setVitorias(novasVitorias);

      if (resultado === 'jogador')      setMensagem(`✅ Você ganhou a rodada ${rodada}!`);
      else if (resultado === 'ia')      setMensagem(`❌ A IA ganhou a rodada ${rodada}!`);
      else                              setMensagem(`🤝 Empate na rodada ${rodada}!`);

      setTimeout(() => {
        // Quem ganhar 2 rodadas vence a mão
        if (novasVitorias.jogador >= 2) {
          registrarPonto('jogador', pontosRodada);
        } else if (novasVitorias.ia >= 2) {
          registrarPonto('ia', pontosRodada);
        } else if (rodada >= 3) {
          // Terceira rodada desempata
          registrarPonto(resultado === 'empate' ? 'empate' : resultado, pontosRodada);
        } else {
          proximaRodada(novasVitorias);
        }
      }, 1500);

    }, 1000);
  }

  function proximaRodada(vitoriasAtuais) {
    const baralho = criarBaralhoTruco();
    const { maoJogador, maoIA, restante } = distribuirMaos(baralho, 3);
    const novaVira    = restante[0];
    const novaManilha = getManilha(novaVira);

    setMaoJogador(maoJogador);
    setMaoIA(maoIA);
    setVira(novaVira);
    setManilha(novaManilha);
    setCartaJogador(null);
    setCartaIA(null);
    setRodada(prev => prev + 1);
    setMensagem('Próxima rodada! Escolha uma carta.');
    setAguardando(false);
  }

  function registrarPonto(vencedor, qtdPontos) {
    if (vencedor === 'empate') {
      setMensagem('🤝 Mão empatada!');
      setTimeout(iniciarMao, 1500);
      return;
    }

    const novosPontos = {
      jogador: pontos.jogador + (vencedor === 'jogador' ? qtdPontos : 0),
      ia:      pontos.ia      + (vencedor === 'ia'      ? qtdPontos : 0),
    };
    setPontos(novosPontos);

    // Verifica vitória no jogo (12 pontos)
    if (novosPontos.jogador >= PONTOS_VITORIA) {
      Alert.alert('🏆 Você venceu o jogo!', 'Você chegou a 12 pontos!', [
        { text: 'Novo Jogo', onPress: () => { setPontos({ jogador: 0, ia: 0 }); iniciarMao(); } },
      ]);
      return;
    }
    if (novosPontos.ia >= PONTOS_VITORIA) {
      Alert.alert('😢 A IA venceu o jogo!', 'A IA chegou a 12 pontos!', [
        { text: 'Novo Jogo', onPress: () => { setPontos({ jogador: 0, ia: 0 }); iniciarMao(); } },
      ]);
      return;
    }

    const msg = vencedor === 'jogador'
      ? `🏆 Você ganhou a mão! +${qtdPontos} ponto(s)`
      : `😢 A IA ganhou a mão! +${qtdPontos} ponto(s)`;

    Alert.alert(msg, `Placar: Você ${novosPontos.jogador} x ${novosPontos.ia} IA\nPrimeiro a 12 vence!`, [
      { text: 'Próxima Mão', onPress: iniciarMao },
    ]);
  }

  return (
    <View style={styles.container}>

      {/* Placar — exibe pontos até 12 */}
      <ScoreBoard
        pontuacaoJogador={pontos.jogador}
        pontuacaoIA={pontos.ia}
        rodada={rodada}
      />
      <Text style={styles.metaTexto}>Primeiro a {PONTOS_VITORIA} pontos vence!</Text>

      {/* Vira e Manilha */}
      {vira && (
        <View style={styles.viraContainer}>
          <Text style={styles.viraLabel}>Vira</Text>
          <Card carta={vira} desabilitada />
          <Text style={styles.manilhaLabel}>
            Manilha: <Text style={styles.manilha}>{manilha}</Text>
            {'  '}Rodada vale: <Text style={styles.manilha}>{pontosRodada}pt(s)</Text>
          </Text>
        </View>
      )}

      {/* Mesa */}
      <View style={styles.mesa}>
        <View style={styles.ladoMesa}>
          <Text style={styles.labelMesa}>IA</Text>
          {cartaIA
            ? <Card carta={cartaIA} desabilitada />
            : <View style={styles.espacoCarta} />
          }
        </View>
        <View style={styles.ladoMesa}>
          <Text style={styles.labelMesa}>Você</Text>
          {cartaJogador
            ? <Card carta={cartaJogador} desabilitada />
            : <View style={styles.espacoCarta} />
          }
        </View>
      </View>

      {/* Vitórias de rodada */}
      <View style={styles.vitoriasContainer}>
        <Text style={styles.vitoriaTexto}>
          Rodadas: Você {vitorias.jogador} x {vitorias.ia} IA
        </Text>
      </View>

      {/* Mensagem */}
      <Text style={styles.mensagem}>{mensagem}</Text>

      {/* Mão do jogador */}
      <View style={styles.maoContainer}>
        {maoJogador.map((carta, i) => (
          <Card
            key={i}
            carta={carta}
            onPress={() => jogarCarta(carta)}
            desabilitada={aguardando}
          />
        ))}
      </View>

      {/* Botões */}
      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={[styles.botao, styles.botaoTruco]}
          onPress={pedirTruco}
          disabled={aguardando || pontosRodada >= 3}
        >
          <Text style={styles.botaoTexto}>🗣️ Truco!</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botao, styles.botaoNovo]} onPress={iniciarMao}>
          <Text style={styles.botaoTexto}>🔄 Nova Mão</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 10 },
  metaTexto:        { color: '#e9c46a', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  viraContainer:    { alignItems: 'center', marginBottom: 6 },
  viraLabel:        { color: '#aaa', fontSize: 13, marginBottom: 2 },
  manilhaLabel:     { color: '#aaa', fontSize: 13, marginTop: 4 },
  manilha:          { color: '#e9c46a', fontWeight: 'bold' },
  mesa: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  ladoMesa:         { alignItems: 'center' },
  labelMesa:        { color: '#aaa', fontSize: 13, marginBottom: 4 },
  espacoCarta: {
    width: 70, height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  vitoriasContainer: { alignItems: 'center', marginBottom: 4 },
  vitoriaTexto:      { color: '#aaa', fontSize: 13 },
  mensagem:          { color: '#fff', fontSize: 15, textAlign: 'center', marginVertical: 8, paddingHorizontal: 20 },
  maoContainer:      { flexDirection: 'row', justifyContent: 'center', marginTop: 6 },
  botoesContainer:   { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginTop: 8 },
  botao:             { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 6 },
  botaoTruco:        { backgroundColor: '#e63946' },
  botaoNovo:         { backgroundColor: '#555' },
  botaoTexto:        { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});0