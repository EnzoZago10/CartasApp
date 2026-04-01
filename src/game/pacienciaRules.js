import { valorNumerico } from './deck';

// Cores dos naipes (vermelho ou preto)
export function corNaipe(naipe) {
  return ['ouros', 'copas'].includes(naipe) ? 'vermelho' : 'preto';
}

// Verifica se uma carta pode ser movida para uma coluna do tableau
export function podeEmpilharTableau(cartaCima, cartaBase) {
  if (!cartaBase) return cartaCima.valor === 'K'; // coluna vazia só aceita Rei
  const corDiferente = corNaipe(cartaCima.naipe) !== corNaipe(cartaBase.naipe);
  const valorMenor   = valorNumerico(cartaCima) === valorNumerico(cartaBase) - 1;
  return corDiferente && valorMenor;
}

// Verifica se uma carta pode ir para a fundação
export function podeIrFundacao(carta, pilhaFundacao) {
  if (pilhaFundacao.length === 0) return carta.valor === 'A';
  const topo = pilhaFundacao[pilhaFundacao.length - 1];
  return carta.naipe === topo.naipe &&
    valorNumerico(carta) === valorNumerico(topo) + 1;
}

// Verifica se o jogo foi vencido (todas as fundações com 13 cartas)
export function verificarVitoria(fundacoes) {
  return fundacoes.every(f => f.length === 13);
}

// Monta o estado inicial do tableau
export function montarTableau(baralho) {
  const tableau = [];
  let idx = 0;
  for (let col = 0; col < 7; col++) {
    const coluna = [];
    for (let row = 0; row <= col; row++) {
      coluna.push({ ...baralho[idx], virada: row < col });
      idx++;
    }
    tableau.push(coluna);
  }
  return { tableau, restante: baralho.slice(idx) };
}