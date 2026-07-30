// screens/ModelSelectionScreen.js
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { getAllModels } from '../services/models';
import { COLORS } from '../theme';

export default function ModelSelectionScreen({ navigation }) {
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(true);

  const fetchModels = useCallback(async () => {
    setLoadingModels(true);
    try {
      const result = await getAllModels();
      setModels(result);
    } catch (e) {
      console.error('[Catálogo] Error cargando modelos:', e);
      Alert.alert('Error', 'No se pudo cargar el catálogo de modelos.');
    } finally {
      setLoadingModels(false);
    }
  }, []);

  // Recarga el catálogo cada vez que la pantalla vuelve a tener foco
  // (por ejemplo, al regresar del visor después de guardar un modelo nuevo)
  useFocusEffect(
    useCallback(() => {
      fetchModels();
    }, [fetchModels])
  );

  const handleLogout = () => {
    signOut(auth).catch(() =>
      Alert.alert('Error', 'No se pudo cerrar sesión. Intenta de nuevo.')
    );
    // onAuthStateChanged detecta user = null y RootNavigator
    // regresa automáticamente a AuthStack (pantalla Login)
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

  const handleOpenCatalogModel = (item) => {
    navigation.navigate('ModelViewer', {
      modelUri: item.modelUrl,
      fileName: item.name,
      fromCatalog: true, // ya está guardado: no mostrar botón de "Guardar en mi catálogo"
      modelId: item.id,
      ownerId: item.ownerId,
      description: item.description,
      category: item.category,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleOpenCatalogModel(item)}>
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Text style={styles.thumbnailPlaceholderText}>Sin miniatura</Text>
        </View>
      )}
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.name || 'Sin nombre'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi catálogo</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {loadingModels ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={models}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                Aún no tienes modelos guardados. Selecciona uno desde tu teléfono para empezar.
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.pickButton} onPress={handlePickModel}>
          <Text style={styles.pickButtonText}>Seleccionar modelo desde mi teléfono</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewerButton}
          onPress={() => navigation.navigate('ModelViewer')}
        >
          <Text style={styles.viewerButtonText}>Ver modelo de prueba</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CARD_SIZE = '48%';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.contrast,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  logoutText: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.secondary,
    fontSize: 14,
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  thumbnail: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.contrast,
  },
  thumbnailPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderText: {
    color: COLORS.secondary,
    fontSize: 12,
    opacity: 0.6,
  },
  cardTitle: {
    padding: 10,
    color: COLORS.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary,
    backgroundColor: COLORS.contrast,
  },
  pickButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  pickButtonText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  viewerButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});