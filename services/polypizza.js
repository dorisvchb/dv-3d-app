// services/polypizza.js
// Integración con la API de Poly Pizza (https://poly.pizza) para buscar
// modelos 3D gratuitos (CC0 / CC-BY) como fuente adicional del catálogo.

const API_BASE = 'https://api.poly.pizza/v1';
const API_TOKEN = 'bd7b214cef9a49d1a43bf3cbcd4d2828'; // reemplaza con tu X-Auth-Token real

/**
 * Busca modelos en Poly Pizza según una palabra clave.
 * @param {string} query - término de búsqueda (ej. "chair", "tree")
 * @param {number} limit - máximo de resultados (por defecto 20)
 * @returns {Promise<Array>} lista de modelos normalizada para la app
 */
export async function searchPolyPizzaModels(query, limit = 20) {
  const url = `${API_BASE}/search/${encodeURIComponent(query)}?limit=${limit}`;

  const response = await fetch(url, {
    headers: { 'X-Auth-Token': API_TOKEN },
  });

  if (!response.ok) {
    throw new Error(`Error de Poly Pizza: ${response.status}`);
  }

  const data = await response.json();

  // Normaliza los campos de la API (en PascalCase) a los nombres que
  // usamos internamente en la app, para no depender del formato exacto
  // de Poly Pizza en el resto del código.
  return data.results.map((item) => ({
    externalId: item.ID,
    name: item.Title,
    description: item.Description || '',
    thumbnailUrl: item.Thumbnail,
    modelUrl: item.Download,
    category: item.Category || 'sin categoría',
    tags: item.Tags || [],
    licence: item.Licence,
    attribution: item.Attribution,
    creatorUsername: item.Creator?.Username || '',
    triCount: item['Tri Count'] ?? null,
  }));
}