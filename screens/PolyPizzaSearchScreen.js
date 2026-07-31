// screens/PolyPizzaSearchScreen.js
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { searchPolyPizzaModels } from '../services/polypizza';
import { COLORS } from '../theme';

export default function PolyPizzaSearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const models = await searchPolyPizzaModels(query.trim());
      setResults(models);
    } catch (e) {
      console.error('[PolyPizza] Error buscando modelos:', e);
      Alert.alert('Error', 'No se pudo conectar con Poly Pizza. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModel = (item) => {
    navigation.push('ModelViewer', {
      modelUri: item.modelUrl,
      fileName: item.name,
      fromPolyPizza: true,
      polyPizzaData: {
        thumbnailUrl: item.thumbnailUrl,
        attribution: item.attribution,
        externalId: item.externalId,
        category: item.category,
      },
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleSelectModel(item)}>
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.cardCreator} numberOfLines={1}>
        por {item.creatorUsername} · {item.licence}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar modelos (ej. chair, tree, car)"
          placeholderTextColor={COLORS.secondary}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.externalId}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          renderItem={renderItem}
          ListEmptyComponent={
            searched ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>
                  No se encontraron modelos para "{query}".
                </Text>
              </View>
            ) : (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>
                  Busca modelos gratuitos de Poly Pizza para agregar a tu catálogo.
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const CARD_SIZE = '48%';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.contrast,
  },
  searchRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.secondary,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
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
    height: 120,
    backgroundColor: COLORS.contrast,
  },
  cardTitle: {
    paddingHorizontal: 10,
    paddingTop: 8,
    color: COLORS.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  cardCreator: {
    paddingHorizontal: 10,
    paddingBottom: 8,
    color: COLORS.secondary,
    fontSize: 11,
    opacity: 0.6,
  },
});