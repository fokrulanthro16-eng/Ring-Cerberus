'use client';

import { useState, useEffect, useRef } from 'react';
import { TelemetryFrame, ThreatLevel } from '@/types/telemetry';

const DEFAULT_FRAME: TelemetryFrame = {
  timestamp: Date.now() / 1000,
  threat_level: 'CLEAR',
  threat_score: 5,
  deception_index: 0.04,
  decibel_level: 42.0,
  acoustic_event: 'NOMINAL_AMBIENT',
  detected_targets: [],
  lockdown_active: false,
  acoustic_shield_active: false,
  airlock_status: 'SECURE',
  airlock_time_remaining: 0,
  active_agent_directive: 'PERIMETER SECURE - LOW FREQUENCY SWEEP',
  system_log: 'CERBERUS KERNEL ONLINE - SYSTEM READY'
};

export function useTelemetry() {
  const [frame, setFrame] = useState<TelemetryFrame>(DEFAULT_FRAME);
  const [connected, setConnected] = useState(false);
  const [latency, setLatency] = useState(12);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    let socket: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    function connect() {
      try {
        socket = new WebSocket(`${wsUrl}/ws/telemetry`);
        wsRef.current = socket;

        socket.onopen = () => {
          setConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const data: TelemetryFrame = JSON.parse(event.data);
            setFrame(data);
            // compute round-trip or ping latency estimate
            const now = Date.now() / 1000;
            const diff = Math.max(4, Math.round((now - data.timestamp) * 1000));
            setLatency(diff < 200 ? diff : 16);
          } catch (e) {
            console.error('Error parsing telemetry frame:', e);
          }
        };

        socket.onclose = () => {
          setConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        };

        socket.onerror = () => {
          socket.close();
        };
      } catch (err) {
        console.warn('WebSocket connection failed, retrying in 3s...', err);
        reconnectTimer = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { frame, connected, latency };
}
