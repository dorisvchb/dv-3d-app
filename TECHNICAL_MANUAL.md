# Manual técnico — [dv3D] v1.0.0

## 1. Descripción general

Aplicación móvil (Expo React Native, JavaScript) para visualización interactiva de objetos 3D. Incluye autenticación de usuarios, un visor 3D con gestos táctiles completos, y un catálogo con CRUD de modelos alimentado por fuentes locales y externas (Poly Pizza).

---
### Problema que resuelve

La falta de aplicaciones móviles enfocadas en visualización 3D interactiva dificulta que los usuarios experimenten nuevas formas de interacción digital mediante modelos tridimensionales, especialmente en proyectos educativos, demostrativos o de aprendizaje tecnológico.

Ante esta situación, surge la necesidad de desarrollar una aplicación móvil que permita la visualización interactiva de objetos en 3D utilizando **Expo React Native** y **React Three Fiber**, con el propósito de ofrecer una experiencia gráfica moderna y dinámica en dispositivos móviles.

### Usuario objetivo

La aplicación dv3D está orientada a usuarios con un nivel tecnológico medio, principalmente a estudiantes, docentes y usuarios interesados en la visualización tridimensional, quienes requieran una herramienta móvil que permita explorar e interactuar con objetos 3D de manera intuitiva y dinámica.

### Alcance del MVP
Funcionalidades: Registro e inicio de sesión, visualización del modelo 3D, catálogo de modelos 3D con miniaturas, rotación y zoom táctil, CRUD de modelo 3D, integración con Poly Pizza API.

## 2. Arquitectura general

```
dv-3d-app/
├── App.js                       # Entry point: polyfills, GestureHandlerRootView, AuthProvider, RootNavigator
├── polyfills.js                 # Shims de atob/btoa/TextEncoder para Hermes (RN)
├── firebaseConfig.js            # Inicialización de Firebase (Authentication + Firestore)
├── theme.js                     # Paleta de colores y estilos compartidos
├── validation.js                # Validaciones de formularios (correo, contraseña, nombre)
├── metro.config.js              # Config de Metro: reconoce .glb/.gltf como assets
├── babel.config.js              # Preset de Expo + plugin de react-native-reanimated
├── context/
│   └── AuthContext.js           # Estado global de sesión (onAuthStateChanged)
├── services/
│   ├── models.js                # CRUD de la colección "models" en Firestore
│   ├── storage.js               # Subida de archivos (.glb + miniatura) a Cloudinary
│   └── polypizza.js             # Búsqueda de modelos en la API de Poly Pizza
├── navigation/
│   ├── AuthStack.js             # Login, Register
│   ├── AppStack.js              # ModelSelection, ModelViewer, PolyPizzaSearch
│   └── RootNavigator.js         # Decide stack según sesión activa
├── screens/
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── ModelSelectionScreen.js  # Catálogo: FlatList con miniaturas desde Firestore
│   ├── ModelViewerScreen.js     # Visor 3D + guardar/editar/eliminar
│   └── PolyPizzaSearchScreen.js # Buscador de modelos externos gratuitos
└── assets/
    └── models/
        ├── aldeana_appExpo.glb
        └── aldeana_textura.png
```

### Flujo de autenticación
`onAuthStateChanged` (global, en `AuthContext`) decide automáticamente entre `AuthStack` y `AppStack` — ninguna pantalla navega manualmente entre ambos; el registro cierra sesión (`signOut`) tras crear la cuenta para evitar autologin no deseado.

---

## 3. Librerías instaladas y su propósito

| Librería | Uso |
|---|---|
| `firebase` | Authentication (registro/login) + Firestore (metadatos del catálogo) |
| `@react-native-async-storage/async-storage` | Persistencia de sesión de Firebase |
| `@react-navigation/native`, `@react-navigation/native-stack` | Navegación entre pantallas |
| `react-native-screens`, `react-native-safe-area-context` | Dependencias de React Navigation |
| `three` | Motor 3D base |
| `@react-three/fiber` | Renderer declarativo de Three.js sobre React (Canvas nativo vía `expo-gl`) |
| `@react-three/drei` | Instalada, sin uso activo por ahora en el visor |
| `expo-gl` | Contexto WebGL nativo requerido por R3F en Expo |
| `expo-asset` | Carga de archivos locales empaquetados (`.glb`, `.png`) como assets |
| `expo-file-system` | Soporte interno de `expo-asset` |
| `expo-document-picker` | Selector nativo de archivos para elegir `.glb`/`.gltf` propios |
| `react-native-view-shot` | Captura de miniatura del visor al guardar un modelo propio |
| `react-native-gesture-handler` | Gestos táctiles (rotación, zoom) |
| `react-native-reanimated` + `react-native-worklets` | Ejecuta la lógica de gestos en el hilo de UI, sin lag |

### Descartada: `expo-three`
Causaba un colgado indefinido de `GLTFLoader`. Se reemplazó por una implementación manual de carga de texturas (ver sección 4).

### Storage: Cloudinary en vez de Firebase Storage
Firebase Storage exige el plan de pago "Blaze" (requiere tarjeta de crédito registrada, aunque no cobre dentro de la capa gratuita). Se opta por **Cloudinary** (capa gratuita de 25GB sin necesidad de tarjeta) para alojar `.glb` y miniaturas, vía su API REST con upload preset "unsigned". Firestore y Authentication se mantienen en el plan gratuito "Spark" de Firebase (no requiere tarjeta).

---

## 4. Visor 3D — decisiones técnicas clave

### Texturas embebidas en base64 no cargan en RN
`THREE.TextureLoader`/`GLTFLoader` dependen de `document`/`Image` del navegador, inexistentes en Hermes/RN. Solución: **editar el binario del `.glb` en memoria** (`stripEmbeddedImages`) para eliminar `images`/`textures` antes de parsear, y aplicar la textura manualmente después:

```javascript
const tex = new THREE.Texture();
tex.image = asset;           // el objeto Asset completo de expo-asset
tex.flipY = false;            // convención UV de glTF (origen arriba-izquierda)
tex.colorSpace = THREE.SRGBColorSpace;
tex.needsUpdate = true;
```

Esto también resolvió una carga extremadamente lenta (~1 minuto): no era el tamaño de la textura, sino el intento fallido y lento de `GLTFLoader` por decodificar la textura embebida original.

### Múltiples materiales por mesh
Se recorre `gltf.scene` con `traverse`, soportando tanto un material único como un arreglo de materiales.

### Rotación y zoom táctil fluidos
- `PanResponder` no detectaba el gesto de forma confiable (competencia con el `GLView` nativo).
- `react-native-reanimated` v4 requiere el paquete separado `react-native-worklets` (causa real de un crash de `TurboModule` que se diagnosticó mal al principio).
- El `GestureDetector` se coloca en una **capa transparente superpuesta** (`StyleSheet.absoluteFill`) como hermano del `Canvas`, no como su padre — evita que el toque compita con el `GLView`.
- Rotación horizontal (eje Y) libre + rotación vertical (eje X) limitada a ±45° + zoom por pellizco (0.5x–3x), todo vía `Gesture.Simultaneous` + `useSharedValue` + `useFrame`.

### Selección de modelo local y de fuentes externas
- `expo-document-picker` permite elegir `.glb`/`.gltf` propios; la app no tiene acceso directo al sistema de archivos, así que recibe una URI temporal.
- `useCleanGLTF`/`useLocalTexture` se generalizaron para aceptar tanto `require()` (assets empaquetados) como URIs remotas/locales en texto — el mismo visor sirve para el modelo de prueba, modelos del teléfono, modelos del catálogo (Cloudinary) y modelos de Poly Pizza.

### Formulario de edición: Modal en vez de overlay absoluto
El formulario de editar (nombre/categoría/descripción) inicialmente vivía en una capa `position: absolute` superpuesta al visor — esto causaba que, al abrir el teclado, no se pudiera hacer scroll porque la capa de gestos del `Canvas` seguía interceptando el toque. Se resolvió moviendo el formulario a un **`Modal` nativo** (capa completamente aislada del sistema operativo), con `KeyboardAvoidingView` + `ScrollView` dentro.

### Warnings de consola conocidos (inofensivos, confirmados)
- `THREE contains an invalid package.json configuration... Falling back to file-based resolution` — Metro no interpreta perfectamente el campo `exports` de `three`, resuelve por ruta física igual.
- `THREE.WARNING: Multiple instances of Three.js being imported` — disparado preventivamente por Three.js; confirmado con `npm ls three` que es la misma copia física en el flujo real de uso.

---

## 5. Firestore — esquema y seguridad

### Colección `models`

```javascript
{
  id: "auto-generado por Firestore",
  name: "Aldeana",
  description: "Personaje de aldea, estilo low-poly",
  category: "personajes",

  modelUrl: "https://.../aldeana_appExpo.glb",
  modelType: "glb",                     // "glb" | "gltf" | "stl" (Thingiverse a futuro)
  thumbnailUrl: "https://.../aldeana_thumb.png",

  initialScale: 1,
  initialPosition: { x: 0, y: 0, z: 0 },

  source: "local",                      // "local" | "polypizza" | "thingiverse"
  externalId: null,
  attribution: null,

  ownerId: "uid-del-usuario-de-firebase-auth",
  createdAt: "<Firestore Timestamp>",
  updatedAt: "<Firestore Timestamp>",
}
```

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /models/{modelId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
                    && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if request.auth != null
                    && resource.data.ownerId == request.auth.uid;
    }
  }
}
```

La comprobación de `ownerId` en la app (para mostrar/ocultar botones de editar/eliminar) es solo de UX — la seguridad real la garantizan estas reglas del lado del servidor.

### `services/models.js` — CRUD completo
`createModel`, `getAllModels`, `getModelById`, `getModelsByOwner`, `updateModel`, `deleteModel`.

---

## 6. Integración con Poly Pizza

API real confirmada (beta, sin documentación pública estable al momento de integrarla — se obtuvo el formato real mediante una petición `curl` de prueba del propio usuario):

```
GET https://api.poly.pizza/v1/search/{query}?limit=N
Header: X-Auth-Token: <api_key>
```

Respuesta normalizada a los campos internos de la app (`externalId`, `name`, `thumbnailUrl`, `modelUrl`, `category`, `licence`, `attribution`, `creatorUsername`, `triCount`).

Al guardar un modelo de Poly Pizza en el catálogo, **no se sube ningún archivo propio** — se crea directamente el documento en Firestore apuntando a las URLs ya alojadas por Poly Pizza, con `source: "polypizza"` y `attribution` conservado para dar crédito al autor original.

---

## 7. Estado actual del proyecto

### Completado
- [x] Registro e inicio de sesión (HU-01, HU-02) — Firebase Authentication
- [x] Visualización de modelo 3D (HU-04)
- [x] Rotación táctil horizontal libre + vertical limitada a ±45° (HU-05)
- [x] Zoom táctil por pellizco (HU-06)
- [x] Esquema de Firestore + Security Rules
- [x] Selección de modelo `.glb` propio desde el teléfono
- [x] Guardado de modelos (Firestore + Cloudinary): crear
- [x] Catálogo de modelos 3D con miniaturas (HU-03)
- [x] Editar y eliminar modelos guardados (CRUD completo)
- [x] Integración con Poly Pizza API (buscar + guardar sin re-subir)

### Pendiente
- [ ] Preparar estructura para integración futura con Thingiverse (`.stl`) — el esquema ya lo contempla (`modelType`, `source`), falta implementar el visor condicional glb/stl y el cliente de esa API

### Limitaciones conocidas, no resueltas por decisión de alcance/tiempo
- Los modelos elegidos desde el teléfono o traídos de fuentes externas pueden no mostrar textura si el `.glb` no trae una textura extraíble de forma sencilla (la solución de textura manual que funciona para el modelo de prueba depende de tener el archivo de imagen por separado).
- No hay verificación de correo electrónico en el registro (cualquier correo con formato válido es aceptado, aunque no exista).
- No se probó el comportamiento de las Security Rules con una segunda cuenta real (aunque las reglas están correctamente configuradas y son la garantía real de seguridad, independientemente de la UI).

---

## 8. Notas para una futura continuación

- El visor recibe el modelo por parámetros de navegación (`modelUri`, `fileName`, `fromCatalog`, `fromPolyPizza`, `polyPizzaData`, `modelId`, `ownerId`, etc.) — cualquier nueva fuente de modelos solo necesita alimentar estos mismos parámetros para funcionar sin tocar el visor.
- `stripEmbeddedImages` asume un `.glb` sin compresión Draco ni extensiones adicionales; si se integran modelos con geometría comprimida, esta función necesitaría revisión.
- Los límites de escala (0.5x–3x) e inclinación (±45°) son arbitrarios, ajustables según el tamaño real de los modelos que predominen en el catálogo.
