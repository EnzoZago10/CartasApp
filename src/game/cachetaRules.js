import { valorNumerico } from './deck';

// Verifica se a mão tem uma trinca (3 cartas do mesmo valor)
export function temTrincia(mao) {
  return mao.every(c => c.valor === mao[0].valor);
}

// Verifica se a mão tem uma sequência do mesmo naipe
export function temSequencia(mao) {
  const mesmosNaipe = mao.every(c => c.naipe === mao[0].naipe);
  if (!mesmosNaipe) return false;

  const valores = mao.map(c => valorNumerico(c)).sort((a, b) => a - b);
  return valores[1] === valores[0] + 1 && valores[2] === valores[1] + 1;
}

// Verifica se pode bater
export function podeBater(mao) {
  return temTrincia(mao) || temSequencia(mao);
}

// Calcula a pontuação da mão (soma dos valores)
export function calcularPontuacao(mao) {
  return mao.reduce((total, c) => total + valorNumerico(c), 0);
}