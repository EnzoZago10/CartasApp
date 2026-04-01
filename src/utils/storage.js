import AsyncStorage from '@react-native-async-storage/async-storage';

// Salva a pontuação de um jogo
export async function salvarPontuacao(jogo, pontos) {
  try {
    await AsyncStorage.setItem(`@cartasapp:${jogo}`, JSON.stringify(pontos));
  } catch (e) {
    console.error('Erro ao salvar pontuação:', e);
  }
}

// Carrega a pontuação de um jogo
export async function carregarPontuacao(jogo) {
  try {
    const valor = await AsyncStorage.getItem(`@cartasapp:${jogo}`);
    return valor ? JSON.parse(valor) : { jogador: 0, ia: 0 };
  } catch (e) {
    console.error('Erro ao carregar pontuação:', e);
    return { jogador: 0, ia: 0 };
  }
}

// Limpa todas as pontuações
export async function limparPontuacoes() {
  try {
    const chaves = ['truco', 'cacheta', 'poker', 'paciencia', 'porco']
      .map(j => `@cartasapp:${j}`);
    await AsyncStorage.multiRemove(chaves);
  } catch (e) {
    console.error('Erro ao limpar pontuações:', e);
  }
}