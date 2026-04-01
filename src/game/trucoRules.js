// Hierarquia do Truco Paulista (do mais fraco para o mais forte)
// 8, 9 e 10 não existem no baralho de Truco
const ORDEM_TRUCO = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];

// Retorna o valor da manilha baseado na vira
// Exemplo: vira = 3 → manilha = 4 | vira = 7 → manilha = Q
export function getManilha(vira) {
  const idx = ORDEM_TRUCO.indexOf(vira.valor);
  return ORDEM_TRUCO[(idx + 1) % ORDEM_TRUCO.length];
}

// Retorna a força da carta no Truco
// Manilhas têm força 100+ ordenadas por naipe:
// ouros(100) < espadas(101) < copas(102) < paus/zap(103)
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

// Retorna nome da manilha com naipe para exibir na tela
// Exemplo: "4♣ (Zap)" para manilha de paus
export function nomeManilha(valorManilha, naipe) {
  const simbolos = { ouros: '♦', espadas: '♠', copas: '♥', paus: '♣' };
  const apelidos = { paus: 'Zap', copas: 'Copas', espadas: 'Espadilha', ouros: 'Ouros' };
  return `${valorManilha}${simbolos[naipe]} (${apelidos[naipe]})`;
}