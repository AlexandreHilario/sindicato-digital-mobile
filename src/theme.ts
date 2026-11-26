import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

/**
 * Identidade visual do SíndicoDigital.
 * Use sempre estas cores em vez de valores soltos nas telas.
 */
export const palette = {
  primary: '#17324d', // azul-marinho da marca
  primaryDark: '#0f2236',
  primarySoft: '#e3ebf4', // fundos de ícones e destaques
  accent: '#2f80c3', // detalhes e links
  background: '#f4f6f9',
  surface: '#ffffff',
  text: '#17324d',
  textMuted: '#5b6b7c',
  textOnPrimary: '#ffffff',
  textOnPrimaryMuted: '#b9c8d8',
  border: '#dfe5ec',
  danger: '#b3261e',
  dangerSoft: '#fbe9e7',
  warning: '#8a5a00',
  warningSoft: '#fff4e0',
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/**
 * Tema fixo claro do React Native Paper. Sem passar um tema, o PaperProvider
 * segue o modo escuro do sistema e os campos ficam escuros sobre telas claras.
 * `background` precisa ser igual ao fundo das telas: é a cor usada atrás do
 * rótulo flutuante dos campos "outlined".
 */
export const theme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.primary,
    onPrimary: palette.textOnPrimary,
    primaryContainer: palette.primarySoft,
    onPrimaryContainer: palette.primary,
    secondary: palette.accent,
    secondaryContainer: palette.primarySoft,
    onSecondaryContainer: palette.primary,
    background: palette.surface,
    surface: palette.surface,
    surfaceVariant: palette.background,
    onSurface: palette.text,
    onSurfaceVariant: palette.textMuted,
    outline: palette.border,
    outlineVariant: palette.border,
    error: palette.danger,
  },
};
