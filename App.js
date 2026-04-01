import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text } from 'react-native';

import HomeScreen     from './src/screens/HomeScreen';
import TrucoScreen    from './src/screens/TrucoScreen';
import CachetaScreen  from './src/screens/CachetaScreen';
import PokerScreen    from './src/screens/PokerScreen';
import PacienciaScreen from './src/screens/PacienciaScreen';
import PorcoScreen    from './src/screens/PorcoScreen';
import RegraScreen    from './src/screens/RegraScreen';

const Stack = createStackNavigator();

// Botão de regras no header de cada jogo
function BotaoRegras({ navigation, jogo }) {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Regras', { jogo })}
      style={{ marginRight: 16 }}
    >
      <Text style={{ color: '#e9c46a', fontSize: 20 }}>📖</Text>
    </TouchableOpacity>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle:      { backgroundColor: '#1a1a2e' },
          headerTintColor:  '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '🃏 CartasApp' }}
        />
        <Stack.Screen
          name="Truco"
          component={TrucoScreen}
          options={({ navigation }) => ({
            title: '🃏 Truco',
            headerRight: () => <BotaoRegras navigation={navigation} jogo="Truco" />,
          })}
        />
        <Stack.Screen
          name="Cacheta"
          component={CachetaScreen}
          options={({ navigation }) => ({
            title: '🎴 Cacheta',
            headerRight: () => <BotaoRegras navigation={navigation} jogo="Cacheta" />,
          })}
        />
        <Stack.Screen
          name="Poker"
          component={PokerScreen}
          options={({ navigation }) => ({
            title: '♠️ Pôquer',
            headerRight: () => <BotaoRegras navigation={navigation} jogo="Poker" />,
          })}
        />
        <Stack.Screen
          name="Paciencia"
          component={PacienciaScreen}
          options={({ navigation }) => ({
            title: '🂡 Paciência',
            headerRight: () => <BotaoRegras navigation={navigation} jogo="Paciencia" />,
          })}
        />
        <Stack.Screen
          name="Porco"
          component={PorcoScreen}
          options={({ navigation }) => ({
            title: '🐷 Porco',
            headerRight: () => <BotaoRegras navigation={navigation} jogo="Porco" />,
          })}
        />
        <Stack.Screen
          name="Regras"
          component={RegraScreen}
          options={({ route }) => ({ title: `📖 Regras — ${route.params.jogo}` })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}