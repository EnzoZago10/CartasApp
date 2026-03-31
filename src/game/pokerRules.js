import { valorNumerico } from './deck';

// Nomes das combinações
export const COMBINACOES = [
  'Carta Alta',
  'Par',
  'Dois Pares',
  'Trinca',
  'Sequência',
  'Flush',
  'Full House',
  'Quadra',
  'Straight Flush',
];

// Avalia a força da mão (retorna índice da combinação)
export function avaliarMao(mao) {
  const valores = mao.map(c => valorNumerico(c)).sort((a, b) => a - b);
  const naipes  = mao.map(c => c.naipe);

  const contagem = {};
  for (const v of valores) contagem[v] = (contagem[v] || 0) + 1;
  const grupos = Object.values(contagem).sort((a, b) => b - a);

  const flush     = naipes.every(n => n === naipes[0]);
  const sequencia = valores.every((v, i) => i === 0 || v === valores[i - 1] + 1);

  if (flush && sequencia) return 8;
  if (grupos[0] === 4)    return 7;
  if (grupos[0] === 3 && grupos[1] === 2) return 6;
  if (flush)              return 5;
  if (sequencia)          return 4;
  if (grupos[0] === 3)    return 3;
  if (grupos[0] === 2 && grupos[1] === 2) return 2;
  if (grupos[0] === 2)    return 1;
  return 0;
}

// Resolve quem venceu
export function resolverPoker(maoJogador, maoIA) {
  const fj = avaliarMao(maoJogador);
  const fi = avaliarMao(maoIA);
  if (fj > fi) return 'jogador';
  if (fi > fj) return 'ia';
  return 'empate';
}