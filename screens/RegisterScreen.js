// screens/RegisterScreen.js
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { authStyles as styles, COLORS } from '../theme';
import {
  validarCorreo,
  validarPassword,
  validarConfirmPassword,
  validarNombre,
} from '../validation';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');

    // Validaciones de cliente, en orden: nombre -> correo -> contraseña -> confirmar contraseña
    const errorNombre = validarNombre(nombre);
    if (errorNombre) {
      setError(errorNombre);
      return;
    }

    const errorCorreo = validarCorreo(email);
    if (errorCorreo) {
      setError(errorCorreo);
      return;
    }

    const errorPassword = validarPassword(password);
    if (errorPassword) {
      setError(errorPassword);
      return;
    }

    const errorConfirm = validarConfirmPassword(password, confirmPassword);
    if (errorConfirm) {
      setError(errorConfirm);
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (nombre) {
        await updateProfile(userCredential.user, { displayName: nombre });
      }

      // Firebase deja al usuario autenticado automáticamente tras crear la cuenta.
      // Como queremos que confirme su login manualmente, cerramos la sesión
      // y dejamos que onAuthStateChanged regrese al AuthStack (pantalla Login).
      await signOut(auth);

      Alert.alert(
        'Cuenta creada',
        'Tu cuenta se registró correctamente. Ahora inicia sesión.'
      );
    } catch (e) {
      setError(traducirErrorFirebase(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
      {/* Logo / nombre de la app */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>dv3D</Text>
        <Text style={styles.subtitle}>Crea tu cuenta</Text>
      </View>

      {/* Formulario */}
      <View style={styles.form}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Tu nombre"
          placeholderTextColor={COLORS.placeholder}
          style={styles.input}
        />

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="correo@ejemplo.com"
          placeholderTextColor={COLORS.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={styles.input}
        />

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={COLORS.placeholder}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleText}>
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={!showPassword}
          style={styles.input}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.secondaryLink}
        >
          <Text style={styles.secondaryLinkText}>
            ¿Ya tienes cuenta?{' '}
            <Text style={styles.secondaryLinkTextBold}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function traducirErrorFirebase(code) {
  const errores = {
    'auth/email-already-in-use': 'Ese correo ya está registrado.',
    'auth/invalid-email': 'Correo electrónico no válido.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  };
  return errores[code] || 'Ocurrió un error. Inténtalo de nuevo.';
}