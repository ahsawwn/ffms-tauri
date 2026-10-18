import React, { useEffect, useState } from 'react';
import { fetchReceiptSettings, saveReceiptSettings } from '../db/userQueries';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { QRCodeSVG } from 'qrcode.react';
import { useThermalPrinter } from '../hooks/useThermalPrinter';
import { ThemeSection } from './settings/ThemeSection';
import { RaastSection } from './settings/RaastSection';
import type { ThemeId } from './settings/ThemeSection';

const TABS = ['Receipt', 'Printer', 'Kitchen', 'Themes', 'Raast'] as const;
type Tab = typeof TABS[number];

export const SettingsView: React.FC = () => {
  const [s, setS] = useState<any>({});
  const [theme, setTheme] = useState<ThemeId>('default');
  const [tab, setTab] = useState<Tab>('Receipt');
  const [saving, setSaving] = useState(false);
  const [printers, setPrinters] = useState<string[]>([]);
  const { printTest } = useThermalPrinter();

  useEffect(() => {
    const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
    if (!isTauri) return;
    invoke<string[]>('list_printers').then(setPrinters).catch(() => setPrinters([]));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('nerve_theme');
    if (stored) setTheme(stored as ThemeId);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nerve_theme', theme);
  }, [theme]);

  useEffect(() => {
    const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
    if (!isTauri) {
      const stored = localStorage.getItem('nerve_raast');
      setS({
        kitchenPin: localStorage.getItem('kitchen_pin') ?? '1234',
        mobileKitchenUrl: localStorage.getItem('kitchen_url') ?? '',
        raast: stored ? JSON.parse(stored) : { accountTitle: '', iban: '', till: '', amount: '' },
      });
      return;
    }
    void fetchReceiptSettings().then((r) => {
      const raast = r?.raast ? JSON.parse(r.raast) : { accountTitle: '', iban: '', till: '', amount: '' };
      setS({ ...(r ?? {}), raast });
      if (r?.printerName) localStorage.setItem('nerve_printer_name', r.printerName);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
    const toSave = { ...s, raast: JSON.stringify(s.raast) };
    if (!isTauri) {
      localStorage.setItem('kitchen_pin', s.kitchenPin ?? '1234');
      localStorage.setItem('kitchen_url', s.mobileKitchenUrl ?? '');
      localStorage.setItem('nerve_raast', JSON.stringify(s.raast));
      localStorage.setItem('nerve_printer_name', s.printerName ?? '');
      setSaving(false);
      alert('Saved');
      return;
    }
    await saveReceiptSettings(toSave);
    localStorage.setItem('nerve_printer_name', s.printerName ?? '');
    setSaving(false);
    alert('Saved');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setS({ ...s, logoUrl: reader.result as string, showLogo: 1 });
    reader.readAsDataURL(file);
  };

  const url = s.mobileKitchenUrl || `${window.location.origin}/#/kitchen/mobile`;

  return (
    <div className="h-screen bg-[var(--bg-app)] flex flex-col">
      <div className="brutal-card p-4 bg-[#FFE600] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white border-3 border-black shadow-[3px_3px_0px_#000]">⚙️</div>
          <div>
            <h2 className="font-black uppercase text-xl">Settings</h2>
            <p className="text-xs font-extrabold uppercase text-black/70">Nerve FFMS Terminal</p>
          </div>
        </div>
        <Button variant="success" className="flex-shrink-0" onClick={save} disabled={saving}>
          {saving ? 'SAVING...' : 'Save Settings'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-2 bg-[var(--bg-surface)] border-b-3 border-black overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-black uppercase text-xs border-3 border-black transition-all ${
              tab === t ? 'bg-[#FFE600] shadow-[3px_3px_0px_#000]' : 'bg-white hover:bg-[var(--nb-cream)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {tab === 'Receipt' && (
            <div className="brutal-card p-4 bg-white flex flex-col gap-3">
              <h3 className="font-black uppercase text-sm border-b-3 border-black pb-1">Receipt Details</h3>
              <Input label="Restaurant Name" value={s.restaurantName ?? ''} onChange={(e) => setS({ ...s, restaurantName: e.target.value })} />
              <Input label="Tagline" value={s.tagline ?? ''} onChange={(e) => setS({ ...s, tagline: e.target.value })} />
              <Input label="Address" value={s.address ?? ''} onChange={(e) => setS({ ...s, address: e.target.value })} />
              <Input label="Phone" value={s.phone ?? ''} onChange={(e) => setS({ ...s, phone: e.target.value })} />
              <Input label="Tax Reg No (TRN)" value={s.taxRegistrationNumber ?? ''} onChange={(e) => setS({ ...s, taxRegistrationNumber: e.target.value })} />
              <Input label="Footer Message" value={s.footerMessage ?? ''} onChange={(e) => setS({ ...s, footerMessage: e.target.value })} />
            </div>
          )}

          {tab === 'Printer' && (
            <div className="flex flex-col gap-4">
              <div className="brutal-card p-4 bg-white flex flex-col gap-3">
                <h3 className="font-black uppercase text-sm border-b-3 border-black pb-1">Printer</h3>
                <select className="brutal-input" value={s.printerWidth ?? '80mm'} onChange={(e) => setS({ ...s, printerWidth: e.target.value })}>
                  <option value="80mm">80mm Thermal</option>
                  <option value="58mm">58mm Thermal</option>
                </select>
                {printers.length > 0 ? (
                  <select className="brutal-input" value={s.printerName ?? ''} onChange={(e) => setS({ ...s, printerName: e.target.value })}>
                    <option value="">Default printer (show dialog)</option>
                    {printers.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                ) : (
                  <Input label="Printer Name (CUPS)" value={s.printerName ?? ''} onChange={(e) => setS({ ...s, printerName: e.target.value })} placeholder="e.g. POS-80" />
                )}
                <label className="flex items-center gap-2 text-xs font-bold">
                  <input type="checkbox" checked={!!s.showLogo} onChange={(e) => setS({ ...s, showLogo: e.target.checked ? 1 : 0 })} /> Show Logo
                </label>
                <Button variant="info" size="sm" onClick={() => printTest(s)}>Test Print Receipt</Button>
              </div>
              <div className="brutal-card p-4 bg-white flex flex-col gap-3">
                <h3 className="font-black uppercase text-sm border-b-3 border-black pb-1">Custom Logo</h3>
                <p className="text-[10px] font-bold text-black/60 uppercase">Upload a logo image to print on receipts (PNG/JPG, max ~2MB)</p>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="brutal-input" />
                {s.logoUrl && (
                  <div className="flex flex-col items-center gap-2">
                    <img src={s.logoUrl} alt="logo preview" className="max-h-24 border-3 border-black" />
                    <Button variant="danger" size="sm" onClick={() => setS({ ...s, logoUrl: null })}>Remove Logo</Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'Kitchen' && (
            <div className="brutal-card p-4 bg-white flex flex-col gap-3">
              <h3 className="font-black uppercase text-sm border-b-3 border-black pb-1">Kitchen & Mobile</h3>
              <Input label="Kitchen PIN (4 digits)" value={s.kitchenPin ?? ''} maxLength={4} onChange={(e) => setS({ ...s, kitchenPin: e.target.value })} />
              <Input label="Mobile Kitchen URL" value={s.mobileKitchenUrl ?? ''} placeholder="http://192.168.x.x:1420/#/kitchen/mobile" onChange={(e) => setS({ ...s, mobileKitchenUrl: e.target.value })} />
              <div className="brutal-card p-3 bg-[#F4F0EA] flex flex-col items-center gap-2 border-3 border-black">
                <h4 className="font-black uppercase text-xs">Mobile Kitchen QR</h4>
                <QRCodeSVG value={url} size={160} />
                <span className="text-[10px] font-bold break-all text-center">{url}</span>
              </div>
            </div>
          )}

          {tab === 'Themes' && (
            <ThemeSection theme={theme} onThemeChange={setTheme} />
          )}

          {tab === 'Raast' && (
            <RaastSection
              raast={s.raast ?? { accountTitle: '', iban: '', till: '', amount: '' }}
              onRaastChange={(raast) => setS({ ...s, raast })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
