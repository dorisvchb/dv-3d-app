// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Agregamos .glb y .gltf como extensiones de "asset" (archivos binarios
// que Metro debe empaquetar tal cual, igual que hace con imágenes).
config.resolver.assetExts.push('glb', 'gltf');

module.exports = config;
