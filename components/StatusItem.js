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
import {colors, spacing, radius} from '../utils/theme';
import {MEDIA_TYPE} from '../utils/constants';
import {getCachedFileUri} from '../native/storage';

const GAP = spacing.sm;
const COLS = 2;
const size = (Dimensions.get('window').width - GAP * (COLS + 1)) / COLS;

/**
 * One status thumbnail card.
 *
 * - Images: resolved to file:// via getCachedFileUri, rendered with <Image>.
 * - Videos: resolved to file:// via getCachedFileUri, rendered with a paused
 *   <Video> to show the first frame as a thumbnail.
 *
 * Tapping the thumbnail opens fullscreen preview (onPress).
 * Tapping "Save" downloads to gallery (onSave).
 */
export default function StatusItem({item, onPress, onSave, saving}) {
  const isVideo = item.mediaType === MEDIA_TYPE.VIDEO;

  // Cached file:// URI for both images and videos
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
      {/* ── Thumbnail ── */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(item)}
        style={styles.thumbWrap}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : !fileUri ? (
          <View style={styles.loadingBox}>
            <Text style={styles.errorIcon}>{isVideo ? '🎬' : '🖼️'}</Text>
          </View>
        ) : isVideo ? (
          /* Paused video shows first frame as thumbnail */
          <View style={styles.thumbWrap}>
            <Video
              source={{uri: fileUri}}
              style={styles.thumb}
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
          <Image
            source={{uri: fileUri}}
            style={styles.thumb}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>

      {/* ── Save button ── */}
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
    backgroundColor: '#1a1a1a',
  },
  thumb: {width: '100%', height: '100%'},
  loadingBox: {
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorIcon: {fontSize: 28},
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
    fontSize: 28,
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
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
