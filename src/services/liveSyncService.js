/**
 * liveSyncService.js
 * 
 * Provides selective cache invalidation and cross-tab live synchronization
 * between Admin Panel and Storefront without full page reloads or touching user sessions.
 */

// Keys that MUST NEVER be invalidated by cache sync
const PROTECTED_KEYS = new Set(['token', 'user', 'admin_token', 'admin_user', 'cartItems', 'wishlistItems', 'orders']);

/**
 * Selectively removes cached frontend data from localStorage
 * @param {'products' | 'settings' | 'categories' | 'all'} type 
 */
export const invalidateCache = (type = 'all') => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || PROTECTED_KEYS.has(key)) continue;

      if (key.startsWith('iincept_')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error('[liveSyncService] Cache invalidation error:', err);
  }
};

/**
 * Called ONLY after a successful Admin Save/Update/Delete HTTP response.
 * Broadcasts sync signal to all open tabs and invalidates local tab cache.
 * 
 * @param {'products' | 'settings' | 'categories'} type 
 * @param {Object} details 
 */
export const notifyAdminChange = (type = 'settings', details = {}) => {
  // 1. Invalidate cache in current tab
  invalidateCache(type);

  const payload = {
    type,
    details,
    timestamp: Date.now()
  };

  // 2. Broadcast to other open browser tabs via BroadcastChannel API
  try {
    const channel = new BroadcastChannel('iincept_live_sync');
    channel.postMessage(payload);
    channel.close();
  } catch (err) {}

  // 3. Storage event fallback
  try {
    localStorage.setItem('iincept_sync_trigger', JSON.stringify(payload));
  } catch (e) {}

  // 4. Dispatch CustomEvent for same-tab listeners
  window.dispatchEvent(new CustomEvent('iincept_data_sync', { detail: payload }));
};

/**
 * React hook / listener helper for storefront pages to subscribe to live sync events.
 * Automatically invalidates cache on window focus / tab activation and periodic polling.
 * 
 * @param {Function} callback Function called with payload when admin changes occur
 * @returns {Function} Unsubscribe function
 */
export const subscribeToLiveSync = (callback) => {
  const handlePayload = (payload) => {
    if (!payload) return;
    invalidateCache(payload.type || 'all');
    callback(payload);
  };

  let channel = null;
  try {
    channel = new BroadcastChannel('iincept_live_sync');
    channel.onmessage = (event) => handlePayload(event.data);
  } catch (err) {}

  const customEventListener = (e) => handlePayload(e.detail);
  window.addEventListener('iincept_data_sync', customEventListener);

  const storageListener = (e) => {
    if (e.key === 'iincept_sync_trigger' && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        handlePayload(payload);
      } catch (err) {}
    }
  };
  window.addEventListener('storage', storageListener);

  // Tab switch / Window Focus Listener
  const focusListener = () => {
    invalidateCache();
    callback({ type: 'focus', timestamp: Date.now() });
  };
  window.addEventListener('focus', focusListener);

  const visibilityListener = () => {
    if (document.visibilityState === 'visible') {
      invalidateCache();
      callback({ type: 'visibility', timestamp: Date.now() });
    }
  };
  document.addEventListener('visibilitychange', visibilityListener);

  // Background Polling Fallback (Every 10s if tab active)
  const pollInterval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      callback({ type: 'polling', timestamp: Date.now() });
    }
  }, 10000);

  return () => {
    if (channel) channel.close();
    window.removeEventListener('iincept_data_sync', customEventListener);
    window.removeEventListener('storage', storageListener);
    window.removeEventListener('focus', focusListener);
    document.removeEventListener('visibilitychange', visibilityListener);
    clearInterval(pollInterval);
  };
};
