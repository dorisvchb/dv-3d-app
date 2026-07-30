// screens/ModelSelectionScreen.js
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { createModel, getAllModels } from '../services/models';
import { COLORS } from '../theme';

export default function ModelSelectionScreen({ navigation }) {
  const { user } = useAuth();
  const [testingFirestore, setTestingFirestore] = useState(false);

  const handleLogout = () => {
    signOut(auth).catch(() =>
      Alert.alert('Error', 'No se pudo cerrar sesión. Intenta de nuevo.')
    );
    // onAuthStateChanged detecta user = null y RootNavigator
    // regresa automáticamente a AuthStack (pantalla Login)
  };

  // Prueba temporal: crea un documento de modelo de prueba en Firestore
  // (valida las Security Rules de creación) y luego lee todo el catálogo
  // (valida la regla de lectura). Se elimina una vez confirmada la conexión.
  const handleTestFirestore = async () => {
    setTestingFirestore(true);
    try {
      const testId = await createModel({
        name: 'Modelo de prueba',
        description: 'Documento creado para verificar la conexión a Firestore',
        category: 'prueba',
        modelUrl: '',
        modelType: 'glb',
        thumbnailUrl: '',
        initialScale: 1,
        initialPosition: { x: 0, y: 0, z: 0 },
        source: 'local',
        externalId: null,
        attribution: null,
        ownerId: user.uid,
      });

      const allModels = await getAllModels();

      Alert.alert(
        'Firestore conectado correctamente',
        `Documento de prueba creado (ID: ${testId}).\nTotal de modelos en la colección: ${allModels.length}.`
      );
    } catch (e) {
      console.error('[Firestore test] Error:', e);
      Alert.alert('Error de conexión', e.message || 'No se pudo conectar con Firestore.');
    } finally {
      setTestingFirestore(false);
    }
  };

  // Abre el selector de archivos del sistema y navega al visor con el
  // .glb/.gltf elegido. La app no tiene acceso directo al sistema de
  // archivos por seguridad — expo-document-picker devuelve una URI local
  // temporal (file://...) accesible únicamente por esta app.
  const handlePickModel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Android no reconoce un MIME type estándar para .glb/.gltf
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const nameLower = file.name.toLowerCase();
      if (!nameLower.endsWith('.glb') && !nameLower.endsWith('.gltf')) {
        Alert.alert('Formato no soportado', 'Selecciona un archivo .glb o .gltf');
        return;
      }

      navigation.navigate('ModelViewer', { modelUri: file.uri, fileName: file.name });
    } catch (e) {
      console.error('[DocumentPicker] Error:', e);
      Alert.alert('Error', 'No se pudo seleccionar el archivo.');
    }
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

      {/* Selector de modelo .glb/.gltf propio desde el teléfono */}
      <TouchableOpacity style={styles.pickButton} onPress={handlePickModel}>
        <Text style={styles.pickButtonText}>Seleccionar modelo desde mi teléfono</Text>
      </TouchableOpacity>

      {/* Botón temporal para verificar la conexión a Firestore */}
      <TouchableOpacity
        style={styles.firestoreButton}
        onPress={handleTestFirestore}
        disabled={testingFirestore}
      >
        {testingFirestore ? (
          <ActivityIndicator color={COLORS.secondary} />
        ) : (
          <Text style={styles.firestoreButtonText}>Probar conexión Firestore</Text>
        )}
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
  pickButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 220,
    alignItems: 'center',
  },
  pickButtonText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  firestoreButton: {
    marginTop: 24,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 220,
    alignItems: 'center',
  },
  firestoreButtonText: {
    color: '#FFFFFF',
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