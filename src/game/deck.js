const NAIPES  = ['ouros', 'espadas', 'copas', 'paus'];
const VALORES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Baralho do Truco usa 40 cartas (sem 8, 9 e 10)
const VALORES_TRUCO = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'];

export const SIMBOLOS_NAIPES = {
  ouros:   '♦',
  espadas: '♠',
  copas:   '♥',
  paus:    '♣',
};

export const CORES_NAIPES = {
  ouros:   '#e63946',
  espadas: '#1a1a2e',
  copas:   '#e63946',
  paus:    '#1a1a2e',
};

// Baralho completo de 52 cartas (Cacheta, Pôquer, Paciência, Porco)
export function criarBaralho() {
  const baralho = [];
  for (const naipe of NAIPES)
    for (const valor of VALORES)
      baralho.push({ naipe, valor });
  return baralho;
}

// Baralho de 40 cartas para o Truco (sem 8, 9 e 10)
export function criarBaralhoTruco() {
  const baralho = [];
  for (const naipe of NAIPES)
    for (const valor of VALORES_TRUCO)
      baralho.push({ naipe, valor });
  return baralho;
}

export function embaralhar(baralho) {
  const embaralhado = [...baralho];
  for (let i = embaralhado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [embaralhado[i], embaralhado[j]] = [embaralhado[j], embaralhado[i]];
  }
  return embaralhado;
}

export function distribuirMaos(baralho, qtdCartas = 3) {
  const embaralhado = embaralhar(baralho);
  return {
    maoJogador: embaralhado.slice(0, qtdCartas),
    maoIA:      embaralhado.slice(qtdCartas, qtdCartas * 2),
    restante:   embaralhado.slice(qtdCartas * 2),
  };
}

// Valor numérico para baralho padrão (Pôquer, Paciência, Cacheta)
export function valorNumerico(carta) {
  const ordem = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  return ordem.indexOf(carta.valor);
}