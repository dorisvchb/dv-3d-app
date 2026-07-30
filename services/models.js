// services/models.js
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const modelsRef = collection(db, 'models');

/**
 * Crea un nuevo documento de modelo 3D en Firestore.
 * @param {object} modelData - Campos según el esquema (name, description,
 *   category, modelUrl, modelType, thumbnailUrl, initialScale,
 *   initialPosition, source, externalId, attribution, ownerId).
 * @returns {Promise<string>} el ID del documento creado.
 */
export async function createModel(modelData) {
  const docRef = await addDoc(modelsRef, {
    ...modelData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Obtiene todos los modelos del catálogo (lectura permitida a cualquier
 * usuario autenticado, según las Security Rules).
 */
export async function getAllModels() {
  const snapshot = await getDocs(modelsRef);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Obtiene un modelo específico por su ID.
 */
export async function getModelById(modelId) {
  const docSnap = await getDoc(doc(db, 'models', modelId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Obtiene solo los modelos subidos por un usuario específico.
 */
export async function getModelsByOwner(ownerId) {
  const q = query(modelsRef, where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Actualiza campos de un modelo existente (solo el dueño puede hacerlo,
 * según las Security Rules).
 */
export async function updateModel(modelId, updates) {
  await updateDoc(doc(db, 'models', modelId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Elimina un modelo (solo el dueño puede hacerlo, según las Security Rules).
 */
export async function deleteModel(modelId) {
  await deleteDoc(doc(db, 'models', modelId));
}