// screens/ModelViewerScreen.js
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

export default function ModelViewerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Visualizador (pendiente)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.contrast,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
  },
});