// PORCO — Jogo de passar cartas
// Objetivo: ser o primeiro a colecionar 4 cartas do mesmo valor
// Quando conseguir, toque o nariz antes dos outros!

// Verifica se o jogador tem 4 cartas do mesmo valor
export function temQuadra(mao) {
  if (mao.length < 4) return false;
  return mao.every(c => c.valor === mao[0].valor);
}

// Verifica quantas cartas iguais o jogador tem (para estratégia da IA)
export function maiorGrupo(mao) {
  const contagem = {};
  for (const carta of mao) {
    contagem[carta.valor] = (contagem[carta.valor] || 0) + 1;
  }
  return Math.max(...Object.values(contagem));
}

// IA escolhe qual carta descartar (passa a carta mais "inútil")
// Estratégia: descarta a carta do grupo com menor quantidade
export function iaEscolherCartaPorco(maoIA) {
  const contagem = {};
  for (const carta of maoIA) {
    contagem[carta.valor] = (contagem[carta.valor] || 0) + 1;
  }

  // Ordena cartas pelo grupo mais fraco (menor contagem)
  const ordenadas = [...maoIA].sort(
    (a, b) => contagem[a.valor] - contagem[b.valor]
  );

  return ordenadas[0];
}

// Distribui 4 cartas para cada jogador
export function distribuirCartas4(baralho) {
  return {
    maoJogador: baralho.slice(0, 4),
    maoIA:      baralho.slice(4, 8),
  };
}