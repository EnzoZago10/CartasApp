import { forcaCarta } from './trucoRules';
import { valorNumerico } from './deck';

// ============================================
// IA DO TRUCO
// ============================================

// IA escolhe qual carta jogar no Truco
export function iaEscolherCartaTruco(maoIA, cartaJogador, manilha) {
  // Se o jogador já jogou, tenta vencer com a menor carta possível
  if (cartaJogador) {
    const forcaJogador = forcaCarta(cartaJogador, manilha);

    const cartasVencedoras = maoIA
      .filter(c => forcaCarta(c, manilha) > forcaJogador)
      .sort((a, b) => forcaCarta(a, manilha) - forcaCarta(b, manilha));

    // Se tem carta que vence, joga a menor delas
    if (cartasVencedoras.length > 0) return cartasVencedoras[0];

    // Se não tem carta vencedora, descarta a mais fraca
    return [...maoIA].sort(
      (a, b) => forcaCarta(a, manilha) - forcaCarta(b, manilha)
    )[0];
  }

  // Se a IA joga primeiro, joga a carta do meio (estratégia equilibrada)
  const ordenadas = [...maoIA].sort(
    (a, b) => forcaCarta(a, manilha) - forcaCarta(b, manilha)
  );
  return ordenadas[Math.floor(ordenadas.length / 2)];
}

// IA decide se pede Truco
export function iaDecidirTruco(maoIA, manilha) {
  const cartasFortes = maoIA.filter(
    c => forcaCarta(c, manilha) >= 8
  );
  return cartasFortes.length >= 1;
}

// ============================================
// IA DA CACHETA
// ============================================

// IA decide qual carta descartar na Cacheta
export function iaDescartarCacheta(maoIA, cartaMesa) {
  // Agrupa cartas por valor
  const grupos = {};
  for (const carta of maoIA) {
    if (!grupos[carta.valor]) grupos[carta.valor] = [];
    grupos[carta.valor].push(carta);
  }

  // Descarta a carta mais isolada (sem par)
  const isoladas = maoIA.filter(c => grupos[c.valor].length === 1);
  if (isoladas.length > 0) {
    // Descarta a de menor valor entre as isoladas
    return isoladas.sort(
      (a, b) => valorNumerico(a) - valorNumerico(b)
    )[0];
  }

  // Se não tiver isolada, descarta a de menor valor
  return [...maoIA].sort(
    (a, b) => valorNumerico(a) - valorNumerico(b)
  )[0];
}

// IA verifica se pode bater na Cacheta (todas as cartas iguais ou sequência)
export function iaVerificarBateCacheta(maoIA) {
  const valores = maoIA.map(c => valorNumerico(c));
  const todosIguais = valores.every(v => v === valores[0]);
  return todosIguais;
}

// ============================================
// IA DO PÔQUER
// ============================================

// IA decide se aposta, paga ou desiste no Pôquer
export function iaDecidirPoker(maoIA, apostaAtual, fichasIA) {
  const forca = avaliarMaoPoker(maoIA);

  if (forca >= 4) return 'apostar';   // mão forte, aposta
  if (forca >= 2) return 'pagar';     // mão média, paga
  return 'desistir';                   // mão fraca, desiste
}

// Avalia a força da mão no Pôquer (0 a 8)
export function avaliarMaoPoker(mao) {
  const valores = mao.map(c => valorNumerico(c)).sort((a, b) => a - b);
  const naipes  = mao.map(c => c.naipe);

  const contagem = {};
  for (const v of valores) contagem[v] = (contagem[v] || 0) + 1;
  const grupos = Object.values(contagem).sort((a, b) => b - a);

  const flush    = naipes.every(n => n === naipes[0]);
  const sequencia = valores.every((v, i) => i === 0 || v === valores[i - 1] + 1);

  if (flush && sequencia) return 8; // Straight Flush
  if (grupos[0] === 4)    return 7; // Quadra
  if (grupos[0] === 3 && grupos[1] === 2) return 6; // Full House
  if (flush)              return 5; // Flush
  if (sequencia)          return 4; // Sequência
  if (grupos[0] === 3)    return 3; // Trinca
  if (grupos[0] === 2 && grupos[1] === 2) return 2; // Dois Pares
  if (grupos[0] === 2)    return 1; // Par
  return 0;                          // Carta Alta
}

// ============================================
// IA DO PORCO
// ============================================

// IA decide se continua ou para no Porco
export function iaDecidirPorco(maoIA, pontuacaoAtual) {
  // Para se tiver 15 ou mais pontos (joga seguro)
  if (pontuacaoAtual >= 15) return 'parar';
  return 'continuar';
}