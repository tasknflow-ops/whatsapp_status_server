import React from 'react';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import StatusItem from './StatusItem';
import EmptyState from './EmptyState';
import {colors, spacing} from '../utils/theme';

/**
 * Reusable 2-column grid used by both the Images and Videos tabs.
 * Parent supplies the already-filtered list plus the handlers.
 */
export default function StatusGrid({
  items,
  loading,
  onRefresh,
  onPressItem,
  onSaveItem,
  savingUri,
  emptyProps,
}) {
  if (!loading && (!items || items.length === 0)) {
    return (
      <View style={styles.emptyWrap}>
        <EmptyState {...emptyProps} onRefresh={onRefresh} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={it => it.uri}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      renderItem={({item}) => (
        <StatusItem
          item={item}
          onPress={onPressItem}
          onSave={onSaveItem}
          saving={savingUri === item.uri}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={!!loading}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.bg,
    flexGrow: 1,
  },
  row: {justifyContent: 'space-between'},
  emptyWrap: {flex: 1, backgroundColor: colors.bg},
});
