import { useSyncExternalStore } from 'react';

import { usePrefs } from './prefs';
import { useSession } from './session';
import { useWallet } from './wallet';

const stores = [usePrefs, useSession, useWallet];

const subscribe = (cb: () => void) => {
  const unsubs = stores.map((s) => s.persist.onFinishHydration(cb));
  return () => unsubs.forEach((u) => u());
};
const snapshot = () => stores.every((s) => s.persist.hasHydrated());

/** True once every persisted store has been restored from storage. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
