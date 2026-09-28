'use client';

import React, { useState } from 'react';
import { ShieldAlert, VolumeX, Volume2, CheckCircle2, Siren, Zap } from 'lucide-react';

interface LockdownControlsProps {
  lockdownActive: boolean;
  acousticShieldActive: boolean;
  onToggleLockdown: (pin: string) => Promise<void>;
  onToggleAcousticShield: () => Promise<void>;
  onClearAlarm: () => Promise<void>;
  onInjectThreat: () => Promise<void>;
}

export const LockdownControls: React.FC<LockdownControlsProps> = ({
  lockdownActive,
  acousticShieldActive,
  onToggleLockdown,
  onToggleAcousticShield,
  onClearAlarm,
  onInjectThreat,
}) => {
  const [loading, setLoading] = useState(false);

  const handleLockdownClick = async () => {
    setLoading(true);
    try {
      await onToggleLockdown('9941');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-lg p-4 font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <Siren className="w-4 h-4 text-cyber-red animate-pulse" />
          <span className="text-xs font-semibold text-gray-400">DEFENSIVE PERIMETER INTERVENTIONS</span>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">KEYBOARD ARMED</span>
      </div>

      <div className="grid grid-cols-2 gap-3 my-3">
        {/* Lockdown Button */}
        <button
          onClick={handleLockdownClick}
          disabled={loading}
          className={`py-3 px-3 rounded text-xs font-bold uppercase transition flex flex-col items-center justify-center gap-1 border ${
            lockdownActive
              ? 'bg-cyber-red text-white border-cyber-red shadow-[0_0_20px_rgba(255,0,60,0.6)] animate-pulse'
              : 'bg-cyber-red/15 hover:bg-cyber-red/25 text-cyber-red border-cyber-red/50'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span>{lockdownActive ? 'RELEASE LOCKDOWN [L]' : 'EMERGENCY LOCKDOWN [L]'}</span>
        </button>

        {/* Acoustic Warning Shield */}
        <button
          onClick={onToggleAcousticShield}
          className={`py-3 px-3 rounded text-xs font-bold uppercase transition flex flex-col items-center justify-center gap-1 border ${
            acousticShieldActive
              ? 'bg-cyber-orange text-black border-cyber-orange shadow-[0_0_15px_rgba(255,73,0,0.5)]'
              : 'bg-cyber-orange/15 hover:bg-cyber-orange/25 text-cyber-orange border-cyber-orange/50'
          }`}
        >
          {acousticShieldActive ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          <span>{acousticShieldActive ? 'DISARM SHIELD [S]' : 'ACOUSTIC SHIELD [S]'}</span>
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyber-border">
        <button
          onClick={onClearAlarm}
          className="py-1.5 px-2 bg-cyber-dark hover:bg-cyber-border text-cyber-green border border-cyber-green/40 rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Clear Alarm [C]</span>
        </button>

        <button
          onClick={onInjectThreat}
          className="py-1.5 px-2 bg-cyber-dark hover:bg-cyber-border text-cyber-cyan border border-cyber-cyan/40 rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <Zap className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>Inject Threat [T]</span>
        </button>
      </div>
    </div>
  );
};
