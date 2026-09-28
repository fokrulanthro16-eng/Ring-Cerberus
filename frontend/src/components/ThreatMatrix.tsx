'use client';

import React from 'react';
import { ThreatLevel } from '@/types/telemetry';
import { Shield, AlertTriangle, Crosshair, Cpu, Gauge } from 'lucide-react';

interface ThreatMatrixProps {
  threatLevel: ThreatLevel;
  threatScore: number;
  deceptionIndex: number;
  activeDirective?: string;
}

export const ThreatMatrix: React.FC<ThreatMatrixProps> = ({
  threatLevel,
  threatScore,
  deceptionIndex,
  activeDirective,
}) => {
  const getLevelColor = (level: ThreatLevel) => {
    switch (level) {
      case 'CLEAR':
        return { text: 'text-cyber-green', border: 'border-cyber-green', bg: 'bg-cyber-green/10', glow: 'shadow-[0_0_15px_rgba(0,255,102,0.3)]' };
      case 'MONITOR':
        return { text: 'text-cyber-cyan', border: 'border-cyber-cyan', bg: 'bg-cyber-cyan/10', glow: 'shadow-[0_0_15px_rgba(0,229,255,0.3)]' };
      case 'SUSPICIOUS':
        return { text: 'text-cyber-amber', border: 'border-cyber-amber', bg: 'bg-cyber-amber/10', glow: 'shadow-[0_0_15px_rgba(255,184,0,0.3)]' };
      case 'ALERT':
        return { text: 'text-cyber-orange', border: 'border-cyber-orange', bg: 'bg-cyber-orange/10', glow: 'shadow-[0_0_15px_rgba(255,73,0,0.3)]' };
      case 'LOCKDOWN':
        return { text: 'text-cyber-red', border: 'border-cyber-red', bg: 'bg-cyber-red/10', glow: 'shadow-[0_0_20px_rgba(255,0,60,0.5)]' };
    }
  };

  const colors = getLevelColor(threatLevel);

  return (
    <div className={`bg-cyber-card border rounded-lg p-4 font-mono transition-all duration-300 ${colors.border} ${colors.glow}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <Crosshair className={`w-4 h-4 ${colors.text}`} />
          <span className="text-xs font-semibold text-gray-400">THREAT MATRIX RADAR</span>
        </div>
        <div className={`px-2 py-0.5 rounded text-xs font-bold border ${colors.border} ${colors.bg} ${colors.text}`}>
          STATUS: {threatLevel}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 my-4">
        {/* Radar Sweep & Threat Score */}
        <div className="relative flex flex-col items-center justify-center p-3 rounded bg-cyber-dark/60 border border-cyber-border/80 overflow-hidden">
          {/* Radar circle animations */}
          <div className="relative w-28 h-28 rounded-full border border-cyber-border flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border border-cyber-border/50 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-cyber-border/30" />
            </div>
            {/* Rotating radar needle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-transparent to-cyber-cyan/30 animate-radar-sweep pointer-events-none" />
            
            {/* Center score readout */}
            <div className="z-10 text-center">
              <div className={`text-2xl font-black ${colors.text}`}>{threatScore}%</div>
              <div className="text-[9px] text-gray-400 uppercase tracking-wider">Severity</div>
            </div>
          </div>
        </div>

        {/* Deception Index Meter */}
        <div className="flex flex-col justify-between p-3 rounded bg-cyber-dark/60 border border-cyber-border/80">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-cyber-cyan" /> DECEPTION INDEX
              </span>
              <span className={`font-bold ${deceptionIndex > 0.5 ? 'text-cyber-red' : 'text-cyber-green'}`}>
                {deceptionIndex.toFixed(2)} / 1.00
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-cyber-border overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  deceptionIndex > 0.6 ? 'bg-cyber-red' : deceptionIndex > 0.3 ? 'bg-cyber-amber' : 'bg-cyber-green'
                }`}
                style={{ width: `${Math.min(100, deceptionIndex * 100)}%` }}
              />
            </div>
          </div>

          {/* Breakdown parameters */}
          <div className="space-y-1 text-[10px] text-gray-400 pt-2 border-t border-cyber-border/50">
            <div className="flex justify-between">
              <span>Facial Occlusion (Mask):</span>
              <span className="text-gray-200">{deceptionIndex > 0.5 ? 'HIGH (85%)' : 'LOW (5%)'}</span>
            </div>
            <div className="flex justify-between">
              <span>Vocal Hesitation Latency:</span>
              <span className="text-gray-200">{threatScore > 50 ? '3.8s [ANOMALY]' : '0.4s [NOMINAL]'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bedrock Directive Banner */}
      <div className="pt-2 border-t border-cyber-border flex items-start gap-2">
        <Cpu className="w-4 h-4 text-cyber-cyan shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="text-gray-400">ACTIVE DIRECTIVE: </span>
          <span className="text-gray-200 font-medium">
            {activeDirective || 'PERIMETER NOMINAL - CONTINUOUS SWARM MONITORING'}
          </span>
        </div>
      </div>
    </div>
  );
};
