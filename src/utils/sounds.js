import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Vibração leve (tocar carta, comprar)
export async function vibrarLeve() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

// Vibração média (ganhar rodada)
export async function vibrarMedio() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

// Vibração forte (vencer partida, bater)
export async function vibrarForte() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

// Vibração de erro (jogada inválida)
export async function vibrarErro() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}