'use client';

import React from 'react';
import { Terminal } from 'lucide-react';

interface TelemetryFeedProps {
  logs: string[];
}

export const TelemetryFeed: React.FC<TelemetryFeedProps> = ({ logs }) => {
  return (
    <div className="bg-cyber-card border border-cyber-border rounded-lg p-4 font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyber-green" />
          <span className="text-xs font-semibold text-gray-400">TELEMETRY AUDIT TRAIL</span>
        </div>
        <span className="text-[10px] text-gray-500">LIVE BUFFER</span>
      </div>

      <div className="mt-2 h-28 overflow-y-auto space-y-1 text-[11px] text-gray-300 font-mono">
        {logs.length === 0 ? (
          <div className="text-gray-600 italic">No events logged yet.</div>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className={`leading-tight ${
                log.includes('CRITICAL') || log.includes('ALERT') || log.includes('BREACH')
                  ? 'text-cyber-red font-bold'
                  : log.includes('UNLOCKED') || log.includes('Verified')
                  ? 'text-cyber-green'
                  : log.includes('Swarm') || log.includes('Bedrock')
                  ? 'text-cyber-cyan'
                  : 'text-gray-400'
              }`}
            >
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
