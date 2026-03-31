import { valorNumerico } from './deck';

// Hierarquia específica do Truco
const ORDEM_TRUCO = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];

// Define a manilha baseada na vira
export function getManilha(vira) {
  const idx = ORDEM_TRUCO.indexOf(vira.valor);
  return ORDEM_TRUCO[(idx + 1) % ORDEM_TRUCO.length];
}

// Força de cada carta no Truco
export function forcaCarta(carta, manilha) {
  const ordemManilha = ['ouros', 'espadas', 'copas', 'paus'];
  if (carta.valor === manilha) {
    return 100 + ordemManilha.indexOf(carta.naipe);
  }
  return ORDEM_TRUCO.indexOf(carta.valor);
}

// Resolve quem ganhou a rodada
export function resolverRodada(cartaJogador, cartaIA, manilha) {
  const fj = forcaCarta(cartaJogador, manilha);
  const fi = forcaCarta(cartaIA, manilha);
  if (fj > fi) return 'jogador';
  if (fi > fj) return 'ia';
  return 'empate';
}