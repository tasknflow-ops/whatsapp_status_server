import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing, radius, typography, shadow} from '../utils/theme';

/**
 * Premium onboarding / permission screen.
 * Gradient hero at the top, a soft instruction card below, and a
 * gradient call-to-action. Feels like a first-class first-run experience.
 */
export default function PermissionGate({onGrant, checking}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.hero, {paddingTop: insets.top + spacing.xxl}]}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>📲</Text>
        </View>
        <Text style={styles.heroTitle}>Status Saver</Text>
        <Text style={styles.heroSub}>
          Save photos & videos from WhatsApp statuses — beautifully, privately.
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          {paddingBottom: insets.bottom + spacing.xl},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Grant folder access</Text>
          <Text style={styles.cardBody}>
            Tap <Text style={styles.bold}>Allow Access</Text>, choose the{' '}
            <Text style={styles.bold}>.Statuses</Text> folder, then tap{' '}
            <Text style={styles.bold}>“Use this folder”</Text>.
          </Text>

          <View style={styles.pathHint}>
            <Text style={styles.pathLabel}>FOLDER PATH</Text>
            <Text style={styles.pathText}>
              Android › media › com.whatsapp › WhatsApp › Media ›{' '}
              <Text style={styles.pathHighlight}>.Statuses</Text>
            </Text>
          </View>

          <View style={styles.trustRow}>
            <View style={styles.trustChip}>
              <Text style={styles.trustText}>🔒 Private</Text>
            </View>
            <View style={styles.trustChip}>
              <Text style={styles.trustText}>✨ One-time setup</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={onGrant}
          disabled={checking}
          activeOpacity={0.88}
          style={[styles.ctaShadow, checking && styles.disabled]}>
          <LinearGradient
            colors={[colors.accent, colors.accentDark]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.cta}>
            <Text style={styles.ctaText}>
              {checking ? 'Checking…' : '🔓  Allow Access'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.note}>
          Your files never leave your phone.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.bg},
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl + spacing.md,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconText: {fontSize: 40},
  heroTitle: {
    ...typography.display,
    color: colors.white,
    fontSize: 26,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 21,
    maxWidth: 300,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadow.card,
  },
  cardTitle: {...typography.subtitle, fontSize: 17, marginBottom: spacing.sm},
  cardBody: {
    ...typography.body,
    lineHeight: 22,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  bold: {fontWeight: '800', color: colors.text},
  pathHint: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  pathLabel: {...typography.label, fontSize: 10, marginBottom: 4},
  pathText: {...typography.muted, lineHeight: 20},
  pathHighlight: {color: colors.primary, fontWeight: '800'},
  trustRow: {flexDirection: 'row', marginTop: spacing.lg, gap: spacing.sm},
  trustChip: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  trustText: {color: colors.accentDark, fontWeight: '700', fontSize: 12},
  ctaShadow: {...shadow.floating, borderRadius: radius.pill, marginTop: spacing.xl},
  cta: {
    paddingVertical: 17,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  disabled: {opacity: 0.6},
  ctaText: {color: colors.white, fontWeight: '800', fontSize: 16, letterSpacing: 0.3},
  note: {
    ...typography.muted,
    textAlign: 'center',
    marginTop: spacing.lg,
    color: colors.textFaint,
  },
});
