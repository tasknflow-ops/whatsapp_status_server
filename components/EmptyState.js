import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, typography} from '../utils/theme';

export default function EmptyState({
  emoji = '🕓',
  title = 'No statuses found',
  message = 'Open WhatsApp, view some statuses, then pull down to refresh.',
  onRefresh,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRefresh ? (
        <TouchableOpacity style={styles.button} onPress={onRefresh} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emoji: {fontSize: 48, marginBottom: spacing.md},
  title: {...typography.subtitle, marginBottom: spacing.sm, textAlign: 'center'},
  message: {
    ...typography.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  buttonText: {color: colors.white, fontWeight: '700'},
});
