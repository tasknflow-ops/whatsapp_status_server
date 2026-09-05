import React from 'react';
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

const {width, height} = Dimensions.get('window');

/**
 * Fullscreen preview. Route param `item` is a normalised status entry.
 * Images render with <Image>; videos with react-native-video (autoplay, loop).
 */
export default function PreviewScreen({route, navigation}) {
  const {item} = route.params;
  const {save, savingUri} = useDownload();
  const isVideo = item.mediaType === MEDIA_TYPE.VIDEO;
  const saving = savingUri === item.uri;

  return (
    <View style={styles.container}>
      <View style={styles.media}>
        {isVideo ? (
          <Video
            source={{uri: item.uri}}
            style={styles.video}
            controls
            repeat
            resizeMode="contain"
            paused={false}
          />
        ) : (
          <Image source={{uri: item.uri}} style={styles.image} resizeMode="contain" />
        )}
      </View>

      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

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
  image: {width, height: height * 0.8},
  video: {width, height: height * 0.8},
  closeBtn: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  saveText: {color: colors.white, fontWeight: '700', fontSize: 15},
});
