import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { SIMBOLOS_NAIPES, CORES_NAIPES } from '../game/deck';

export default function Card({ carta, onPress, virada = false, desabilitada = false }) {

  // Carta virada (mostra o verso)
  if (virada) {
    return (
      <View style={[styles.carta, styles.verso]}>
        <Text style={styles.textoVerso}>🂠</Text>
      </View>
    );
  }

  const simbolo = SIMBOLOS_NAIPES[carta.naipe];
  const cor     = CORES_NAIPES[carta.naipe];

  return (
    <TouchableOpacity
      style={[styles.carta, desabilitada && styles.desabilitada]}
      onPress={onPress}
      disabled={desabilitada}
      activeOpacity={0.7}
    >
      {/* Canto superior esquerdo */}
      <View style={styles.canto}>
        <Text style={[styles.valor, { color: cor }]}>{carta.valor}</Text>
        <Text style={[styles.naipe, { color: cor }]}>{simbolo}</Text>
      </View>

      {/* Centro */}
      <Text style={[styles.simboloCentro, { color: cor }]}>{simbolo}</Text>

      {/* Canto inferior direito (invertido) */}
      <View style={[styles.canto, styles.cantoInferior]}>
        <Text style={[styles.valor, { color: cor }]}>{carta.valor}</Text>
        <Text style={[styles.naipe, { color: cor }]}>{simbolo}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  carta: {
    width: 70,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 6,
    padding: 6,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  verso: {
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoVerso: {
    fontSize: 40,
    color: '#fff',
  },
  desabilitada: {
    opacity: 0.5,
  },
  canto: {
    alignItems: 'flex-start',
  },
  cantoInferior: {
    alignItems: 'flex-end',
    transform: [{ rotate: '180deg' }],
  },
  valor: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  naipe: {
    fontSize: 14,
    lineHeight: 16,
  },
  simboloCentro: {
    fontSize: 28,
    textAlign: 'center',
  },
});