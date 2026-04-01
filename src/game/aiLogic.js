import { forcaCarta } from './trucoRules';
import { valorNumerico } from './deck';
import { calcularLixo, podeBater, ehCombinacaoValida } from './cachetaRules';

// ============================================
// IA DO TRUCO
// ============================================

export function iaEscolherCartaTruco(maoIA, cartaJogador, manilha) {
  if (cartaJogador) {
    const forcaJogador = forcaCarta(cartaJogador, manilha);
    const cartasVencedoras = maoIA
      .filter(c => forcaCarta(c, manilha) > forcaJogador)
      .sort((a, b) => forcaCarta(a, manilha) - forcaCarta(b, manilha));
    if (cartasVencedoras.length > 0) return cartasVencedoras[0];
    return [...maoIA].sort((a, b) => forcaCarta(a, manilha) - forcaCarta(b, manilha))[0];
  }
  const ordenadas = [...maoIA].sort((a, b) => forcaCarta(a, manilha) - forcaCarta(b, manilha));
  return ordenadas[Math.floor(ordenadas.length / 2)];
}

export function iaDecidirTruco(maoIA, manilha) {
  const cartasFortes = maoIA.filter(c => forcaCarta(c, manilha) >= 8);
  return cartasFortes.length >= 1;
}

// ============================================
// IA DA CACHETA
// ============================================

// IA escolhe qual carta descartar — descarta a carta de maior "lixo"
export function iaDescartarCacheta(maoIA) {
  const lixo = calcularLixo(maoIA);

  // Se tem lixo, descarta a carta de maior valor do lixo
  if (lixo.length > 0) {
    return lixo.sort((a, b) => valorNumerico(b) - valorNumerico(a))[0];
  }

  // Se não tem lixo, descarta a carta menos valiosa
  return [...maoIA].sort((a, b) => valorNumerico(a) - valorNumerico(b))[0];
}

// IA decide se compra do descarte ou da pilha
export function iaDeveComprarDescarte(maoIA, cartaDescarte) {
  if (!cartaDescarte) return false;

  // Testa se a carta do descarte melhora a mão da IA
  const maoComDescarte   = [...maoIA, cartaDescarte];
  const lixoComDescarte  = calcularLixo(maoComDescarte).length;
  const lixoSemDescarte  = calcularLixo(maoIA).length;

  return lixoComDescarte < lixoSemDescarte;
}

// IA verifica se pode bater com 9 cartas
export function iaVerificarBateCacheta(maoIA) {
  return podeBater(maoIA);
}

// ============================================
// IA DO PÔQUER
// ============================================

export function iaDecidirPoker(maoIA, apostaAtual, fichasIA) {
  const forca = avaliarMaoPoker(maoIA);
  if (forca >= 4) return 'apostar';
  if (forca >= 2) return 'pagar';
  return 'desistir';
}

export function avaliarMaoPoker(mao) {
  const valores  = mao.map(c => valorNumerico(c)).sort((a, b) => a - b);
  const naipes   = mao.map(c => c.naipe);
  const contagem = {};
  for (const v of valores) contagem[v] = (contagem[v] || 0) + 1;
  const grupos    = Object.values(contagem).sort((a, b) => b - a);
  const flush     = naipes.every(n => n === naipes[0]);
  const sequencia = valores.every((v, i) => i === 0 || v === valores[i - 1] + 1);
  if (flush && sequencia)                 return 8;
  if (grupos[0] === 4)                    return 7;
  if (grupos[0] === 3 && grupos[1] === 2) return 6;
  if (flush)                              return 5;
  if (sequencia)                          return 4;
  if (grupos[0] === 3)                    return 3;
  if (grupos[0] === 2 && grupos[1] === 2) return 2;
  if (grupos[0] === 2)                    return 1;
  return 0;
}

// ============================================
// IA DO PORCO
// ============================================

export function iaDecidirPorco(maoIA, pontuacaoAtual) {
  if (pontuacaoAtual >= 15) return 'parar';
  return 'continuar';
}