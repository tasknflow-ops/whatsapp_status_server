import React from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing, typography} from '../utils/theme';

/**
 * Rich gradient top bar shared across the main tabs.
 * Gives the app a premium branded feel instead of a flat colored bar.
 *
 * `title`    — big screen title
 * `subtitle` — small supporting line under the title
 * `right`    — optional element rendered on the right (e.g. a count chip)
 */
export default function GradientHeader({title, subtitle, right}) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={colors.gradient}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[styles.wrap, {paddingTop: insets.top + spacing.md}]}>
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    ...Platform.select({
      android: {elevation: 8},
      ios: {
        shadowColor: colors.primaryDark,
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.3,
        shadowRadius: 14,
      },
    }),
  },
  row: {flexDirection: 'row', alignItems: 'center'},
  textCol: {flex: 1},
  title: {
    ...typography.display,
    color: colors.onPrimary,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.82)',
    marginTop: 2,
  },
  right: {marginLeft: spacing.md},
});
