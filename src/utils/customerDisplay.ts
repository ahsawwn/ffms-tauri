const CHANNEL = 'nerve_customer_display';
const STORAGE_KEY = 'nerve_customer_display_state';

export function broadcastCustomerDisplay(state: any) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(CHANNEL);
      bc.postMessage(state);
      bc.close();
    }
  } catch {}
}

export function clearCustomerDisplay(restaurantName?: string) {
  broadcastCustomerDisplay({ status: 'idle', items: [], restaurantName: restaurantName ?? 'Nerve Fast Food' });
}