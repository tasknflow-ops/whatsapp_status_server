import React, {useCallback, useState} from 'react';
import {View, StyleSheet, FlatList, Image, Text, Dimensions} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import EmptyState from '../../components/EmptyState';
import {colors, spacing, radius} from '../../utils/theme';
import {SAVED_FOLDER_NAME} from '../../utils/constants';

const GAP = spacing.sm;
const size = (Dimensions.get('window').width - GAP * 3) / 2;

/**
 * Lists media already saved by this app. Reads the CameraRoll album named
 * SAVED_FOLDER_NAME. Refreshes each time the tab gains focus.
 *
 * NOTE: CameraRoll.getPhotos options/shape should be re-checked against the
 * installed @react-native-camera-roll/camera-roll version.
 */
export default function SavedScreen() {
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
      const mapped = res.edges.map(e => ({
        uri: e.node.image.uri,
        type: e.node.type,
      }));
      setItems(mapped);
    } catch (e) {
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
        renderItem={({item}) => (
          <View style={styles.cell}>
            <Image source={{uri: item.uri}} style={styles.thumb} resizeMode="cover" />
            {item.type && item.type.startsWith('video') ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>▶</Text>
              </View>
            ) : null}
          </View>
        )}
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
    top: '50%',
    left: '50%',
    marginTop: -18,
    marginLeft: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {color: colors.white, fontSize: 14},
});
