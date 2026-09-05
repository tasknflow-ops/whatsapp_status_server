import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {colors, spacing, radius, typography} from '../utils/theme';

/**
 * Shown when we don't yet hold a folder grant.
 * Tapping the button opens the system folder picker via onGrant.
 * We guide the user with a single sentence so it feels like a normal
 * permission dialog rather than a tutorial.
 */
export default function PermissionGate({onGrant, checking}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Icon */}
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>📲</Text>
      </View>

      <Text style={styles.title}>Access WhatsApp Statuses</Text>

      <Text style={styles.body}>
        Tap <Text style={styles.bold}>Allow Access</Text> below, then select the{' '}
        <Text style={styles.bold}>.Statuses</Text> folder and tap{' '}
        <Text style={styles.bold}>"Use this folder"</Text>.
      </Text>

      {/* Inline path hint */}
      <View style={styles.pathHint}>
        <Text style={styles.pathText}>
          📂 Android → media → com.whatsapp → WhatsApp → Media →{' '}
          <Text style={styles.pathHighlight}>.Statuses</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, checking && styles.buttonDisabled]}
        onPress={onGrant}
        disabled={checking}
        activeOpacity={0.85}>
        <Text style={styles.buttonText}>
          {checking ? 'Checking…' : '🔓 Allow Access'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Done once — we remember your choice. Your files never leave your phone.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    elevation: 3,
  },
  iconText: {fontSize: 44},
  title: {
    ...typography.title,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  bold: {fontWeight: '700'},
  pathHint: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  pathText: {
    ...typography.muted,
    lineHeight: 20,
    textAlign: 'center',
  },
  pathHighlight: {
    color: colors.accent,
    fontWeight: '700',
  },
  button: {
    alignSelf: 'stretch',
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonDisabled: {opacity: 0.6},
  buttonText: {color: colors.white, fontWeight: '700', fontSize: 16},
  note: {
    ...typography.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
