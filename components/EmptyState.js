import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {colors, spacing, radius, typography, shadow} from '../utils/theme';

export default function EmptyState({
  emoji = '🕓',
  title = 'No statuses found',
  message = 'Open WhatsApp, view some statuses, then pull down to refresh.',
  onRefresh,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconOuter}>
        <View style={styles.iconInner}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onRefresh ? (
        <TouchableOpacity onPress={onRefresh} activeOpacity={0.88} style={styles.btnShadow}>
          <LinearGradient
            colors={colors.gradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.button}>
            <Text style={styles.buttonText}>↻  Refresh</Text>
          </LinearGradient>
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
  iconOuter: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  emoji: {fontSize: 42},
  title: {...typography.title, marginBottom: spacing.sm, textAlign: 'center'},
  message: {
    ...typography.muted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  btnShadow: {...shadow.floating, borderRadius: radius.pill},
  button: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: 14,
    borderRadius: radius.pill,
  },
  buttonText: {color: colors.white, fontWeight: '800', fontSize: 15, letterSpacing: 0.3},
});
