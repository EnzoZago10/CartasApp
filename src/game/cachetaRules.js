import { valorNumerico } from './deck';

// Verifica trinca: 3 cartas do mesmo valor
// Exemplo válido: 7♦ 7♠ 7♥
export function temTrincia(mao) {
  return mao.length >= 3 && mao.every(c => c.valor === mao[0].valor);
}

// Verifica sequência: 3 cartas do mesmo naipe em ordem consecutiva
// Exemplo válido: 5♠ 6♠ 7♠
export function temSequencia(mao) {
  if (mao.length < 3) return false;
  const mesmosNaipe = mao.every(c => c.naipe === mao[0].naipe);
  if (!mesmosNaipe) return false;
  const valores = mao.map(c => valorNumerico(c)).sort((a, b) => a - b);
  for (let i = 1; i < valores.length; i++) {
    if (valores[i] !== valores[i - 1] + 1) return false;
  }
  return true;
}

// Pode bater se tiver trinca ou sequência
export function podeBater(mao) {
  return temTrincia(mao) || temSequencia(mao);
}

// Retorna o tipo de combinação para exibir na tela
export function tipoCombinacao(mao) {
  if (temTrincia(mao))   return '🎯 Trinca!';
  if (temSequencia(mao)) return '🔢 Sequência!';
  return null;
}

// Calcula pontuação da mão (usado para desempate)
export function calcularPontuacao(mao) {
  return mao.reduce((total, c) => total + valorNumerico(c), 0);
}