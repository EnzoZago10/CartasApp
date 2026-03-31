import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { criarBaralho, distribuirMaos } from '../game/deck';
import { getManilha, resolverRodada } from '../game/trucoRules';
import { iaEscolherCartaTruco, iaDecidirTruco } from '../game/aiLogic';
import Card from '../components/Card';
import ScoreBoard from '../components/ScoreBoard';

export default function TrucoScreen() {
  const [maoJogador, setMaoJogador]         = useState([]);
  const [maoIA, setMaoIA]                   = useState([]);
  const [vira, setVira]                     = useState(null);
  const [manilha, setManilha]               = useState(null);
  const [cartaJogador, setCartaJogador]     = useState(null);
  const [cartaIA, setCartaIA]               = useState(null);
  const [pontos, setPontos]                 = useState({ jogador: 0, ia: 0 });
  const [vitorias, setVitorias]             = useState({ jogador: 0, ia: 0 });
  const [rodada, setRodada]                 = useState(1);
  const [mensagem, setMensagem]             = useState('Sua vez! Escolha uma carta.');
  const [aguardando, setAguardando]         = useState(false);

  useEffect(() => { iniciarPartida(); }, []);

  function iniciarPartida() {
    const baralho = criarBaralho();
    const { maoJogador, maoIA, restante } = distribuirMaos(baralho, 3);
    const novaVira = restante[0];
    const novaManilha = getManilha(novaVira);

    setMaoJogador(maoJogador);
    setMaoIA(maoIA);
    setVira(novaVira);
    setManilha(novaManilha);
    setCartaJogador(null);
    setCartaIA(null);
    setVitorias({ jogador: 0, ia: 0 });
    setRodada(1);
    setMensagem('Sua vez! Escolha uma carta.');
    setAguardando(false);

    // IA decide se pede Truco logo no início
    if (iaDecidirTruco(maoIA, novaManilha)) {
      setTimeout(() => {
        Alert.alert('Truco!', 'A IA pediu Truco! Você aceita?', [
          { text: 'Aceitar', onPress: () => setMensagem('Truco aceito! Jogue sua carta.') },
          { text: 'Correr',  onPress: () => encerrarPartida('ia') },
        ]);
      }, 1000);
    }
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

      if (resultado === 'jogador') setMensagem('✅ Você ganhou essa rodada!');
      else if (resultado === 'ia') setMensagem('❌ A IA ganhou essa rodada!');
      else                         setMensagem('🤝 Empate nessa rodada!');

      // Verifica se alguém ganhou 2 rodadas
      setTimeout(() => {
        if (novasVitorias.jogador >= 2) {
          encerrarPartida('jogador');
        } else if (novasVitorias.ia >= 2) {
          encerrarPartida('ia');
        } else {
          proximaRodada();
        }
      }, 1500);

    }, 1000);
  }

  function proximaRodada() {
    const baralho = criarBaralho();
    const { maoJogador, maoIA, restante } = distribuirMaos(baralho, 3);
    const novaVira = restante[0];
    const novaManilha = getManilha(novaVira);

    setMaoJogador(maoJogador);
    setMaoIA(maoIA);
    setVira(novaVira);
    setManilha(novaManilha);
    setCartaJogador(null);
    setCartaIA(null);
    setRodada(prev => prev + 1);
    setMensagem('Sua vez! Escolha uma carta.');
    setAguardando(false);
  }

  function encerrarPartida(vencedor) {
    const novosPontos = {
      jogador: pontos.jogador + (vencedor === 'jogador' ? 1 : 0),
      ia:      pontos.ia      + (vencedor === 'ia'      ? 1 : 0),
    };
    setPontos(novosPontos);

    const msg = vencedor === 'jogador' ? '🏆 Você ganhou a mão!' : '😢 A IA ganhou a mão!';

    Alert.alert(msg, `Placar: Você ${novosPontos.jogador} x ${novosPontos.ia} IA`, [
      { text: 'Nova Mão', onPress: iniciarPartida },
    ]);
  }

  return (
    <View style={styles.container}>

      {/* Placar */}
      <ScoreBoard
        pontuacaoJogador={pontos.jogador}
        pontuacaoIA={pontos.ia}
        rodada={rodada}
      />

      {/* Vira e Manilha */}
      {vira && (
        <View style={styles.viraContainer}>
          <Text style={styles.viraLabel}>Vira</Text>
          <Card carta={vira} desabilitada />
          <Text style={styles.manilhaLabel}>Manilha: <Text style={styles.manilha}>{manilha}</Text></Text>
        </View>
      )}

      {/* Cartas na mesa */}
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

      {/* Botão Nova Partida */}
      <TouchableOpacity style={styles.botao} onPress={iniciarPartida}>
        <Text style={styles.botaoTexto}>🔄 Nova Partida</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 20,
  },
  viraContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  viraLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  manilhaLabel: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
  manilha: {
    color: '#e9c46a',
    fontWeight: 'bold',
  },
  mesa: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  ladoMesa: {
    alignItems: 'center',
  },
  labelMesa: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 6,
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
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  maoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  botao: {
    backgroundColor: '#e63946',
    margin: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});