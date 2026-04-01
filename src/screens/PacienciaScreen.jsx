import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { criarBaralho, embaralhar } from '../game/deck';
import {
  montarTableau,
  podeEmpilharTableau,
  podeIrFundacao,
  verificarVitoria,
} from '../game/pacienciaRules';
import { SIMBOLOS_NAIPES, CORES_NAIPES } from '../game/deck';

export default function PacienciaScreen() {
  const [tableau, setTableau]       = useState([]);
  const [fundacoes, setFundacoes]   = useState([[], [], [], []]);
  const [pilha, setPilha]           = useState([]);
  const [descarte, setDescarte]     = useState([]);
  const [selecionada, setSelecionada] = useState(null); // { carta, origem, index }
  const [movimentos, setMovimentos] = useState(0);

  useEffect(() => { iniciarPartida(); }, []);

  function iniciarPartida() {
    const baralho = embaralhar(criarBaralho());
    const { tableau, restante } = montarTableau(baralho);
    setTableau(tableau);
    setFundacoes([[], [], [], []]);
    setPilha(restante);
    setDescarte([]);
    setSelecionada(null);
    setMovimentos(0);
  }

  function comprarDaPilha() {
    if (pilha.length === 0) {
      // Reembaralha o descarte de volta na pilha
      setPilha([...descarte].reverse());
      setDescarte([]);
      return;
    }
    const carta    = pilha[0];
    const novaPilha = pilha.slice(1);
    setPilha(novaPilha);
    setDescarte(prev => [...prev, { ...carta, virada: false }]);
  }

  function selecionarCarta(carta, origem, index) {
    if (carta.virada) return;

    // Se já tem carta selecionada, tenta mover
    if (selecionada) {
      moverCarta(carta, origem, index);
      return;
    }

    setSelecionada({ carta, origem, index });
  }

  function moverCarta(cartaDestino, origemDestino, indexDestino) {
    if (!selecionada) return;

    // Tenta mover para fundação
    if (origemDestino === 'fundacao') {
      const novasFundacoes = fundacoes.map((f, i) => {
        if (i !== indexDestino) return f;
        if (podeIrFundacao(selecionada.carta, f)) return [...f, selecionada.carta];
        return f;
      });

      if (JSON.stringify(novasFundacoes) !== JSON.stringify(fundacoes)) {
        removerCartaOrigem();
        setFundacoes(novasFundacoes);
        setMovimentos(prev => prev + 1);
        setSelecionada(null);

        if (verificarVitoria(novasFundacoes)) {
          Alert.alert('🏆 Parabéns!', 'Você completou a Paciência!', [
            { text: 'Jogar novamente', onPress: iniciarPartida },
          ]);
        }
        return;
      }
    }

    // Tenta mover para coluna do tableau
    if (origemDestino === 'tableau') {
      const colunaDestino = tableau[indexDestino];
      const topoDestino   = colunaDestino.length > 0
        ? colunaDestino[colunaDestino.length - 1]
        : null;

      if (podeEmpilharTableau(selecionada.carta, topoDestino)) {
        removerCartaOrigem(indexDestino, origemDestino);
        const novoTableau = tableau.map((col, i) => {
          if (i !== indexDestino) return col;
          return [...col, { ...selecionada.carta, virada: false }];
        });
        setTableau(novoTableau);
        setMovimentos(prev => prev + 1);
        setSelecionada(null);
        return;
      }
    }

    // Clicou em outra carta — troca seleção
    setSelecionada({ carta: cartaDestino, origem: origemDestino, index: indexDestino });
  }

  function removerCartaOrigem(destIndex, destOrigem) {
    if (selecionada.origem === 'descarte') {
      setDescarte(prev => prev.slice(0, -1));
    } else if (selecionada.origem === 'tableau') {
      const novoTableau = tableau.map((col, i) => {
        if (i !== selecionada.index) return col;
        const nova = col.slice(0, -1);
        // Vira a carta de baixo
        if (nova.length > 0) nova[nova.length - 1] = { ...nova[nova.length - 1], virada: false };
        return nova;
      });
      setTableau(novoTableau);
    }
  }

  function irParaFundacaoDireto(carta, origem, index) {
    const novasFundacoes = [...fundacoes];
    for (let i = 0; i < novasFundacoes.length; i++) {
      if (podeIrFundacao(carta, novasFundacoes[i])) {
        novasFundacoes[i] = [...novasFundacoes[i], carta];
        if (origem === 'descarte') setDescarte(prev => prev.slice(0, -1));
        else if (origem === 'tableau') {
          const novoTableau = tableau.map((col, j) => {
            if (j !== index) return col;
            const nova = col.slice(0, -1);
            if (nova.length > 0) nova[nova.length - 1] = { ...nova[nova.length - 1], virada: false };
            return nova;
          });
          setTableau(novoTableau);
        }
        setFundacoes(novasFundacoes);
        setMovimentos(prev => prev + 1);
        if (verificarVitoria(novasFundacoes)) {
          Alert.alert('🏆 Parabéns!', 'Você completou a Paciência!', [
            { text: 'Jogar novamente', onPress: iniciarPartida },
          ]);
        }
        return;
      }
    }
  }

  const topoDescarte = descarte.length > 0 ? descarte[descarte.length - 1] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>

      {/* Topo — Pilha, Descarte e Fundações */}
      <View style={styles.topo}>

        {/* Pilha */}
        <TouchableOpacity style={styles.pilhaVazia} onPress={comprarDaPilha}>
          {pilha.length > 0
            ? <View style={styles.versoMini}><Text style={styles.textoVerso}>🂠</Text></View>
            : <Text style={styles.textoReciclar}>♻️</Text>
          }
        </TouchableOpacity>

        {/* Descarte */}
        <TouchableOpacity
          style={styles.pilhaVazia}
          onPress={() => topoDescarte && irParaFundacaoDireto(topoDescarte, 'descarte', -1)}
        >
          {topoDescarte
            ? <CartaMini carta={topoDescarte} selecionada={selecionada?.origem === 'descarte'} />
            : <View style={styles.pilhaVazia} />
          }
        </TouchableOpacity>

        {/* Fundações */}
        {fundacoes.map((fund, i) => (
          <TouchableOpacity
            key={i}
            style={styles.pilhaVazia}
            onPress={() => selecionada && moverCarta(null, 'fundacao', i)}
          >
            {fund.length > 0
              ? <CartaMini carta={fund[fund.length - 1]} />
              : <Text style={styles.textoFundacao}>
                  {['♦', '♠', '♥', '♣'][i]}
                </Text>
            }
          </TouchableOpacity>
        ))}
      </View>

      {/* Movimentos */}
      <Text style={styles.movimentos}>Movimentos: {movimentos}</Text>

      {/* Tableau */}
      <View style={styles.tableau}>
        {tableau.map((coluna, colIdx) => (
          <TouchableOpacity
            key={colIdx}
            style={styles.coluna}
            onPress={() => {
              if (coluna.length === 0 && selecionada) {
                moverCarta(null, 'tableau', colIdx);
              }
            }}
          >
            {coluna.length === 0 && (
              <View style={styles.colunaVazia} />
            )}
            {coluna.map((carta, cardIdx) => (
              <View
                key={cardIdx}
                style={[
                  styles.cartaEmpilhada,
                  { marginTop: cardIdx === 0 ? 0 : -75 },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    if (cardIdx === coluna.length - 1) {
                      if (selecionada) moverCarta(carta, 'tableau', colIdx);
                      else selecionarCarta(carta, 'tableau', colIdx);
                    }
                  }}
                  onLongPress={() => {
                    if (!carta.virada && cardIdx === coluna.length - 1)
                      irParaFundacaoDireto(carta, 'tableau', colIdx);
                  }}
                >
                  <CartaMini
                    carta={carta}
                    selecionada={
                      selecionada?.origem === 'tableau' &&
                      selecionada?.index === colIdx &&
                      cardIdx === coluna.length - 1
                    }
                  />
                </TouchableOpacity>
              </View>
            ))}
          </TouchableOpacity>
        ))}
      </View>

      {/* Botão nova partida */}
      <TouchableOpacity style={styles.botao} onPress={iniciarPartida}>
        <Text style={styles.botaoTexto}>🔄 Nova Partida</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// Componente mini de carta para a Paciência
function CartaMini({ carta, selecionada = false }) {
  if (carta.virada) {
    return <View style={[styles.cartaMini, styles.versoMini]} />;
  }
  const cor = CORES_NAIPES[carta.naipe];
  const simbolo = SIMBOLOS_NAIPES[carta.naipe];
  return (
    <View style={[styles.cartaMini, selecionada && styles.cartaSelecionada]}>
      <Text style={[styles.valorMini, { color: cor }]}>{carta.valor}</Text>
      <Text style={[styles.naipeMini, { color: cor }]}>{simbolo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a6b3a',
  },
  conteudo: {
    paddingBottom: 30,
  },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    paddingTop: 16,
  },
  pilhaVazia: {
    width: 44,
    height: 62,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffffff55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoReciclar: {
    fontSize: 20,
  },
  textoVerso: {
    fontSize: 28,
    color: '#fff',
  },
  textoFundacao: {
    fontSize: 22,
    color: '#ffffff88',
  },
  movimentos: {
    color: '#ffffffaa',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  tableau: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  coluna: {
    width: 44,
    minHeight: 200,
  },
  colunaVazia: {
    width: 44,
    height: 62,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffffff33',
    borderStyle: 'dashed',
  },
  cartaEmpilhada: {
    width: 44,
  },
  cartaMini: {
    width: 44,
    height: 62,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 3,
    justifyContent: 'space-between',
  },
  versoMini: {
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartaSelecionada: {
    borderWidth: 2,
    borderColor: '#e9c46a',
  },
  valorMini: {
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  naipeMini: {
    fontSize: 11,
    textAlign: 'right',
    lineHeight: 12,
  },
  botao: {
    backgroundColor: '#ffffff22',
    margin: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});