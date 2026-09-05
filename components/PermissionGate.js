import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {colors, spacing, radius, typography} from '../utils/theme';

/**
 * Shown when we don't yet hold a folder grant. Explains the flow, then opens
 * the system folder picker via onGrant.
 */
export default function PermissionGate({onGrant, checking}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>📁</Text>
      </View>

      <Text style={styles.title}>Allow access to statuses</Text>

      <Text style={styles.body}>
        To show statuses, this app needs one-time access to WhatsApp's{' '}
        <Text style={styles.bold}>.Statuses</Text> folder.
      </Text>

      <View style={styles.steps}>
        <Step n="1" text="Open WhatsApp and view a few statuses first." />
        <Step n="2" text="Tap the button below to open the folder picker." />
        <Step
          n="3"
          text="Navigate to Android → media → com.whatsapp → WhatsApp → Media → .Statuses, then tap “Use this folder”."
        />
      </View>

      <TouchableOpacity
        style={[styles.button, checking && styles.buttonDisabled]}
        onPress={onGrant}
        disabled={checking}
        activeOpacity={0.85}>
        <Text style={styles.buttonText}>
          {checking ? 'Checking…' : 'Grant folder access'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Your files never leave your phone. Statuses disappear after 24 hours —
        save the ones you want to keep.
      </Text>
    </ScrollView>
  );
}

function Step({n, text}) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
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
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    elevation: 2,
  },
  iconText: {fontSize: 40},
  title: {...typography.title, marginBottom: spacing.sm, textAlign: 'center'},
  body: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  bold: {fontWeight: '700'},
  steps: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  step: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md},
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepNumText: {color: colors.white, fontWeight: '700', fontSize: 13},
  stepText: {flex: 1, ...typography.body, lineHeight: 20},
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
  note: {...typography.muted, textAlign: 'center', lineHeight: 18},
});
