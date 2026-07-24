// navigation/AppStack.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ModelSelectionScreen from '../screens/ModelSelectionScreen';
import ModelViewerScreen from '../screens/ModelViewerScreen';

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
    </Stack.Navigator>
  );
}