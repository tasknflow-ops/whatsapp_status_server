import React, {useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import StatusGrid from '../../components/StatusGrid';
import GradientHeader from '../../components/GradientHeader';
import CountChip from '../../components/CountChip';
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

  // Auto-refresh when tab is focused / tapped
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const isVideos = kind === 'videos';
  const items = isVideos ? videos : images;

  const header = isVideos
    ? {title: 'Videos', subtitle: 'Video statuses ready to save'}
    : {title: 'Images', subtitle: 'Photo statuses ready to save'};

  const emptyProps = isVideos
    ? {
        emoji: '🎬',
        title: 'No video statuses',
        message: 'View some video statuses in WhatsApp, then pull down to refresh.',
      }
    : {
        emoji: '🖼️',
        title: 'No image statuses',
        message: 'View some photo statuses in WhatsApp, then pull down to refresh.',
      };

  const openPreview = item => {
    navigation.navigate('Preview', {item});
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title={header.title}
        subtitle={header.subtitle}
        right={
          items && items.length > 0 ? (
            <CountChip count={items.length} label={isVideos ? 'videos' : 'images'} />
          ) : null
        }
      />
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
