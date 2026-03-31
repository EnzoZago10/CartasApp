// Valor de cada carta no Porco
export function valorCartaPorco(carta) {
  if (['J', 'Q', 'K'].includes(carta.valor)) return 10;
  if (carta.valor === 'A') return 1;
  return parseInt(carta.valor);
}

// Calcula a pontuação total da mão
export function calcularPontuacaoPorco(mao) {
  return mao.reduce((total, carta) => total + valorCartaPorco(carta), 0);
}

// Verifica se estourou (passou de 21)
export function estourou(mao) {
  return calcularPontuacaoPorco(mao) > 21;
}

// Verifica se tem 21 exato
export function temVinteum(mao) {
  return calcularPontuacaoPorco(mao) === 21;
}

// Resolve quem venceu
export function resolverPorco(maoJogador, maoIA) {
  const pj = calcularPontuacaoPorco(maoJogador);
  const pi = calcularPontuacaoPorco(maoIA);

  const jogadorEstourou = pj > 21;
  const iaEstourou      = pi > 21;

  if (jogadorEstourou && iaEstourou) return 'empate';
  if (jogadorEstourou)  return 'ia';
  if (iaEstourou)       return 'jogador';
  if (pj > pi)          return 'jogador';
  if (pi > pj)          return 'ia';
  return 'empate';
}