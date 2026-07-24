// screens/ModelSelectionScreen.js
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { COLORS } from '../theme';

export default function ModelSelectionScreen() {
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