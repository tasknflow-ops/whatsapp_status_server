// Central theme. WhatsApp-familiar green palette so the app feels native to
// the context it's used in.

export const colors = {
  primary: '#075E54', // WhatsApp dark teal (headers, tab bar active)
  primaryDark: '#054d44',
  accent: '#25D366', // WhatsApp bright green (buttons, highlights)
  accentDark: '#1da851',
  bg: '#ECE5DD', // WhatsApp chat background beige
  surface: '#FFFFFF',
  text: '#111B21',
  textMuted: '#667781',
  border: '#E1E4E6',
  danger: '#E53935',
  overlay: 'rgba(0,0,0,0.55)',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

export const typography = {
  title: {fontSize: 20, fontWeight: '700', color: colors.text},
  subtitle: {fontSize: 15, fontWeight: '600', color: colors.text},
  body: {fontSize: 14, color: colors.text},
  muted: {fontSize: 13, color: colors.textMuted},
};