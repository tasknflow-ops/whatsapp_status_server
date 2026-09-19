import React, {useState, useEffect} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import {LinearGradient} from 'expo-linear-gradient';
import {colors, spacing, radius, shadow} from '../utils/theme';
import {MEDIA_TYPE} from '../utils/constants';
import {getCachedFileUri} from '../native/storage';

const GAP = spacing.md;
const COLS = 2;
const OUTER = spacing.lg;
const size = (Dimensions.get('window').width - OUTER * 2 - GAP) / COLS;

/**
 * One premium status thumbnail card.
 *
 * - Rounded, elevated media tile with a soft shadow.
 * - Videos show a paused first frame with a glassy play badge.
 * - A frosted "Save" pill floats at the bottom of the tile.
 */
export default function StatusItem({item, onPress, onSave, saving}) {
  const isVideo = item.mediaType === MEDIA_TYPE.VIDEO;

  const [fileUri, setFileUri] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCachedFileUri(item.uri, item.name).then(uri => {
      if (!cancelled) {
        setFileUri(uri);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [item.uri, item.name]);

  return (
    <View style={styles.cell}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onPress(item)}
        style={styles.tile}>
        {loading ? (
          <View style={styles.placeholder}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : !fileUri ? (
          <View style={styles.placeholder}>
            <Text style={styles.errorIcon}>{isVideo ? '🎬' : '🖼️'}</Text>
          </View>
        ) : isVideo ? (
          <View style={styles.fill}>
            <Video
              source={{uri: fileUri}}
              style={styles.fill}
              paused
              muted
              resizeMode="cover"
              playInBackground={false}
              disableFocus
            />
            <View style={styles.playBadge}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </View>
        ) : (
          <Image source={{uri: fileUri}} style={styles.fill} resizeMode="cover" />
        )}

        {/* Bottom scrim so the save pill always reads clearly */}
        {!loading && fileUri ? (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={styles.scrim}
            pointerEvents="none"
          />
        ) : null}

        {/* Floating frosted Save pill */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => onSave(item)}
          disabled={saving}
          activeOpacity={0.85}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveText}>↓  Save</Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {width: size, marginBottom: GAP},
  tile: {
    width: size,
    height: size * 1.18,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.thumbBg,
    ...shadow.card,
  },
  fill: {width: '100%', height: '100%'},
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.thumbBg,
  },
  errorIcon: {fontSize: 30, opacity: 0.5},
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
  },
  playBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 22,
    color: colors.white,
    marginLeft: 3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 6,
  },
  saveBtn: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: 'rgba(37, 211, 102, 0.94)',
    borderRadius: radius.pill,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  saveText: {color: colors.white, fontWeight: '800', fontSize: 13, letterSpacing: 0.3},
});
