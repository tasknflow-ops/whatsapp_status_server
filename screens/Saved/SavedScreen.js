import React, {useCallback, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import EmptyState from '../../components/EmptyState';
import {colors, spacing, radius} from '../../utils/theme';
import {SAVED_FOLDER_NAME, MEDIA_TYPE} from '../../utils/constants';
import {useRewardedAd} from '../../hooks/useRewardedAd';

const GAP = spacing.sm;
const size = (Dimensions.get('window').width - GAP * 3) / 2;

async function checkOrRequestGalleryPermission() {
  if (Platform.OS !== 'android') return true;
  try {
    if (Platform.Version >= 33) {
      const checkImages = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      );
      if (checkImages) return true;
      const res = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ]);
      return (
        res[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
          PermissionsAndroid.RESULTS.GRANTED ||
        res[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const checkStorage = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      if (checkStorage) return true;
      const res = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      return res === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (_e) {
    return false;
  }
}

/**
 * Lists media already saved by this app in the SAVED_FOLDER_NAME album.
 * Refreshes each time the tab gains focus.
 *
 * Tapping any item displays a RewardedAd and opens fullscreen preview.
 */
export default function SavedScreen({navigation}) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const {showAd} = useRewardedAd();

  const load = useCallback(async () => {
    try {
      await checkOrRequestGalleryPermission();
      const res = await CameraRoll.getPhotos({
        first: 200,
        assetType: 'All',
        groupName: SAVED_FOLDER_NAME,
      });
      const edges = res?.edges || [];
      const mapped = edges
        .filter(e => e?.node?.image?.uri)
        .map(e => {
          const isVideo = e.node?.type && e.node.type.startsWith('video');
          const uri = e.node.image.uri;
          const name = uri.split('/').pop() || 'status_file';
          return {
            uri,
            name,
            mediaType: isVideo ? MEDIA_TYPE.VIDEO : MEDIA_TYPE.IMAGE,
            isGalleryUri: true,
          };
        });
      setItems(mapped);
    } catch (_e) {
      // Album may not exist yet or permission denied — treat as empty gracefully.
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
      // Show rewarded ad, then open preview once reward is earned / ad closes
      showAd(() => {
        navigation.navigate('Preview', {item});
      });
    },
    [navigation, showAd],
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
        keyExtractor={(it, i) => (it?.uri || '') + i}
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
