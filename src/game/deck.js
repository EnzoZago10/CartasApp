// Naipes e valores do baralho
const NAIPES = ['ouros', 'espadas', 'copas', 'paus'];
const VALORES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Símbolos dos naipes para exibir na tela
export const SIMBOLOS_NAIPES = {
  ouros:   '♦',
  espadas: '♠',
  copas:   '♥',
  paus:    '♣',
};

// Cores dos naipes
export const CORES_NAIPES = {
  ouros:   '#e63946',
  espadas: '#fff',
  copas:   '#e63946',
  paus:    '#fff',
};

// Cria um baralho completo com 52 cartas
export function criarBaralho() {
  const baralho = [];
  for (const naipe of NAIPES) {
    for (const valor of VALORES) {
      baralho.push({ naipe, valor });
    }
  }
  return baralho;
}

// Embaralha o baralho
export function embaralhar(baralho) {
  const embaralhado = [...baralho];
  for (let i = embaralhado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [embaralhado[i], embaralhado[j]] = [embaralhado[j], embaralhado[i]];
  }
  return embaralhado;
}

// Distribui as mãos para jogador e IA
export function distribuirMaos(baralho, qtdCartas = 3) {
  const embaralhado = embaralhar(baralho);
  return {
    maoJogador: embaralhado.slice(0, qtdCartas),
    maoIA:      embaralhado.slice(qtdCartas, qtdCartas * 2),
    restante:   embaralhado.slice(qtdCartas * 2),
  };
}

// Retorna o valor numérico de uma carta para comparações
export function valorNumerico(carta) {
  const ordem = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  return ordem.indexOf(carta.valor);
}