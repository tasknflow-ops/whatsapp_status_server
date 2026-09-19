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
import {LinearGradient} from 'expo-linear-gradient';
import EmptyState from '../../components/EmptyState';
import GradientHeader from '../../components/GradientHeader';
import CountChip from '../../components/CountChip';
import {colors, spacing, radius, shadow} from '../../utils/theme';
import {SAVED_FOLDER_NAME, MEDIA_TYPE} from '../../utils/constants';
import {useRewardedAd} from '../../hooks/useRewardedAd';

const GAP = spacing.md;
const OUTER = spacing.lg;
const size = (Dimensions.get('window').width - OUTER * 2 - GAP) / 2;

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
      showAd(() => {
        navigation.navigate('Preview', {item});
      });
    },
    [navigation, showAd],
  );

  const header = (
    <GradientHeader
      title="Saved"
      subtitle="Your collection, kept forever"
      right={items.length > 0 ? <CountChip count={items.length} label="saved" /> : null}
    />
  );

  if (loaded && items.length === 0) {
    return (
      <View style={styles.container}>
        {header}
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
      {header}
      <FlatList
        data={items}
        keyExtractor={(it, i) => (it?.uri || '') + i}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => {
          const isVideo = item.mediaType === MEDIA_TYPE.VIDEO;
          return (
            <TouchableOpacity
              style={styles.cell}
              activeOpacity={0.9}
              onPress={() => openPreview(item)}>
              <Image source={{uri: item.uri}} style={styles.thumb} resizeMode="cover" />
              {isVideo && (
                <>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.4)']}
                    style={styles.scrim}
                    pointerEvents="none"
                  />
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>▶</Text>
                  </View>
                </>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: {justifyContent: 'space-between'},
  cell: {
    width: size,
    height: size * 1.18,
    marginBottom: GAP,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.thumbBg,
    ...shadow.card,
  },
  thumb: {width: '100%', height: '100%'},
  scrim: {position: 'absolute', left: 0, right: 0, bottom: 0, height: 70},
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
    fontSize: 24,
    marginLeft: 3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 6,
  },
});
