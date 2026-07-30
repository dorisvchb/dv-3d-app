// services/storage.js
// Usa Cloudinary en vez de Firebase Storage: plan gratuito sin necesidad
// de tarjeta de crédito (Firebase Storage requiere el plan Blaze, que sí
// la exige aunque no cobre dentro de la capa gratuita).

const CLOUD_NAME = 'ymmomcxv'; // ej. 'dxxxxxxxx'
const UPLOAD_PRESET = 'eieldbrv'; // el preset "unsigned" que creaste

/**
 * Sube un archivo local a Cloudinary.
 * @param {string} localUri - URI local del archivo (file://...)
 * @param {string} fileName - nombre del archivo con extensión
 * @param {'raw'|'image'} resourceType - "raw" para .glb/.gltf, "image" para PNG/JPG
 */
async function uploadToCloudinary(localUri, fileName, resourceType) {
  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name: fileName,
    type: resourceType === 'image' ? 'image/png' : 'application/octet-stream',
  });
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Error subiendo archivo a Cloudinary');
  }
  return data.secure_url;
}

/**
 * Sube el modelo .glb y su miniatura a Cloudinary.
 * Misma firma que la versión anterior con Firebase Storage, así que
 * ModelViewerScreen.js no necesita ningún cambio.
 */
export async function uploadModelWithThumbnail({
  ownerId,
  modelLocalUri,
  thumbnailLocalUri,
  fileBaseName,
}) {
  const timestamp = Date.now();
  const modelFileName = `${fileBaseName}_${timestamp}.glb`;
  const thumbnailFileName = `${fileBaseName}_${timestamp}_thumb.png`;

  const [modelUrl, thumbnailUrl] = await Promise.all([
    uploadToCloudinary(modelLocalUri, modelFileName, 'raw'),
    uploadToCloudinary(thumbnailLocalUri, thumbnailFileName, 'image'),
  ]);

  return { modelUrl, thumbnailUrl };
}