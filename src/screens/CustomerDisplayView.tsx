import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const CHANNEL = 'nerve_customer_display';
const STORAGE_KEY = 'nerve_customer_display_state';

export const CustomerDisplayView: React.FC = () => {
  const [state, setState] = useState<any>({ status: 'idle', items: [] });

  useEffect(() => {
    const bc = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel(CHANNEL) : null;
    const handler = (e: MessageEvent) => { if (e.data) setState(e.data); };
    if (bc) bc.onmessage = handler;
    const readState = () => {
      try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setState(JSON.parse(raw)); } catch {}
    };
    const storageHandler = (e: StorageEvent) => { if (e.key === STORAGE_KEY && e.newValue) { try { setState(JSON.parse(e.newValue)); } catch {} } };
    window.addEventListener('storage', storageHandler);
    readState();
    const t = setInterval(readState, 500);
    // Tauri cross-window event listener
    let unlisten: any = null;
    const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
    if (isTauri) {
      import('@tauri-apps/api/event').then((m: any) => {
        m.listen('customer-display-update', (e: any) => { if (e?.payload) setState(e.payload); }).then((u: any) => { unlisten = u; });
      }).catch(() => {});
    }
    return () => { if (bc) bc.close(); window.removeEventListener('storage', storageHandler); clearInterval(t); if (unlisten) unlisten(); };
  }, []);

  const items = state.items ?? [];
  const total = state.total ?? 0;

  if (state.status === 'idle' || items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F0EA] flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <h1 className="font-black uppercase text-5xl">{state.restaurantName ?? 'Nerve Fast Food'}</h1>
          <p className="text-xl font-bold text-black/60 mt-4">Welcome! Please place your order.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F0EA] flex flex-col p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-black uppercase text-3xl">{state.restaurantName ?? 'Nerve Fast Food'}</h1>
        <span className="font-black text-2xl">PKR {total.toFixed(0)}</span>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-8">
        <div className="brutal-card p-6 bg-white flex flex-col gap-3">
          <h2 className="font-black uppercase text-xl border-b-3 border-black pb-2">Your Order</h2>
          <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {items.map((it: any, idx: number) => (
              <div key={idx} className="flex justify-between text-lg font-bold border-b border-black/20 pb-1">
                <span>{it.quantity}x {it.name}</span>
                <span>PKR {(it.price * it.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="border-t-3 border-black pt-2 flex justify-between font-black text-2xl">
            <span>Total</span><span>PKR {total.toFixed(0)}</span>
          </div>
        </div>
        <div className="brutal-card p-6 bg-white flex flex-col items-center justify-center gap-4">
          {state.status === 'payment' && state.raastQrDataUrl ? (
            <>
              <h2 className="font-black uppercase text-xl">Scan to Pay (Raast)</h2>
              <img src={state.raastQrDataUrl} alt="raast qr" className="w-64 h-64" />
              <p className="text-sm font-bold text-black/60">{state.raast?.accountTitle}</p>
              <p className="text-xs font-bold text-black/40">{state.raast?.iban}</p>
            </>
          ) : state.status === 'payment' && state.raastPayload ? (
            <>
              <h2 className="font-black uppercase text-xl">Scan to Pay (Raast)</h2>
              <QRCodeSVG value={state.raastPayload} size={240} />
            </>
          ) : state.status === 'paid' ? (
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="font-black uppercase text-3xl">Payment Received</h2>
              <p className="text-lg font-bold text-black/60 mt-2">Thank you!</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg font-bold text-black/60">Proceed to checkout</p>
            </div>
          )}
        </div>
      </div>
      {state.message && <p className="text-center font-black text-xl mt-4">{state.message}</p>}
    </div>
  );
}
