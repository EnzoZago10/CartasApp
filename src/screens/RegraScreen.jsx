import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';

const REGRAS = {
  Truco: {
    emoji: '🃏',
    cor:   '#e63946',
    secoes: [
      {
        titulo: '🎯 Objetivo',
        texto:  'Ser o primeiro a chegar a 12 pontos. As mãos valem 1, 3, 6, 9 ou 12 pontos dependendo das apostas de Truco.',
      },
      {
        titulo: '🃏 O Baralho',
        texto:  'Baralho de 40 cartas (sem 8, 9 e 10). Cada jogador recebe 3 cartas por mão.',
      },
      {
        titulo: '⚡ A Vira e a Manilha',
        texto:  'Uma carta é virada antes de cada mão — essa é a VIRA. A carta de valor imediatamente superior à vira é a MANILHA, a mais forte do jogo.\n\nExemplo: Vira = 6 → Manilha = 7\n\nOrdem das manilhas (da mais fraca à mais forte):\n♦ Ouros → ♠ Espadilha → ♥ Copas → ♣ Zap (paus)',
      },
      {
        titulo: '🏆 Hierarquia das cartas',
        texto:  'Do mais fraco ao mais forte (sem contar manilhas):\n4 → 5 → 6 → 7 → Q → J → K → A → 2 → 3\n\nAs 4 manilhas são sempre mais fortes que qualquer carta normal.',
      },
      {
        titulo: '🔄 Como jogar',
        texto:  '1. Cada jogador recebe 3 cartas.\n2. Os jogadores jogam uma carta por vez.\n3. Quem jogar a carta mais forte ganha a rodada.\n4. Quem ganhar 2 das 3 rodadas vence a mão.',
      },
      {
        titulo: '💰 Sistema de apostas',
        texto:  'A mão começa valendo 1 ponto. Qualquer jogador pode pedir TRUCO:\n\n• Truco → vale 3 pontos\n• 6 → vale 6 pontos\n• 9 → vale 9 pontos\n• 12 → vale 12 pontos\n\nO adversário pode aceitar, aumentar ou correr (perde 1 ponto a menos que o pedido atual).',
      },
      {
        titulo: '🏁 Vitória',
        texto:  'Primeiro a chegar a 12 pontos vence o jogo!',
      },
    ],
  },
  Cacheta: {
    emoji: '🎴',
    cor:   '#2a9d8f',
    secoes: [
      {
        titulo: '🎯 Objetivo',
        texto:  'Formar 3 grupos de 3 cartas válidos com suas 9 cartas e ser o primeiro a BATER.',
      },
      {
        titulo: '🃏 O Baralho',
        texto:  'Baralho completo de 52 cartas. Cada jogador recebe 9 cartas.',
      },
      {
        titulo: '🔄 Como jogar',
        texto:  '1. Você começa com 9 cartas.\n2. No seu turno, compre 1 carta (da pilha ou do descarte).\n3. Você ficará com 10 cartas momentaneamente.\n4. Descarte 1 carta, voltando a ter 9.\n5. Repita até conseguir bater!',
      },
      {
        titulo: '🧩 Combinações válidas',
        texto:  'TRINCA: 3 cartas do mesmo valor com naipes diferentes.\nExemplo válido: 7♦ 7♠ 7♥\n\nSEQUÊNCIA: 3 ou mais cartas do mesmo naipe em ordem.\nExemplo válido: 5♠ 6♠ 7♠',
      },
      {
        titulo: '🏆 Como bater',
        texto:  'Para BATER você precisa que todas as suas 9 cartas estejam organizadas em 3 grupos válidos (trincas ou sequências). Ao bater, você vence a rodada!',
      },
      {
        titulo: '💡 Dica',
        texto:  'Observe o descarte! Se seu adversário jogou uma carta que completa sua sequência, pegue-a. Mas cuidado: ele pode perceber o que você está montando!',
      },
    ],
  },
  Poker: {
    emoji: '♠️',
    cor:   '#457b9d',
    secoes: [
      {
        titulo: '🎯 Objetivo',
        texto:  'Ter a melhor combinação de 5 cartas e ganhar as fichas do pote.',
      },
      {
        titulo: '🃏 O Baralho',
        texto:  'Baralho completo de 52 cartas. Cada jogador recebe 5 cartas.',
      },
      {
        titulo: '🔄 Como jogar',
        texto:  '1. Cada jogador recebe 5 cartas.\n2. Fase de troca: selecione até 3 cartas para trocar.\n3. Fase de aposta: aposte, pague ou desista.\n4. Quem tiver a melhor mão vence o pote!',
      },
      {
        titulo: '🏆 Combinações (mais fraca → mais forte)',
        texto:  '1. Carta Alta — nenhuma combinação\n2. Par — 2 cartas iguais\n3. Dois Pares — 2 pares\n4. Trinca — 3 cartas iguais\n5. Sequência — 5 cartas em ordem\n6. Flush — 5 cartas do mesmo naipe\n7. Full House — trinca + par\n8. Quadra — 4 cartas iguais\n9. Straight Flush — sequência do mesmo naipe',
      },
      {
        titulo: '💰 Apostas',
        texto:  'Apostar: aumenta o pote.\nPagar: aceita a aposta do adversário.\nDesistir: desiste da mão, adversário ganha o pote.',
      },
    ],
  },
  Paciencia: {
    emoji: '🂡',
    cor:   '#e9c46a',
    secoes: [
      {
        titulo: '🎯 Objetivo',
        texto:  'Mover todas as 52 cartas para as 4 pilhas de fundação (uma por naipe), do Ás ao Rei.',
      },
      {
        titulo: '🃏 O Baralho',
        texto:  'Baralho completo de 52 cartas distribuídas em 7 colunas.',
      },
      {
        titulo: '📐 Organização inicial',
        texto:  '7 colunas: a 1ª tem 1 carta, a 2ª tem 2, e assim por diante até a 7ª com 7. Apenas a carta do topo de cada coluna fica virada para cima. As demais ficam viradas para baixo.',
      },
      {
        titulo: '🔄 Como jogar',
        texto:  '1. Toque em uma carta para selecioná-la (borda dourada).\n2. Toque na coluna de destino para mover.\n3. No tableau: empilhe em ordem decrescente alternando cores.\n4. Toque longo na carta para enviar direto à fundação.\n5. Compre cartas da pilha quando precisar.',
      },
      {
        titulo: '🧩 Regras de movimento',
        texto:  'TABLEAU: só pode empilhar carta de cor diferente e valor imediatamente menor.\nExemplo: 7♥(vermelho) pode ir em cima de 8♠(preto).\n\nFUNDAÇÃO: começa com Ás, depois 2, 3... até Rei, todos do mesmo naipe.\n\nCOLUNA VAZIA: só pode receber um Rei.',
      },
      {
        titulo: '🏆 Vitória',
        texto:  'Vence quando todas as 4 fundações estiverem completas (do Ás ao Rei)!',
      },
    ],
  },
  Porco: {
    emoji: '🐷',
    cor:   '#f4a261',
    secoes: [
      {
        titulo: '🎯 Objetivo',
        texto:  'Ser o primeiro a coletar 4 cartas do mesmo valor e tocar o nariz!',
      },
      {
        titulo: '🃏 O Baralho',
        texto:  'Baralho completo de 52 cartas. Cada jogador recebe 4 cartas.',
      },
      {
        titulo: '🔄 Como jogar',
        texto:  '1. Cada jogador recebe 4 cartas.\n2. Escolha 1 carta da sua mão para passar à IA.\n3. A IA também passa 1 carta para você simultaneamente.\n4. Repita até alguém formar 4 cartas iguais!\n5. Quem formar a quadra deve TOCAR O NARIZ imediatamente!',
      },
      {
        titulo: '👃 O toque do nariz',
        texto:  'Quando você ou a IA formar 4 cartas do mesmo valor, o botão NARIZ aparecerá piscando!\n\n• Se você formou a quadra: toque o nariz para vencer!\n• Se a IA formou: toque o nariz antes de 3 segundos para empatar!\n• Se não tocar a tempo: a IA ganha o ponto.',
      },
      {
        titulo: '⚠️ Atenção',
        texto:  'Se você tocar o nariz sem ter quadra, perde o ponto! Só toque quando tiver certeza que formou 4 cartas iguais.',
      },
      {
        titulo: '💡 Estratégia',
        texto:  'Fique de olho no seu progresso (barra amarela). Quando chegar em 3/4, fique atento e prepare o dedo para tocar o nariz!',
      },
    ],
  },
};

export default function RegraScreen({ route }) {
  const { jogo } = route.params;
  const regra    = REGRAS[jogo];
  const [secaoAberta, setSecaoAberta] = useState(null);

  if (!regra) {
    return (
      <View style={styles.container}>
        <Text style={styles.erro}>Regras não encontradas.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* Cabeçalho */}
      <View style={[styles.cabecalho, { backgroundColor: regra.cor }]}>
        <Text style={styles.cabecalhoEmoji}>{regra.emoji}</Text>
        <Text style={styles.cabecalhoTitulo}>Regras do {jogo}</Text>
      </View>

      {/* Seções */}
      {regra.secoes.map((secao, i) => (
        <TouchableOpacity
          key={i}
          style={styles.secao}
          onPress={() => setSecaoAberta(secaoAberta === i ? null : i)}
          activeOpacity={0.8}
        >
          <View style={styles.secaoTopo}>
            <Text style={styles.secaoTitulo}>{secao.titulo}</Text>
            <Text style={styles.secaoSeta}>
              {secaoAberta === i ? '▲' : '▼'}
            </Text>
          </View>
          {secaoAberta === i && (
            <Text style={styles.secaoTexto}>{secao.texto}</Text>
          )}
        </TouchableOpacity>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#1a1a2e' },
  erro:             { color: '#fff', textAlign: 'center', marginTop: 40 },
  cabecalho: {
    padding: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  cabecalhoEmoji:   { fontSize: 48, marginBottom: 8 },
  cabecalhoTitulo:  { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  secao: {
    backgroundColor: '#16213e',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
  },
  secaoTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secaoTitulo:      { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1 },
  secaoSeta:        { color: '#aaa', fontSize: 14 },
  secaoTexto: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
});