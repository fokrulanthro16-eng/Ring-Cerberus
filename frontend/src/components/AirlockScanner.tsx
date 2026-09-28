'use client';

import React, { useState, useEffect } from 'react';
import { AirlockStatus } from '@/types/telemetry';
import { KeyRound, Unlock, Lock, Clock, PackageCheck, AlertTriangle } from 'lucide-react';

interface AirlockScannerProps {
  status: AirlockStatus;
  timeRemaining: number;
  onVerify: (otp: string, courierId: string) => Promise<void>;
  isOffline?: boolean;
}

export const AirlockScanner: React.FC<AirlockScannerProps> = ({
  status,
  timeRemaining,
  onVerify,
  isOffline = false,
}) => {
  const [pin, setPin] = useState('');
  const [activeTotp, setActiveTotp] = useState<string>('844386');
  const [totpSeconds, setTotpSeconds] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Poll current TOTP from backend or run local RFC 6238 countdown
  useEffect(() => {
    const fetchTotp = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/airlock-token`);
        if (res.ok) {
          const data = await res.json();
          setActiveTotp(data.current_totp);
          setTotpSeconds(data.valid_for_seconds);
          return;
        }
      } catch (err) {
        // Fallback for offline mode
      }
      // Offline local countdown
      const sec = 30 - (Math.floor(Date.now() / 1000) % 30);
      setTotpSeconds(sec);
      if (!activeTotp || activeTotp === '------') {
        setActiveTotp('844386');
      }
    };

    fetchTotp();
    const interval = setInterval(fetchTotp, 2000);
    return () => clearInterval(interval);
  }, [activeTotp]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (pin.length !== 6) return;
    setLoading(true);
    setFeedback(null);
    try {
      await onVerify(pin, 'AMAZON-PRIME-COURIER-502');
      setPin('');
    } catch (e: any) {
      setFeedback('Offline verification failure');
    } finally {
      setLoading(false);
    }
  };

  const fillActiveTotp = () => {
    if (activeTotp && activeTotp !== '------') {
      setPin(activeTotp);
    }
  };

  const isUnlocked = status === 'UNLOCKED';

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-lg p-4 font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-cyber-cyan" />
          <span className="text-xs font-semibold text-gray-400">ZERO-TRUST DELIVERY AIRLOCK</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isUnlocked ? (
            <span className="flex items-center gap-1 text-xs font-bold text-cyber-green bg-cyber-green/10 border border-cyber-green px-2 py-0.5 rounded">
              <Unlock className="w-3.5 h-3.5" /> UNLOCKED ({timeRemaining}s)
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-gray-300 bg-cyber-dark border border-cyber-border px-2 py-0.5 rounded">
              <Lock className="w-3.5 h-3.5 text-cyber-green" /> SECURE
            </span>
          )}
        </div>
      </div>

      {/* Rotating Key / TOTP Debug Bar */}
      <div className="my-3 p-2.5 rounded bg-cyber-dark/80 border border-cyber-border flex items-center justify-between">
        <div>
          <div className="text-[10px] text-gray-400">ACTIVE ROTATING TOTP (RFC 6238)</div>
          <div className="text-base font-bold text-cyber-cyan tracking-widest">{activeTotp}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right text-[10px] text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyber-amber" />
            <span>{totpSeconds}s</span>
          </div>
          <button
            onClick={fillActiveTotp}
            className="text-[11px] bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/40 px-2 py-1 rounded transition"
          >
            Auto-Fill
          </button>
        </div>
      </div>

      {/* PIN Input Display */}
      <div className="my-2">
        <div className="h-10 bg-cyber-dark border border-cyber-border rounded flex items-center justify-center tracking-[0.5em] text-lg font-bold text-white">
          {pin.padEnd(6, '·')}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-1.5 my-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
          <button
            key={k}
            onClick={() => {
              if (k === 'C') setPin('');
              else if (k === '⌫') handleBackspace();
              else handleKeyPress(k);
            }}
            className="h-9 bg-cyber-dark hover:bg-cyber-border/60 active:bg-cyber-cyan/20 border border-cyber-border text-sm font-semibold text-gray-200 rounded transition"
          >
            {k}
          </button>
        ))}
      </div>

      {/* Verify Action Button */}
      <button
        onClick={handleSubmit}
        disabled={pin.length !== 6 || loading}
        className={`w-full mt-2 py-2 rounded text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${
          pin.length === 6 && !loading
            ? 'bg-cyber-green text-black hover:bg-cyber-green/90 shadow-[0_0_12px_rgba(0,255,102,0.4)]'
            : 'bg-cyber-border/40 text-gray-500 cursor-not-allowed'
        }`}
      >
        <PackageCheck className="w-4 h-4" />
        {loading ? 'AUTHENTICATING CRYPTO TOTP...' : 'UNLOCK PARCEL COMPARTMENT'}
      </button>

      {feedback && (
        <div className="mt-2 text-[11px] text-cyber-red text-center flex items-center justify-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> {feedback}
        </div>
      )}
    </div>
  );
};
