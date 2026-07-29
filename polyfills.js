// polyfills.js
// Hermes (el motor JS de React Native/Expo) no incluye ciertas APIs de
// navegador que Three.js usa internamente para decodificar texturas
// embebidas dentro de archivos .glb. Este archivo agrega esos shims.
import 'fast-text-encoding'; // TextEncoder / TextDecoder
import { decode, encode } from 'base-64';

if (typeof global.atob === 'undefined') {
  global.atob = decode;
}
if (typeof global.btoa === 'undefined') {
  global.btoa = encode;
}