import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PinDisplay } from './PinDisplay';
import { PinKeypad } from './PinKeypad';
import { ShieldCheck, Sparkles, Power } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { exit } from '@tauri-apps/api/app';

export const LoginScreen: React.FC = () => {
  const { loginWithPin } = useAuth();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submitPin = async (value: string) => {
    if (value.length !== 4 || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    const success = await loginWithPin(value);
    setIsSubmitting(false);
    if (!success) {
      setError('INVALID PIN CODE');
      setPin('');
    }
  };

  const handleKeyPress = (digit: string) => {
    if (isSubmitting || pin.length >= 4) return;
    const updated = pin + digit;
    setPin(updated);
    setError('');
    if (updated.length === 4) {
      void submitPin(updated);
    }
  };

  const handleDelete = () => { setPin((p) => p.slice(0, -1)); setError(''); };
  const handleClear = () => { setPin(''); setError(''); };

  return (
    <div className="w-screen h-screen bg-[#F4F0EA] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6 flex flex-col items-center gap-5 bg-white border-4 border-black shadow-[8px_8px_0px_#000]">
        <div className="text-center flex flex-col items-center gap-1">
          <div className="p-2.5 bg-[#FFE600] border-3 border-black shadow-[3px_3px_0px_#000]">
            <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight mt-1">Nerve FFMS</h1>
          <Badge variant="cyan" className="text-[10px]">Enter Staff PIN</Badge>
        </div>

        <PinDisplay pinLength={pin.length} error={error} />

        <PinKeypad onKeyPress={handleKeyPress} onClear={handleClear} onDelete={handleDelete} disabled={isSubmitting} />

        <Button variant="success" className="w-full py-3 text-sm font-black tracking-wider" onClick={() => submitPin(pin)} disabled={isSubmitting || pin.length < 4}>
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          {isSubmitting ? 'VERIFYING...' : 'LOGIN'}
        </Button>

        <Button variant="danger" size="sm" className="w-full" onClick={async () => { try { await getCurrentWindow().close(); } catch (e1) { try { await getCurrentWindow().destroy(); } catch (e2) { try { await exit(0); } catch (e3) { window.close(); } } } }}>
          <Power className="w-4 h-4 stroke-[2.5]" /> EXIT APP
        </Button>

        <div className="text-[10px] font-extrabold uppercase text-center text-black/70 pt-2 border-t-2 border-black/10 w-full flex justify-between">
          <span>Owner: <strong className="text-black">9999</strong></span>
          <span>Mgr: <strong className="text-black">8888</strong></span>
          <span>Cashier: <strong className="text-black">1234</strong></span>
          <span>Kitchen: <strong className="text-black">5555</strong></span>
        </div>
      </Card>
    </div>
  );
};
