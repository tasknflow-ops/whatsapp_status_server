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
import {colors, spacing, radius} from '../utils/theme';
import {MEDIA_TYPE} from '../utils/constants';
import {getCachedFileUri} from '../native/storage';

const GAP = spacing.sm;
const COLS = 2;
const size = (Dimensions.get('window').width - GAP * (COLS + 1)) / COLS;

/**
 * One status thumbnail card.
 *
 * - Images: reads the file from SAF into the local cache (once) then renders
 *   a normal <Image> with the file:// URI. Shows a spinner while loading.
 * - Videos: shows a dark placeholder with a ▶ play badge (frame extraction
 *   is not supported without native FFmpeg — video previews open on tap).
 *
 * Tapping the thumbnail opens fullscreen preview (onPress).
 * Tapping "Save" downloads to gallery (onSave).
 */
export default function StatusItem({item, onPress, onSave, saving}) {
  const isVideo = item.mediaType === MEDIA_TYPE.VIDEO;

  // file:// URI resolved from SAF content:// URI (images only)
  const [thumbUri, setThumbUri] = useState(null);
  const [thumbLoading, setThumbLoading] = useState(!isVideo);

  useEffect(() => {
    if (isVideo) return; // Videos use a static placeholder
    let cancelled = false;

    getCachedFileUri(item.uri, item.name).then(uri => {
      if (!cancelled) {
        setThumbUri(uri);
        setThumbLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [item.uri, item.name, isVideo]);

  return (
    <View style={styles.cell}>
      {/* Thumbnail / placeholder */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(item)}
        style={styles.thumbWrap}>
        {isVideo ? (
          /* Video: dark tile + centred play icon */
          <View style={styles.videoPlaceholder}>
            <View style={styles.playBadge}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </View>
        ) : thumbLoading ? (
          /* Image loading */
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : thumbUri ? (
          /* Image ready */
          <Image
            source={{uri: thumbUri}}
            style={styles.thumb}
            resizeMode="cover"
          />
        ) : (
          /* Fallback if caching failed */
          <View style={styles.loadingBox}>
            <Text style={styles.errorIcon}>🖼️</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Save button */}
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorIcon: {fontSize: 28},
  videoPlaceholder: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  playIcon: {color: colors.white, fontSize: 18, marginLeft: 3},
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
