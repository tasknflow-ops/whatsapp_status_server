// Central theme — a premium reinterpretation of WhatsApp's palette.
// Keeps the familiar emerald/teal identity but leans into softer neutrals,
// warmer surfaces, deeper accents and gentle elevation for a rich feel.

export const colors = {
  // Brand
  primary: '#0B7A6E', // refined emerald-teal (headers, active tab)
  primaryDark: '#075E54', // classic WhatsApp teal (status bar, gradient end)
  primaryLight: '#12A594', // brighter teal for gradient start
  accent: '#25D366', // WhatsApp bright green (primary actions)
  accentDark: '#1DA851',
  accentSoft: '#DFF6E7', // pale green wash for chips / subtle fills

  // Neutrals / surfaces
  bg: '#F4F2EE', // soft warm off-white background
  bgAlt: '#ECE7E1',
  surface: '#FFFFFF',
  surfaceMuted: '#FAF9F6',
  thumbBg: '#EDEAE4', // gentle placeholder behind media

  // Text
  text: '#0E1A17',
  textMuted: '#6B7B77',
  textFaint: '#9AA6A2',
  onPrimary: '#FFFFFF',

  // Lines & effects
  border: '#E7E3DC',
  borderSoft: '#F0EDE7',
  danger: '#E5484D',
  overlay: 'rgba(8, 20, 17, 0.62)',
  white: '#FFFFFF',
  black: '#000000',

  // Gradient stops (used with expo-linear-gradient)
  gradient: ['#12A594', '#0B7A6E', '#075E54'],
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
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

// Soft, layered shadows for that premium "lifted" feel.
export const shadow = {
  soft: {
    shadowColor: '#1A2C28',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  card: {
    shadowColor: '#152420',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  floating: {
    shadowColor: '#0B7A6E',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 10,
  },
};

export const typography = {
  display: {fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: 0.2},
  title: {fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: 0.2},
  subtitle: {fontSize: 16, fontWeight: '700', color: colors.text},
  body: {fontSize: 14, fontWeight: '500', color: colors.text},
  muted: {fontSize: 13, fontWeight: '500', color: colors.textMuted},
  label: {fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.6},
};