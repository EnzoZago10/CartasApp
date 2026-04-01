import { useEffect, useRef } from 'react';
import {
  TouchableOpacity, View, Text, StyleSheet,
  Animated,
} from 'react-native';
import { SIMBOLOS_NAIPES, CORES_NAIPES } from '../game/deck';
import { vibrarLeve } from '../utils/sounds';

export default function Card({
  carta,
  onPress,
  virada      = false,
  desabilitada = false,
  animada      = true,
}) {
  const flipAnim = useRef(new Animated.Value(virada ? 0 : 180)).current;
  const prevVirada = useRef(virada);

  useEffect(() => {
    if (prevVirada.current !== virada) {
      Animated.timing(flipAnim, {
        toValue:         virada ? 0 : 180,
        duration:        400,
        useNativeDriver: true,
      }).start();
      prevVirada.current = virada;
    }
  }, [virada]);

  // Rotação da frente (visível quando flipAnim > 90)
  const rotacaoFrente = flipAnim.interpolate({
    inputRange:  [0, 90, 180],
    outputRange: ['180deg', '90deg', '0deg'],
  });

  // Rotação do verso (visível quando flipAnim < 90)
  const rotacaoVerso = flipAnim.interpolate({
    inputRange:  [0, 90, 180],
    outputRange: ['0deg', '90deg', '180deg'],
  });

  async function handlePress() {
    if (desabilitada || !onPress) return;
    await vibrarLeve();
    onPress();
  }

  const simbolo = carta ? SIMBOLOS_NAIPES[carta.naipe] : '';
  const cor     = carta ? CORES_NAIPES[carta.naipe]    : '#000';

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={desabilitada || !onPress}
      activeOpacity={0.8}
      style={styles.wrapper}
    >
      {/* Frente da carta */}
      <Animated.View
        style={[
          styles.carta,
          desabilitada && styles.desabilitada,
          { transform: [{ rotateY: rotacaoFrente }], backfaceVisibility: 'hidden' },
        ]}
      >
        <View style={styles.canto}>
          <Text style={[styles.valor, { color: cor }]}>{carta?.valor}</Text>
          <Text style={[styles.naipe, { color: cor }]}>{simbolo}</Text>
        </View>
        <Text style={[styles.simboloCentro, { color: cor }]}>{simbolo}</Text>
        <View style={[styles.canto, styles.cantoInferior]}>
          <Text style={[styles.valor, { color: cor }]}>{carta?.valor}</Text>
          <Text style={[styles.naipe, { color: cor }]}>{simbolo}</Text>
        </View>
      </Animated.View>

      {/* Verso da carta */}
      <Animated.View
        style={[
          styles.carta,
          styles.verso,
          styles.absoluto,
          { transform: [{ rotateY: rotacaoVerso }], backfaceVisibility: 'hidden' },
        ]}
      >
        <Text style={styles.textoVerso}>🂠</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 70, height: 100,
    margin: 6,
  },
  carta: {
    width: 70, height: 100,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 6,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  absoluto:       { position: 'absolute', top: 0, left: 0 },
  verso: {
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoVerso:     { fontSize: 40, color: '#fff' },
  desabilitada:   { opacity: 0.6 },
  canto:          { alignItems: 'flex-start' },
  cantoInferior:  { alignItems: 'flex-end', transform: [{ rotate: '180deg' }] },
  valor:          { fontSize: 16, fontWeight: 'bold', lineHeight: 18 },
  naipe:          { fontSize: 14, lineHeight: 16 },
  simboloCentro:  { fontSize: 28, textAlign: 'center' },
});