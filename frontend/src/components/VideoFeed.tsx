'use client';

import React, { useRef, useEffect, useState } from 'react';
import { BoundingBox, ThreatLevel } from '@/types/telemetry';
import { ShieldAlert, Video, Eye, Radio } from 'lucide-react';

interface VideoFeedProps {
  threatLevel: ThreatLevel;
  targets: BoundingBox[];
  lockdownActive: boolean;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  threatLevel,
  targets,
  lockdownActive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setTimeString(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frameCount = 0;

    const render = () => {
      frameCount++;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Simulated Porch / Threshold Scene Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0a101f');
      bgGrad.addColorStop(0.6, '#0f172a');
      bgGrad.addColorStop(1, '#050b14');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Floor perspective grid lines
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 1;
      const horizon = height * 0.55;
      for (let i = -width; i < width * 2; i += 60) {
        ctx.beginPath();
        ctx.moveTo(width / 2, horizon);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let y = horizon; y < height; y += (height - y) * 0.28 + 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Entrance Doorway Silhouette
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.2)';
      ctx.strokeRect(width * 0.35, height * 0.2, width * 0.3, height * 0.65);
      
      // Door handle / airlock compartment
      ctx.fillStyle = lockdownActive ? 'rgba(255, 0, 60, 0.7)' : 'rgba(0, 255, 102, 0.4)';
      ctx.fillRect(width * 0.61, height * 0.52, 14, 18);

      // 2. Scanline effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let i = 0; i < height; i += 4) {
        ctx.fillRect(0, i, width, 2);
      }

      // 3. Draw Bounding Boxes with Vector Reticles
      const isPoacherScenario = targets.some((t) => t.label.toLowerCase().includes('poacher'));
      const flashOrange = Math.sin(frameCount * 0.25) > 0 ? '#ff7700' : '#ffaa00';
      const flashRed = Math.sin(frameCount * 0.3) > 0 ? '#ff003c' : '#990022';

      const defaultBoxColor = lockdownActive || threatLevel === 'ALERT'
        ? (isPoacherScenario ? flashOrange : '#ff003c')
        : threatLevel === 'SUSPICIOUS'
        ? '#ffb800'
        : '#00e5ff';

      targets.forEach((target) => {
        const x = target.xmin * width;
        const y = target.ymin * height;
        const w = (target.xmax - target.xmin) * width;
        const h = (target.ymax - target.ymin) * height;

        const isPoacherTarget = target.label.toLowerCase().includes('poacher');
        const isArmedTarget = target.label.toLowerCase().includes('armed') || target.label.toLowerCase().includes('crowbar');

        let strokeColor = defaultBoxColor;
        let fillColor = 'rgba(0, 229, 255, 0.08)';

        if (isPoacherTarget) {
          strokeColor = flashOrange;
          fillColor = 'rgba(255, 119, 0, 0.22)';
        } else if (isArmedTarget || (target.threat_flag && lockdownActive)) {
          strokeColor = flashRed;
          fillColor = 'rgba(255, 0, 60, 0.25)';
        } else if (target.threat_flag) {
          strokeColor = '#ff003c';
          fillColor = 'rgba(255, 0, 60, 0.15)';
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = target.threat_flag ? 3 : 2;
        ctx.fillStyle = fillColor;

        // Fill bounding region
        ctx.fillRect(x, y, w, h);

        // Corner brackets
        const bracketSize = Math.min(18, w * 0.25, h * 0.25);
        ctx.lineWidth = 3;
        
        // Top-left
        ctx.beginPath();
        ctx.moveTo(x, y + bracketSize);
        ctx.lineTo(x, y);
        ctx.lineTo(x + bracketSize, y);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(x + w - bracketSize, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + bracketSize);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(x, y + h - bracketSize);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + bracketSize, y + h);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x + w - bracketSize, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w, y + h - bracketSize);
        ctx.stroke();

        // Label banner
        ctx.fillStyle = target.threat_flag ? 'rgba(255, 0, 60, 0.85)' : 'rgba(11, 18, 32, 0.85)';
        ctx.fillRect(x, y - 24, Math.max(120, w * 0.7), 22);

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px ui-monospace, monospace';
        ctx.fillText(
          `${target.label} [${Math.round(target.confidence * 100)}%]`,
          x + 6,
          y - 8
        );
      });

      // 4. Center Crosshair Reticle
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.4)';
      ctx.lineWidth = 1;
      const cx = width / 2;
      const cy = height / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy);
      ctx.lineTo(cx - 6, cy);
      ctx.moveTo(cx + 6, cy);
      ctx.lineTo(cx + 20, cy);
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx, cy - 6);
      ctx.moveTo(cx, cy + 6);
      ctx.lineTo(cx, cy + 20);
      ctx.stroke();

      // 5. Emergency Strobe Overlay
      if (lockdownActive) {
        const strobeAlpha = Math.sin(frameCount * 0.2) * 0.2 + 0.2;
        ctx.fillStyle = `rgba(255, 0, 60, ${strobeAlpha})`;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ff003c';
        ctx.font = 'bold 24px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CRITICAL LOCKDOWN ENGAGED', width / 2, height * 0.15);
        ctx.textAlign = 'left';
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [threatLevel, targets, lockdownActive]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-cyber-border shadow-2xl">
      {/* Canvas Video / HUD Layer */}
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="w-full h-full object-cover"
      />

      {/* Top HUD Bar */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-xs font-mono pointer-events-none">
        <div className="flex items-center gap-2 bg-cyber-card/80 backdrop-blur px-2.5 py-1 rounded border border-cyber-border text-cyber-cyan">
          <Video className="w-3.5 h-3.5 text-cyber-green animate-pulse" />
          <span>RING-PRO2 // CAM-01 FRONT PERIMETER</span>
          <span className="text-gray-400">| 1080P 30FPS</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-cyber-card/80 backdrop-blur px-2.5 py-1 rounded border border-cyber-border">
            <Radio className="w-3.5 h-3.5 text-cyber-green animate-ping" />
            <span className="text-cyber-green font-semibold">LIVE WEBRTC</span>
          </div>

          <div className="bg-cyber-card/80 backdrop-blur px-2.5 py-1 rounded border border-cyber-border text-gray-300">
            TARGETS: <span className="text-white font-bold">{targets.length}</span>
          </div>
        </div>
      </div>

      {/* Bottom HUD Bar */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono pointer-events-none">
        <div className="flex items-center gap-2 bg-cyber-card/80 backdrop-blur px-2 py-1 rounded border border-cyber-border text-gray-300">
          <Eye className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>BEDROCK VISION SWARM: ACTIVE</span>
        </div>

        <div
          suppressHydrationWarning
          className="bg-cyber-card/80 backdrop-blur px-2 py-1 rounded border border-cyber-border text-cyber-cyan min-w-[190px] text-center"
        >
          {mounted ? timeString : 'SYNCING PERIMETER CLOCK...'}
        </div>
      </div>
    </div>
  );
};
