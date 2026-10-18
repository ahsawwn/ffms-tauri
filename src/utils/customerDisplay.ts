const CHANNEL = 'nerve_customer_display';
const STORAGE_KEY = 'nerve_customer_display_state';

export async function broadcastCustomerDisplay(state: any) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(CHANNEL);
      bc.postMessage(state);
      bc.close();
    }
  } catch {}
  // Tauri cross-window event
  try {
    const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
    if (isTauri) {
      const { emit } = await import('@tauri-apps/api/event');
      await emit('customer-display-update', state);
    }
  } catch {}
}

export function clearCustomerDisplay(restaurantName?: string) {
  broadcastCustomerDisplay({ status: 'idle', items: [], restaurantName: restaurantName ?? 'Nerve Fast Food' });
}