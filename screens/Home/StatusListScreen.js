import React from 'react';
import {View, StyleSheet} from 'react-native';
import StatusGrid from '../../components/StatusGrid';
import {useStatusFiles} from '../../hooks/useStatusFiles';
import {useDownload} from '../../hooks/useDownload';
import {colors} from '../../utils/theme';

/**
 * Shared implementation for the Images and Videos tabs.
 * `kind` is 'images' | 'videos' — selects which slice of useStatusFiles to show.
 */
export default function StatusListScreen({navigation, kind}) {
  const {images, videos, loading, refresh} = useStatusFiles();
  const {save, savingUri} = useDownload();

  const items = kind === 'videos' ? videos : images;

  const emptyProps =
    kind === 'videos'
      ? {
          emoji: '🎬',
          title: 'No video statuses',
          message:
            'View some video statuses in WhatsApp, then pull down to refresh.',
        }
      : {
          emoji: '🖼️',
          title: 'No image statuses',
          message:
            'View some photo statuses in WhatsApp, then pull down to refresh.',
        };

  const openPreview = item => {
    navigation.navigate('Preview', {item});
  };

  return (
    <View style={styles.container}>
      <StatusGrid
        items={items}
        loading={loading}
        onRefresh={refresh}
        onPressItem={openPreview}
        onSaveItem={save}
        savingUri={savingUri}
        emptyProps={emptyProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},
});
