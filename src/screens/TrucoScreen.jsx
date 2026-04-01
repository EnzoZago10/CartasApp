import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { criarBaralhoTruco, distribuirMaos } from '../game/deck';
import { getManilha, resolverRodada } from '../game/trucoRules';
import { iaEscolherCartaTruco, iaDecidirTruco } from '../game/aiLogic';
import { vibrarLeve, vibrarMedio, vibrarForte, vibrarErro } from '../utils/sounds';
import { salvarPontuacao, carregarPontuacao } from '../utils/storage';
import Card from '../components/Card';
import ScoreBoard from '../components/ScoreBoard';

const PONTOS_VITORIA  = 12;
const ESCALA_TRUCO    = [1, 3, 6, 9, 12]; // progressão de apostas

export default function TrucoScreen() {
  const [maoJogador, setMaoJogador]       = useState([]);
  const [maoIA, setMaoIA]                 = useState([]);
  const [vira, setVira]                   = useState(null);
  const [manilha, setManilha]             = useState(null);
  const [cartaJogador, setCartaJogador]   = useState(null);
  const [cartaIA, setCartaIA]             = useState(null);
  const [pontos, setPontos]               = useState({ jogador: 0, ia: 0 });
  const [vitorias, setVitorias]           = useState({ jogador: 0, ia: 0 });
  const [nivelTruco, setNivelTruco]       = useState(0); // índice em ESCALA_TRUCO
  const [rodada, setRodada]               = useState(1);
  const [mensagem, setMensagem]           = useState('Sua vez! Escolha uma carta.');
  const [aguardando, setAguardando]       = useState(false);

  useEffect(() => {
    carregarPlacar();
    iniciarMao();
  }, []);

  async function carregarPlacar() {
    const salvo = await carregarPontuacao('truco');
    if (salvo) setPontos(salvo);
  }

  function iniciarMao() {
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
    setVitorias({ jogador: 0, ia: 0 });
    setNivelTruco(0);
    setRodada(1);
    setMensagem('Sua vez! Escolha uma carta.');
    setAguardando(false);

    // IA decide se pede Truco
    if (iaDecidirTruco(maoIA, novaManilha)) {
      setTimeout(() => mostrarPedidoTruco('ia', 1), 800);
    }
  }

  // Mostra o popup de pedido de truco
  // quemPediu: 'jogador' | 'ia'
  // proximoNivel: índice do próximo nível em ESCALA_TRUCO
  function mostrarPedidoTruco(quemPediu, proximoNivel) {
    const valorAtual  = ESCALA_TRUCO[nivelTruco];
    const proximoVal  = ESCALA_TRUCO[proximoNivel];
    const nomePedido  = nomePedidoTruco(proximoNivel);
    const quemPedidoStr = quemPediu === 'ia' ? 'A IA' : 'Você';
    const adversario  = quemPediu === 'ia' ? 'Você' : 'A IA';

    vibrarMedio();

    Alert.alert(
      `🗣️ ${nomePedido.toUpperCase()}!`,
      `${quemPedidoStr} pediu ${nomePedido}!\nA mão passará a valer ${proximoVal} pontos.\n${adversario} aceita?`,
      [
        {
          text: `✅ Aceitar (${proximoVal}pts)`,
          onPress: () => {
            setNivelTruco(proximoNivel);
            setMensagem(`${nomePedido} aceito! Vale ${proximoVal} pontos.`);
          },
        },
        {
          text: `⬆️ Aumentar (${ESCALA_TRUCO[proximoNivel + 1] ?? '--'}pts)`,
          onPress: () => {
            // Só pode aumentar se ainda tiver próximo nível
            if (proximoNivel + 1 < ESCALA_TRUCO.length) {
              setNivelTruco(proximoNivel);
              mostrarPedidoTruco(adversario === 'Você' ? 'jogador' : 'ia', proximoNivel + 1);
            } else {
              setNivelTruco(proximoNivel);
              setMensagem(`${nomePedido} aceito! Vale ${proximoVal} pontos.`);
            }
          },
        },
        {
          text: `❌ Correr (${adversario} ganha ${valorAtual}pt)`,
          onPress: () => {
            vibrarErro();
            registrarPonto(quemPediu, valorAtual);
          },
        },
      ]
    );
  }

  // Retorna o nome do pedido de truco baseado no nível
  function nomePedidoTruco(nivel) {
    const nomes = ['', 'Truco', 'Seis', 'Nove', 'Doze'];
    return nomes[nivel] ?? 'Truco';
  }

  function pedirTruco() {
    const proximoNivel = nivelTruco + 1;
    if (proximoNivel >= ESCALA_TRUCO.length) {
      setMensagem('Já está no máximo (12 pontos)!');
      vibrarErro();
      return;
    }
    mostrarPedidoTruco('jogador', proximoNivel);
  }

  async function jogarCarta(carta) {
    if (aguardando) return;

    await vibrarLeve();
    setCartaJogador(carta);
    setMaoJogador(prev => prev.filter(c => c !== carta));
    setAguardando(true);
    setMensagem('IA está pensando...');

    setTimeout(async () => {
      const cartaEscolhidaIA = iaEscolherCartaTruco(maoIA, carta, manilha);
      setCartaIA(cartaEscolhidaIA);
      setMaoIA(prev => prev.filter(c => c !== cartaEscolhidaIA));

      const resultado = resolverRodada(carta, cartaEscolhidaIA, manilha);

      const novasVitorias = {
        jogador: vitorias.jogador + (resultado === 'jogador' ? 1 : 0),
        ia:      vitorias.ia      + (resultado === 'ia'      ? 1 : 0),
      };
      setVitorias(novasVitorias);

      if (resultado === 'jogador') {
        await vibrarMedio();
        setMensagem(`✅ Você ganhou a rodada ${rodada}!`);
      } else if (resultado === 'ia') {
        await vibrarErro();
        setMensagem(`❌ A IA ganhou a rodada ${rodada}!`);
      } else {
        setMensagem(`🤝 Empate na rodada ${rodada}!`);
      }

      setTimeout(() => {
        const pontosRodada = ESCALA_TRUCO[nivelTruco];
        if (novasVitorias.jogador >= 2) {
          registrarPonto('jogador', pontosRodada);
        } else if (novasVitorias.ia >= 2) {
          registrarPonto('ia', pontosRodada);
        } else if (rodada >= 3) {
          registrarPonto(resultado === 'empate' ? 'empate' : resultado, pontosRodada);
        } else {
          proximaRodada();
        }
      }, 1500);
    }, 1000);
  }

  function proximaRodada() {
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

  async function registrarPonto(vencedor, qtdPontos) {
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
    await salvarPontuacao('truco', novosPontos);

    if (novosPontos.jogador >= PONTOS_VITORIA) {
      await vibrarForte();
      Alert.alert('🏆 Você venceu o jogo!', 'Você chegou a 12 pontos!', [
        { text: 'Novo Jogo', onPress: () => { setPontos({ jogador: 0, ia: 0 }); salvarPontuacao('truco', { jogador: 0, ia: 0 }); iniciarMao(); } },
      ]);
      return;
    }
    if (novosPontos.ia >= PONTOS_VITORIA) {
      await vibrarErro();
      Alert.alert('😢 A IA venceu o jogo!', 'A IA chegou a 12 pontos!', [
        { text: 'Novo Jogo', onPress: () => { setPontos({ jogador: 0, ia: 0 }); salvarPontuacao('truco', { jogador: 0, ia: 0 }); iniciarMao(); } },
      ]);
      return;
    }

    const msg = vencedor === 'jogador'
      ? `🏆 Você ganhou a mão! +${qtdPontos} ponto(s)`
      : `😢 A IA ganhou a mão! +${qtdPontos} ponto(s)`;

    Alert.alert(msg,
      `Placar: Você ${novosPontos.jogador} x ${novosPontos.ia} IA\nPrimeiro a 12 vence!`,
      [{ text: 'Próxima Mão', onPress: iniciarMao }]
    );
  }

  const pontosRodadaAtual = ESCALA_TRUCO[nivelTruco];
  const proximoNomeTruco  = nivelTruco < ESCALA_TRUCO.length - 1
    ? nomePedidoTruco(nivelTruco + 1)
    : null;

  function nomePedidoTruco(nivel) {
    const nomes = ['', 'Truco', 'Seis', 'Nove', 'Doze'];
    return nomes[nivel] ?? '';
  }

  return (
    <View style={styles.container}>

      <ScoreBoard
        pontuacaoJogador={pontos.jogador}
        pontuacaoIA={pontos.ia}
        rodada={rodada}
      />
      <Text style={styles.metaTexto}>
        Primeiro a {PONTOS_VITORIA} pontos vence! | Mão vale: {pontosRodadaAtual}pt(s)
      </Text>

      {/* Vira e Manilha */}
      {vira && (
        <View style={styles.viraContainer}>
          <Text style={styles.viraLabel}>Vira</Text>
          <Card carta={vira} desabilitada />
          <Text style={styles.manilhaLabel}>
            Manilha: <Text style={styles.destaque}>{manilha}</Text>
            {'  '}Rodadas: <Text style={styles.destaque}>{vitorias.jogador} x {vitorias.ia}</Text>
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
        {proximoNomeTruco && (
          <TouchableOpacity
            style={[styles.botao, styles.botaoTruco]}
            onPress={pedirTruco}
            disabled={aguardando}
          >
            <Text style={styles.botaoTexto}>🗣️ {proximoNomeTruco}!</Text>
          </TouchableOpacity>
        )}
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
  destaque:         { color: '#e9c46a', fontWeight: 'bold' },
  mesa:             { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8, paddingHorizontal: 20 },
  ladoMesa:         { alignItems: 'center' },
  labelMesa:        { color: '#aaa', fontSize: 13, marginBottom: 4 },
  espacoCarta:      { width: 70, height: 100, borderRadius: 10, borderWidth: 2, borderColor: '#333', borderStyle: 'dashed' },
  mensagem:         { color: '#fff', fontSize: 15, textAlign: 'center', marginVertical: 8, paddingHorizontal: 20 },
  maoContainer:     { flexDirection: 'row', justifyContent: 'center', marginTop: 6 },
  botoesContainer:  { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginTop: 8 },
  botao:            { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 6 },
  botaoTruco:       { backgroundColor: '#e63946' },
  botaoNovo:        { backgroundColor: '#555' },
  botaoTexto:       { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});