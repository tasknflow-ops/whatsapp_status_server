import {useCallback, useEffect, useState} from 'react';
import {AppState} from 'react-native';
import {useAppStore} from '../store/useAppStore';
import {listFolder} from '../native/storage';
import {processStatusEntries} from '../utils/fileUtils';

/**
 * Reads the granted .Statuses folder and returns processed media, split into
 * images and videos. Re-runnable via refresh() (pull-to-refresh).
 * Also automatically refreshes when returning to the app from WhatsApp.
 *
 * Returns: { all, images, videos, loading, error, refresh }
 */
export function useStatusFiles() {
  const statusesUri = useAppStore(s => s.statusesUri);
  const setScanning = useAppStore(s => s.setScanning);

  const [data, setData] = useState({all: [], images: [], videos: []});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!statusesUri) {
      setData({all: [], images: [], videos: []});
      return;
    }
    setLoading(true);
    setScanning(true);
    setError(null);
    try {
      const raw = await listFolder(statusesUri);
      setData(processStatusEntries(raw));
    } catch (e) {
      setError(e?.message || 'Failed to read statuses');
      setData({all: [], images: [], videos: []});
    } finally {
      setLoading(false);
      setScanning(false);
    }
  }, [statusesUri, setScanning]);

  // Auto-load whenever the granted folder becomes available/changes.
  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh when app comes back to foreground (e.g. after user watched a status in WhatsApp)
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        load();
      }
    });
    return () => {
      sub.remove();
    };
  }, [load]);

  return {...data, loading, error, refresh: load};
}
