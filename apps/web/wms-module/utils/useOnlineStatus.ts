import { useSyncExternalStore } from 'react';

/**
 * Returns the current online status of the browser.
 * @returns {boolean} True if online, false otherwise.
 */
function getSnapshot(): boolean {
  return navigator.onLine;
}

/**
 * Returns the online status for server-side rendering.
 * Assumes online for server-side.
 * @returns {boolean} Always true.
 */
function getServerSnapshot(): boolean {
  return true;
}

/**
 * Subscribes to online/offline events and calls the callback.
 * @param {() => void} callback The function to call when online status changes.
 * @returns {() => void} A cleanup function to unsubscribe.
 */
function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

/**
 * A React hook that provides the current online status.
 * It uses `useSyncExternalStore` to synchronize with the browser's online status.
 * @returns {boolean} The current online status.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
