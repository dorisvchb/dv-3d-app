// screens/ModelSelectionScreen.js
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { COLORS } from '../theme';

export default function ModelSelectionScreen({ navigation }) {
  const handleLogout = () => {
    signOut(auth).catch(() =>
      Alert.alert('Error', 'No se pudo cerrar sesión. Intenta de nuevo.')
    );
    // onAuthStateChanged detecta user = null y RootNavigator
    // regresa automáticamente a AuthStack (pantalla Login)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla principal</Text>

      {/* Botón temporal para probar el visor 3D mientras no existe el catálogo (Parte 5) */}
      <TouchableOpacity
        style={styles.viewerButton}
        onPress={() => navigation.navigate('ModelViewer')}
      >
        <Text style={styles.viewerButtonText}>Ver modelo de prueba</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  viewerButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  viewerButtonText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});