'use client';

import React, { useRef, useEffect } from 'react';
import { Volume2, AlertCircle } from 'lucide-react';

interface AudioWaveformProps {
  decibelLevel: number;
  acousticEvent?: string;
  acousticShieldActive: boolean;
  noiseFloorDb?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  decibelLevel,
  acousticEvent,
  acousticShieldActive,
  noiseFloorDb = 42.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.05;
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#070c18';
      ctx.fillRect(0, 0, width, height);

      // Draw center baseline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Render Dynamic Equalizer / Waveform Bars
      const numBars = 48;
      const barWidth = width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        // Compute pseudo-random frequency amplitude boosted by decibels
        const freqRatio = i / numBars;
        let amplitude = Math.sin(t * 3 + i * 0.4) * 0.4 + 0.5;

        // Simulate glass break spike in higher frequencies (70% - 90% range)
        if (acousticEvent === 'GLASS_FRACTURE_CONFIRMED' && i > 32 && i < 44) {
          amplitude = Math.min(1.0, amplitude * 2.5);
        } else if (acousticShieldActive) {
          amplitude = Math.random() * 0.9 + 0.1;
        }

        const barHeight = Math.max(4, amplitude * (height * 0.8) * (decibelLevel / 100));
        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        let barColor = '#00e5ff';
        if (acousticShieldActive || decibelLevel > 80) {
          barColor = '#ff003c';
        } else if (decibelLevel > 60) {
          barColor = '#ffb800';
        }

        ctx.fillStyle = barColor;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [decibelLevel, acousticEvent, acousticShieldActive]);

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-lg p-4 font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyber-cyan" />
          <span className="text-xs font-semibold text-gray-400">ACOUSTIC SENTINEL & INTERCOM SPECTRUM</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">MIC GAIN:</span>
          <span className={`text-xs font-bold ${decibelLevel > 75 ? 'text-cyber-red' : 'text-cyber-green'}`}>
            {decibelLevel.toFixed(1)} dB
          </span>
        </div>
      </div>

      <div className="my-3 rounded overflow-hidden border border-cyber-border/70">
        <canvas ref={canvasRef} width={500} height={70} className="w-full h-16 object-cover" />
      </div>

      <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyber-green inline-block animate-pulse" />
          <span>DSP Event: <strong className="text-gray-200">{acousticEvent || 'NOMINAL_BASELINE'}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[10px] text-gray-400 bg-cyber-dark px-2 py-0.5 rounded border border-cyber-border">
            BASELINE NOISE FLOOR: <strong className="text-cyber-cyan">{noiseFloorDb.toFixed(1)} dB</strong>
          </div>

          {acousticShieldActive && (
            <span className="text-cyber-red font-bold flex items-center gap-1 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" /> ACOUSTIC SHIELD ACTIVE
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
