// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXpFC7iTyLM-obFcsakvVsYeVo98_Ldt0",
  authDomain: "fir-dv3d.firebaseapp.com",
  projectId: "fir-dv3d",
  storageBucket: "fir-dv3d.firebasestorage.app",
  messagingSenderId: "743176141343",
  appId: "1:743176141343:web:b231f9715e54cb8ab0f32a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});