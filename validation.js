// validation.js

// Regex simple para formato de correo: algo@algo.algo
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida el correo electrónico.
 * Retorna un mensaje de error (string) o null si es válido.
 */
export function validarCorreo(email) {
  if (!email || email.trim() === '') {
    return 'El correo es obligatorio';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Ingresa un correo válido';
  }
  return null;
}

/**
 * Valida la contraseña (uso general: login y registro).
 * Retorna un mensaje de error (string) o null si es válida.
 */
export function validarPassword(password) {
  if (!password || password === '') {
    return 'La contraseña es obligatoria';
  }
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  return null;
}

/**
 * Valida que la confirmación de contraseña coincida (solo registro).
 * Retorna un mensaje de error (string) o null si coincide.
 */
export function validarConfirmPassword(password, confirmPassword) {
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden';
  }
  return null;
}

/**
 * Valida el nombre (solo registro).
 * Retorna un mensaje de error (string) o null si es válido.
 */
export function validarNombre(nombre) {
  if (!nombre || nombre.trim() === '') {
    return 'Ingresa tu nombre completo';
  }
  if (nombre.trim().length < 2) {
    return 'Ingresa tu nombre completo';
  }
  return null;
}