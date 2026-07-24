// theme.js
import { StyleSheet } from 'react-native';

// Paleta de colores de dv3D
export const COLORS = {
  primary: '#20DBC3',
  secondary: '#12455A',
  contrast: '#E4FAF5',
  accent: '#FB0061',
  white: '#FFFFFF',
  placeholder: '#8FA6AC',
};

// Estilos reutilizables para pantallas de autenticación (Login/Register)
export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.contrast,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.secondary,
    opacity: 0.7,
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.secondary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingRight: 6,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.secondary,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toggleText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  errorText: {
    color: COLORS.accent,
    marginTop: 10,
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  secondaryLinkText: {
    color: COLORS.secondary,
    fontSize: 14,
  },
  secondaryLinkTextBold: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
});