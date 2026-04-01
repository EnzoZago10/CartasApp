import { valorNumerico } from './deck';

// ============================================
// CACHETA — Jogadores começam com 9 cartas
// Compram a 10ª e descartam 1, ficando com 9
// Para BATER: todas as 9 cartas em combinações válidas
// ============================================

// TRINCA: 3 cartas do mesmo valor, naipes diferentes
// Exemplo válido:   7♦ 7♠ 7♥
// Exemplo inválido: 7♦ 7♦ 7♥ (naipes repetidos)
export function ehTrincia(grupo) {
  if (grupo.length !== 3) return false;
  const mesmosValores = grupo.every(c => c.valor === grupo[0].valor);
  const naipesUnicos  = new Set(grupo.map(c => c.naipe)).size === 3;
  return mesmosValores && naipesUnicos;
}

// SEQUÊNCIA: 3+ cartas do mesmo naipe em ordem consecutiva
// Exemplo válido:   5♠ 6♠ 7♠
// Exemplo inválido: 5♠ 6♥ 7♠ (naipes diferentes)
export function ehSequencia(grupo) {
  if (grupo.length < 3) return false;
  const mesmosNaipe = grupo.every(c => c.naipe === grupo[0].naipe);
  if (!mesmosNaipe) return false;
  const valores = grupo.map(c => valorNumerico(c)).sort((a, b) => a - b);
  for (let i = 1; i < valores.length; i++) {
    if (valores[i] !== valores[i - 1] + 1) return false;
  }
  return true;
}

// Verifica se um grupo é uma combinação válida (trinca ou sequência)
export function ehCombinacaoValida(grupo) {
  return ehTrincia(grupo) || ehSequencia(grupo);
}

// Verifica se pode BATER com 9 cartas
// As 9 cartas devem ser divididas em 3 grupos de 3 (todas válidas)
export function podeBater(mao) {
  if (mao.length !== 9) return false;
  return verificarCombinacoes(mao);
}

// Algoritmo recursivo que tenta dividir as 9 cartas em grupos válidos
function verificarCombinacoes(cartas) {
  if (cartas.length === 0) return true;
  if (cartas.length < 3)   return false;

  const primeira = cartas[0];
  const restantes = cartas.slice(1);

  // Tenta formar grupos de 3 com a primeira carta
  for (let i = 0; i < restantes.length - 1; i++) {
    for (let j = i + 1; j < restantes.length; j++) {
      const grupo = [primeira, restantes[i], restantes[j]];
      if (ehCombinacaoValida(grupo)) {
        const sobram = restantes.filter((_, idx) => idx !== i && idx !== j);
        if (verificarCombinacoes(sobram)) return true;
      }
    }
  }
  return false;
}

// Retorna os grupos formados para exibir na tela
export function encontrarGrupos(mao) {
  const grupos = [];
  let cartasRestantes = [...mao];

  while (cartasRestantes.length >= 3) {
    const primeira = cartasRestantes[0];
    const restantes = cartasRestantes.slice(1);
    let encontrou = false;

    for (let i = 0; i < restantes.length - 1; i++) {
      for (let j = i + 1; j < restantes.length; j++) {
        const grupo = [primeira, restantes[i], restantes[j]];
        if (ehCombinacaoValida(grupo)) {
          grupos.push(grupo);
          cartasRestantes = restantes.filter((_, idx) => idx !== i && idx !== j);
          encontrou = true;
          break;
        }
      }
      if (encontrou) break;
    }
    if (!encontrou) break;
  }

  return grupos;
}

// Retorna o tipo da combinação para exibir
export function tipoCombinacao(grupo) {
  if (ehTrincia(grupo))   return 'Trinca';
  if (ehSequencia(grupo)) return 'Sequência';
  return 'Inválido';
}

// Avalia o "lixo" na mão (cartas sem combinação)
// Útil para IA decidir qual carta descartar
export function calcularLixo(mao) {
  const grupos = encontrarGrupos(mao);
  const cartasEmGrupos = grupos.flat();
  return mao.filter(c => !cartasEmGrupos.includes(c));
}

// Pontuação do lixo (soma dos valores das cartas sem combinação)
export function pontosLixo(mao) {
  const lixo = calcularLixo(mao);
  return lixo.reduce((total, c) => total + valorNumerico(c), 0);
}