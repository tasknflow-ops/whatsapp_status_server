import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {colors, spacing, radius} from '../utils/theme';
import {MEDIA_TYPE} from '../utils/constants';

const GAP = spacing.sm;
const COLS = 2;
const size = (Dimensions.get('window').width - GAP * (COLS + 1)) / COLS;

/**
 * One status thumbnail. Tapping the image opens the preview (onPress);
 * tapping the save pill downloads it (onSave). `saving` shows a spinner.
 *
 * For videos we still use the file URI as the Image source — many SAF
 * content URIs return a still frame; if a thumbnail doesn't render we show
 * the video badge over a dark placeholder.
 */
export default function StatusItem({item, onPress, onSave, saving}) {
  const isVideo = item.mediaType === MEDIA_TYPE.VIDEO;

  return (
    <View style={styles.cell}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(item)} style={styles.thumbWrap}>
        <Image source={{uri: item.uri}} style={styles.thumb} resizeMode="cover" />
        {isVideo ? (
          <View style={styles.playBadge}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={() => onSave(item)}
        disabled={saving}
        activeOpacity={0.85}>
        {saving ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.saveText}>⬇ Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {width: size, marginBottom: GAP},
  thumbWrap: {
    width: size,
    height: size,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  thumb: {width: '100%', height: '100%'},
  playBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {color: colors.white, fontSize: 16, marginLeft: 2},
  saveBtn: {
    marginTop: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
  },
  saveText: {color: colors.white, fontWeight: '700', fontSize: 13},
});
