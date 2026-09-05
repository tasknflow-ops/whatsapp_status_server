import React, {useState, useEffect} from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import {useDownload} from '../../hooks/useDownload';
import {colors, spacing, radius} from '../../utils/theme';
import {MEDIA_TYPE} from '../../utils/constants';
import {getCachedFileUri} from '../../native/storage';

const {width, height} = Dimensions.get('window');

/**
 * Fullscreen preview screen.
 *
 * SAF content:// URIs can't be used directly by <Image> or <Video>, so we
 * first copy the file to the app's local cache (getCachedFileUri) which
 * returns a file:// path that both components understand.
 *
 * - Shows a spinner while the file is being prepared.
 * - Images: rendered with <Image> (pinch-to-zoom coming soon).
 * - Videos: rendered with react-native-video (autoplay, loop, native controls).
 * - "Save to gallery" is available before OR after viewing.
 */
export default function PreviewScreen({route, navigation}) {
  const {item} = route.params;
  const {save, savingUri} = useDownload();
  const isVideo = item.mediaType === MEDIA_TYPE.VIDEO;
  const saving = savingUri === item.uri;

  // Resolved file:// URI (null while loading)
  const [fileUri, setFileUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCachedFileUri(item.uri, item.name).then(uri => {
      if (cancelled) return;
      if (uri) {
        setFileUri(uri);
      } else {
        setError(true);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [item.uri, item.name]);

  return (
    <View style={styles.container}>
      {/* ── Media area ── */}
      <View style={styles.media}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={styles.loadingText}>
              {isVideo ? 'Preparing video…' : 'Loading image…'}
            </Text>
          </View>
        ) : error || !fileUri ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>⚠️ Could not load media</Text>
          </View>
        ) : isVideo ? (
          <Video
            source={{uri: fileUri}}
            style={styles.video}
            controls
            repeat
            resizeMode="contain"
            paused={false}
          />
        ) : (
          <Image
            source={{uri: fileUri}}
            style={styles.image}
            resizeMode="contain"
          />
        )}
      </View>

      {/* ── Close button (top-right) ── */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => navigation.goBack()}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* ── Save to gallery (bottom-center) ── */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={() => save(item)}
        disabled={saving}
        activeOpacity={0.85}>
        {saving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.saveText}>⬇ Save to gallery</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  media: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  image: {width, height: height * 0.85},
  video: {width, height: height * 0.85},
  center: {alignItems: 'center', gap: 12},
  loadingText: {color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 8},
  errorText: {color: colors.white, fontSize: 16},
  closeBtn: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  closeText: {color: colors.white, fontSize: 18, fontWeight: '700'},
  saveBtn: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  saveText: {color: colors.white, fontWeight: '700', fontSize: 15},
});
