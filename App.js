import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './src/screens/HomeScreen';
import TrucoScreen from './src/screens/TrucoScreen';
import CachetaScreen from './src/screens/CachetaScreen';
import PokerScreen from './src/screens/PokerScreen';
import PacienciaScreen from './src/screens/PacienciaScreen';
import PorcoScreen from './src/screens/PorcoScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff',
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
          options={{ title: '🃏 Truco' }}
        />
        <Stack.Screen
          name="Cacheta"
          component={CachetaScreen}
          options={{ title: '🎴 Cacheta' }}
        />
        <Stack.Screen
          name="Poker"
          component={PokerScreen}
          options={{ title: '♠️ Pôquer' }}
        />
        <Stack.Screen
          name="Paciencia"
          component={PacienciaScreen}
          options={{ title: '🂡 Paciência' }}
        />
        <Stack.Screen
          name="Porco"
          component={PorcoScreen}
          options={{ title: '🐷 Porco' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}