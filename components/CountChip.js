import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, radius} from '../utils/theme';

/** Frosted pill showing an item count inside the gradient header. */
export default function CountChip({count = 0, label = 'items'}) {
  return (
    <View style={styles.chip}>
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  count: {color: colors.white, fontWeight: '800', fontSize: 15},
  label: {color: 'rgba(255,255,255,0.85)', fontWeight: '600', fontSize: 12, marginLeft: 5},
});
