// screens/ModelViewerScreen.js
import { Suspense, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { Canvas, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { Asset } from 'expo-asset';
import { COLORS } from '../theme';

// El .glb trae texturas embebidas en base64 que GLTFLoader no puede
// decodificar en React Native (falla lento, sin lanzar error visible al
// usuario más que un toast). Como de todas formas vamos a aplicar nuestra
// propia textura manualmente, quitamos esas referencias del JSON interno
// del .glb ANTES de parsearlo, para que GLTFLoader ni siquiera lo intente.
function stripEmbeddedImages(arrayBuffer) {
  const view = new DataView(arrayBuffer);

  // Estructura binaria de un .glb: header (12 bytes) + chunk JSON + chunk BIN
  const jsonChunkLength = view.getUint32(12, true);
  const jsonStart = 20;
  const jsonBytes = new Uint8Array(arrayBuffer, jsonStart, jsonChunkLength);
  const jsonText = new TextDecoder('utf-8').decode(jsonBytes);
  const json = JSON.parse(jsonText);

  // Elimina imágenes y referencias de textura en los materiales
  json.images = [];
  json.textures = [];
  if (json.materials) {
    json.materials.forEach((mat) => {
      if (mat.pbrMetallicRoughness) {
        delete mat.pbrMetallicRoughness.baseColorTexture;
        delete mat.pbrMetallicRoughness.metallicRoughnessTexture;
      }
      delete mat.normalTexture;
      delete mat.occlusionTexture;
      delete mat.emissiveTexture;
    });
  }

  const newJsonText = JSON.stringify(json);
  // El formato GLB exige que el chunk JSON quede alineado a 4 bytes,
  // rellenando con espacios si hace falta
  const padding = (4 - (newJsonText.length % 4)) % 4;
  const paddedJsonText = newJsonText + ' '.repeat(padding);
  const newJsonBytes = new TextEncoder().encode(paddedJsonText);

  // El chunk binario (geometría) se copia tal cual, sin modificar
  const binChunkStart = jsonStart + jsonChunkLength;
  const binChunkDataLength = view.getUint32(binChunkStart, true);
  const binChunkTotalLength = 8 + binChunkDataLength;
  const binChunkBytes = new Uint8Array(arrayBuffer, binChunkStart, binChunkTotalLength);

  const totalLength = 12 + 8 + newJsonBytes.length + binChunkTotalLength;
  const newBuffer = new ArrayBuffer(totalLength);
  const newView = new DataView(newBuffer);

  newView.setUint32(0, 0x46546c67, true); // 'glTF'
  newView.setUint32(4, 2, true); // versión
  newView.setUint32(8, totalLength, true); // longitud total

  newView.setUint32(12, newJsonBytes.length, true);
  newView.setUint32(16, 0x4e4f534a, true); // 'JSON'
  new Uint8Array(newBuffer, 20, newJsonBytes.length).set(newJsonBytes);

  new Uint8Array(newBuffer, 20 + newJsonBytes.length, binChunkTotalLength).set(binChunkBytes);

  return newBuffer;
}

function useLocalTexture(assetModule) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const asset = Asset.fromModule(assetModule);
      await asset.downloadAsync();
      const tex = new THREE.Texture();
      tex.image = asset;
      // Los mapas UV de modelos glTF/.glb usan la convención contraria a la
      // de imágenes web normales — sin este ajuste, las coordenadas UV caen
      // en la posición vertical equivocada de la imagen (por eso las zonas
      // negras: caían en el fondo negro alrededor de las islas UV pintadas).
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      if (isMounted) setTexture(tex);
    })();
    return () => {
      isMounted = false;
    };
  }, [assetModule]);

  return texture;
}

// Carga el .glb manualmente: descarga -> lee como ArrayBuffer -> quita
// texturas embebidas -> parsea con GLTFLoader
function useCleanGLTF(assetModule) {
  const [gltf, setGltf] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const asset = Asset.fromModule(assetModule);
        await asset.downloadAsync();
        const uri = asset.localUri || asset.uri;

        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();

        const cleanBuffer = stripEmbeddedImages(arrayBuffer);

        const loader = new GLTFLoader();
        loader.parse(
          cleanBuffer,
          '',
          (result) => {
            if (isMounted) setGltf(result);
          },
          (err) => {
            console.error('[ModelViewer] Error parseando GLTF:', err);
            if (isMounted) setError(err);
          }
        );
      } catch (e) {
        console.error('[ModelViewer] Error cargando el modelo:', e);
        if (isMounted) setError(e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [assetModule]);

  return { gltf, error };
}

function Model({ gltf, texture, groupRef, rotationY, rotationX, scale }) {
  useEffect(() => {
    if (!texture) return;
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        // Soporta tanto un material único como un arreglo de materiales
        // (algunos meshes tienen varios materiales por sección del modelo)
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          mat.map = texture;
          mat.needsUpdate = true;
        });
      }
    });
  }, [gltf, texture]);

  // Se ejecuta en cada frame del render loop de R3F — lee rotación (Y y X)
  // y escala actualizadas por los gestos directamente desde Reanimated,
  // sin cruzar el puente JS en cada movimiento del dedo
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotationY.value;
      groupRef.current.rotation.x = rotationX.value;
      const s = scale.value;
      groupRef.current.scale.set(s, s, s);
    }
  });

  return <primitive ref={groupRef} object={gltf.scene} />;
}

export default function ModelViewerScreen() {
  const groupRef = useRef(null);
  const rotationY = useSharedValue(0);
  const startRotationY = useSharedValue(0);
  const rotationX = useSharedValue(0);
  const startRotationX = useSharedValue(0);
  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);

  const { gltf, error } = useCleanGLTF(require('../assets/models/aldeana_appExpo.glb'));
  const texture = useLocalTexture(require('../assets/models/aldeana_textura.png'));

  // Límite de inclinación vertical: ±45° (en radianes), para permitir ver
  // el modelo un poco desde arriba/abajo sin llegar a voltearlo por completo
  const MAX_ROTATION_X = Math.PI / 4;

  // Gesto corriendo en el hilo de UI (worklet) — no espera respuesta
  // del hilo de JS en cada movimiento del dedo, evitando el lag anterior
  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onBegin(() => {
      startRotationY.value = rotationY.value;
      startRotationX.value = rotationX.value;
    })
    .onUpdate((event) => {
      rotationY.value = startRotationY.value + event.translationX * 0.01;
      const nextX = startRotationX.value + event.translationY * 0.01;
      rotationX.value = Math.min(Math.max(nextX, -MAX_ROTATION_X), MAX_ROTATION_X);
    });

  // Gesto de pellizco (pinch) para zoom táctil — acerca/aleja el modelo
  // escalando el objeto. Se limita entre 0.5x y 3x para evitar que el
  // modelo desaparezca o se vuelva desproporcionadamente grande.
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      const next = startScale.value * event.scale;
      scale.value = Math.min(Math.max(next, 0.5), 3);
    });

  // Ambos gestos deben poder ocurrir a la vez (rotar mientras se hace zoom)
  const combinedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>No se pudo cargar el modelo.</Text>
      </View>
    );
  }

  if (!gltf) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando modelo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 3, 3]} intensity={1} />
        <Suspense fallback={null}>
          <Model
            gltf={gltf}
            texture={texture}
            groupRef={groupRef}
            rotationY={rotationY}
            rotationX={rotationX}
            scale={scale}
          />
        </Suspense>
      </Canvas>
      {/* Capa transparente encima del Canvas que captura el toque
          directamente, evitando que el GLView del renderer compita por
          el gesto (causa probable de la detección intermitente) */}
      <GestureDetector gesture={combinedGesture}>
        <View style={StyleSheet.absoluteFill} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.contrast,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.contrast,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.secondary,
    fontSize: 14,
  },
});