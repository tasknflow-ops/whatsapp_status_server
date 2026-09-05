import {useCallback, useEffect, useState} from 'react';
import {useAppStore} from '../store/useAppStore';
import {pickStatusesFolder, stillHasPermission} from '../native/storage';

/**
 * Manages the one-time SAF folder grant for the WhatsApp .Statuses folder.
 *
 * Exposes:
 *   isGranted      - do we currently hold a usable grant?
 *   checking       - verifying an existing grant on mount
 *   requestAccess  - open the system folder picker
 *   revoke         - forget the grant (user can re-grant later)
 */
export function useSafPermission() {
  const statusesUri = useAppStore(s => s.statusesUri);
  const hydrated = useAppStore(s => s.hydrated);
  const setStatusesUri = useAppStore(s => s.setStatusesUri);
  const clearGrant = useAppStore(s => s.clearGrant);

  const [checking, setChecking] = useState(true);
  const [isGranted, setIsGranted] = useState(false);

  // Once the store has hydrated the saved URI, verify it's still valid.
  useEffect(() => {
    let active = true;
    async function verify() {
      if (!hydrated) return;
      if (!statusesUri) {
        if (active) {
          setIsGranted(false);
          setChecking(false);
        }
        return;
      }
      const ok = await stillHasPermission(statusesUri);
      if (!active) return;
      if (!ok) {
        // Grant went stale — forget it so the UI prompts again.
        await clearGrant();
        setIsGranted(false);
      } else {
        setIsGranted(true);
      }
      setChecking(false);
    }
    verify();
    return () => {
      active = false;
    };
  }, [hydrated, statusesUri, clearGrant]);

  const requestAccess = useCallback(async () => {
    const uri = await pickStatusesFolder();
    if (uri) {
      await setStatusesUri(uri);
      setIsGranted(true);
      return true;
    }
    return false;
  }, [setStatusesUri]);

  const revoke = useCallback(async () => {
    await clearGrant();
    setIsGranted(false);
  }, [clearGrant]);

  return {isGranted, checking, requestAccess, revoke, statusesUri};
}
