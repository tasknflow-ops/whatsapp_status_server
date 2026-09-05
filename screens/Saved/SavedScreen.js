import React, {useCallback, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import EmptyState from '../../components/EmptyState';
import {colors, spacing, radius} from '../../utils/theme';
import {SAVED_FOLDER_NAME, MEDIA_TYPE} from '../../utils/constants';

const GAP = spacing.sm;
const size = (Dimensions.get('window').width - GAP * 3) / 2;

/**
 * Lists media already saved by this app.
 * Reads the CameraRoll album named SAVED_FOLDER_NAME.
 * Refreshes each time the tab gains focus.
 * Tapping any item opens fullscreen preview via the shared PreviewScreen.
 *
 * CameraRoll URIs (content://media/... or file://) are readable directly by
 * <Image> and react-native-video without SAF, so PreviewScreen uses them as-is.
 */
export default function SavedScreen({navigation}) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await CameraRoll.getPhotos({
        first: 200,
        assetType: 'All',
        groupTypes: 'Album',
        groupName: SAVED_FOLDER_NAME,
      });
      const mapped = res.edges.map(e => {
        const isVideo = e.node.type && e.node.type.startsWith('video');
        // Derive a filename from the URI for display / cache keying
        const uri = e.node.image.uri;
        const name = uri.split('/').pop() || 'status_file';
        return {
          uri,
          name,
          mediaType: isVideo ? MEDIA_TYPE.VIDEO : MEDIA_TYPE.IMAGE,
          // Flag so PreviewScreen knows this is a gallery URI, not SAF
          isGalleryUri: true,
        };
      });
      setItems(mapped);
    } catch (_e) {
      // Album may not exist yet (nothing saved) — treat as empty.
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openPreview = useCallback(
    item => {
      navigation.navigate('Preview', {item});
    },
    [navigation],
  );

  if (loaded && items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          emoji="💾"
          title="Nothing saved yet"
          message="Statuses you save will appear here and stay after 24 hours."
          onRefresh={load}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it, i) => it.uri + i}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        renderItem={({item}) => {
          const isVideo = item.mediaType === MEDIA_TYPE.VIDEO;
          return (
            <TouchableOpacity
              style={styles.cell}
              activeOpacity={0.85}
              onPress={() => openPreview(item)}>
              {/* CameraRoll URIs are directly usable in <Image> */}
              <Image
                source={{uri: item.uri}}
                style={styles.thumb}
                resizeMode="cover"
              />
              {isVideo && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>▶</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},
  content: {padding: spacing.sm},
  row: {justifyContent: 'space-between'},
  cell: {
    width: size,
    height: size,
    marginBottom: GAP,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  thumb: {width: '100%', height: '100%'},
  badge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 28,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
});
