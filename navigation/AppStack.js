// navigation/AppStack.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ModelSelectionScreen from '../screens/ModelSelectionScreen';
import ModelViewerScreen from '../screens/ModelViewerScreen';
import PolyPizzaSearchScreen from '../screens/PolyPizzaSearchScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ModelSelection"
        component={ModelSelectionScreen}
        options={{ title: 'Mis modelos 3D' }}
      />
      <Stack.Screen
        name="ModelViewer"
        component={ModelViewerScreen}
        options={{ title: 'Visualizador' }}
      />
      <Stack.Screen
        name="PolyPizzaSearch"
        component={PolyPizzaSearchScreen}
        options={{ title: 'Buscar en Poly Pizza' }}
      />
    </Stack.Navigator>
  );
}