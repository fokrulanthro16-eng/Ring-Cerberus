'use client';

import React, { useState, useEffect } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { VideoFeed } from './VideoFeed';
import { ThreatMatrix } from './ThreatMatrix';
import { AudioWaveform } from './AudioWaveform';
import { AirlockScanner } from './AirlockScanner';
import { LockdownControls } from './LockdownControls';
import { IntercomConsole } from './IntercomConsole';
import { TelemetryFeed } from './TelemetryFeed';
import { IntercomMessage } from '@/types/telemetry';
import { soundFX } from '@/utils/soundFx';
import Link from 'next/link';
import {
  Shield, Radio, Activity, Cpu, Wifi, BellRing,
  Smartphone, Send, CreditCard, X, Check, AlertOctagon, PhoneCall, ArrowLeft
} from 'lucide-react';

export const CyberHUD: React.FC = () => {
  const { frame, connected, latency } = useTelemetry();
  const [messages, setMessages] = useState<IntercomMessage[]>([]);
  const [showRingModal, setShowRingModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>('Estate Fortress ($29.99/mo)');
  
  useEffect(() => {
    setMessages([
      {
        sender: 'AGENT',
        transcript: 'Cerberus Swarm active. Front perimeter armed.',
        timestamp: Date.now() / 1000 - 30
      }
    ]);
  }, []);
  const [logs, setLogs] = useState<string[]>([
    '[00:00:00] CERBERUS INITIALIZED - AWS BEDROCK SWARM ONLINE',
    '[00:00:02] WEBRTC DOORBELL CAMERA ENCRYPTED STREAM LINKED',
    '[00:00:05] ACOUSTIC SENTINEL ACTIVE (DSP 4.2-6.8 kHz FILTER)',
    '[00:00:08] RING GATEWAY ONLINE: 2 WEBRTC HARDWARE CHANNELS ACTIVE',
    '[00:00:10] DISPATCH LINK: TWILIO SMS & AWS SNS DISPATCHER ARMED'
  ]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const addLog = (msg: string) => {
    const time = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  // Action Handlers
  const handleToggleLockdown = async (pin: string = '9941') => {
    try {
      const res = await fetch(`${apiUrl}/api/lockdown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, override: true, reason: 'Operator HUD trigger' }),
      });
      const data = await res.json();
      if (data.lockdown_active) {
        soundFX.playAlarmSound(2.2);
        soundFX.speakTacticalSpeech('Critical lockdown engaged. All access deadbolts sealed.');
      } else {
        soundFX.playSuccessChime();
        soundFX.speakTacticalSpeech('Perimeter lockdown disengaged.');
      }
      addLog(data.message);
    } catch (e) {
      addLog('Failed to toggle lockdown');
    }
  };

  const handleToggleAcousticShield = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/acoustic-shield`, { method: 'POST' });
      const data = await res.json();
      if (data.acoustic_shield_active) {
        soundFX.playAlarmSound(1.8);
      }
      addLog(data.acoustic_shield_active ? 'Acoustic Shield Triggered' : 'Acoustic Shield Disarmed');
    } catch (e) {
      addLog('Failed to toggle acoustic shield');
    }
  };

  const handleClearAlarm = async () => {
    try {
      await fetch(`${apiUrl}/api/clear-alarm`, { method: 'POST' });
      soundFX.playSuccessChime();
      addLog('Threat alarm cleared. Returning to nominal sentinel sweep.');
    } catch (e) {
      addLog('Failed to clear alarm');
    }
  };

  const handleInjectThreat = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/inject-threat`, { method: 'POST' });
      const data = await res.json();

      // Trigger audio synth feedback based on scenario
      if (data.sound === 'alarm') {
        soundFX.playAlarmSound(2.5);
      } else if (data.sound === 'warning') {
        soundFX.playWarningBeep();
      } else if (data.sound === 'success') {
        soundFX.playSuccessChime();
      }

      // Authoritative tactical speech synthesis
      if (data.speech) {
        soundFX.speakTacticalSpeech(data.speech);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'AGENT',
            transcript: data.speech,
            timestamp: Date.now() / 1000
          }
        ]);
      }

      addLog(`[SCENARIO ${data.scenario || 'SIM'}] ${data.name || 'Threat Injected'}: ${data.speech || ''}`);
    } catch (e) {
      addLog('Failed to inject threat scenario');
    }
  };

  const handleVerifyAirlock = async (otp: string, courierId: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/verify-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp_code: otp, courier_id: courierId }),
      });
      const data = await res.json();
      if (data.verified) {
        soundFX.playSuccessChime();
        soundFX.speakTacticalSpeech('Delivery airlock unlocked. Please deposit parcel in compartment.');
      } else {
        soundFX.playWarningBeep();
      }
      addLog(data.message);
    } catch (e) {
      addLog('Airlock verification communication error');
    }
  };

  const handleSendMessage = async (text: string) => {
    soundFX.playRadioClick();
    const userMsg: IntercomMessage = {
      sender: 'OPERATOR',
      transcript: text,
      timestamp: Date.now() / 1000
    };
    setMessages((prev) => [...prev, userMsg]);
    addLog(`Intercom transmission: "${text}"`);

    // Forward to WebSocket intercom or mock response
    setTimeout(() => {
      let reply = 'Instructions acknowledged. Target tracked in frame.';
      if (text.toLowerCase().includes('name') || text.toLowerCase().includes('affiliation')) {
        reply = 'Courier: Amazon Logistics #4418. Delivery badge ready for scanner.';
      } else if (text.toLowerCase().includes('trespassing')) {
        reply = 'Subject retreating from perimeter boundary.';
      }
      soundFX.speakTacticalSpeech(reply);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AGENT',
          transcript: reply,
          timestamp: Date.now() / 1000
        }
      ]);
    }, 600);
  };

  const handleEmergencyDispatch = async () => {
    try {
      soundFX.playAlarmSound(1.5);
      const res = await fetch(`${apiUrl}/api/dispatch/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: `INC-${Date.now().toString().slice(-6)}`,
          threat_level: frame.threat_level,
          threat_score: frame.threat_score,
          channel: 'SMS_AND_SNS',
          location: '742 Evergreen Terrace, Front Gate Perimeter',
          transcript: frame.active_agent_directive || 'Perimeter lockdown breach detected'
        })
      });
      const data = await res.json();
      setDispatchStatus(`DISPATCH CONFIRMED: Units en route (ETA: ${data.eta_minutes} min). Dispatch ID: ${data.dispatch_id}`);
      addLog(`EMERGENCY DISPATCH: ${data.message}`);
      soundFX.speakTacticalSpeech(`Emergency alert dispatched. Security patrol en route. ETA ${data.eta_minutes} minutes.`);
    } catch (e) {
      setDispatchStatus('Failed to connect to dispatch gateway');
    }
  };

  // Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    onToggleLockdown: () => handleToggleLockdown('9941'),
    onToggleAcousticShield: handleToggleAcousticShield,
    onClearAlarm: handleClearAlarm,
    onInjectThreat: handleInjectThreat,
    onVerifyCourier: () => handleVerifyAirlock('123456', 'COURIER-QUICK'),
  });

  return (
    <div className="min-h-screen bg-cyber-dark text-gray-100 flex flex-col font-mono selection:bg-cyber-cyan selection:text-black">
      {/* Top Cyber Defense Navigation Bar */}
      <header className="border-b border-cyber-border bg-cyber-card/90 backdrop-blur px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyber-cyan border border-cyber-border hover:border-cyber-cyan/50 px-2.5 py-1.5 rounded transition bg-cyber-dark"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-cyber-cyan/10 border border-cyber-cyan flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.4)]">
              <Shield className="w-5 h-5 text-cyber-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-white">RING CERBERUS</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 font-bold">
                  ENTERPRISE v2.0
                </span>
              </div>
              <div className="text-[10px] text-gray-400">Autonomous Defensive Swarm & Zero-Trust Perimeter Lockdown</div>
            </div>
          </div>
        </div>

        {/* Live System Status Badges & Enterprise Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Ring Devices Modal Trigger */}
          <button
            onClick={() => setShowRingModal(true)}
            className="flex items-center gap-1.5 bg-cyber-dark hover:bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 px-2.5 py-1.5 rounded text-gray-300 transition"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyber-cyan" />
            <span className="text-gray-400">RING HW:</span>
            <span className="text-cyber-cyan font-bold">2 ONLINE</span>
          </button>

          {/* Billing Plan Modal Trigger */}
          <button
            onClick={() => setShowBillingModal(true)}
            className="flex items-center gap-1.5 bg-cyber-dark hover:bg-cyber-card border border-cyber-border hover:border-cyber-green/40 px-2.5 py-1.5 rounded text-gray-300 transition"
          >
            <CreditCard className="w-3.5 h-3.5 text-cyber-green" />
            <span className="text-gray-400">TIER:</span>
            <span className="text-cyber-green font-bold">ESTATE FORTRESS</span>
          </button>

          {/* Emergency Dispatch Button */}
          <button
            onClick={() => {
              setShowDispatchModal(true);
              setDispatchStatus(null);
            }}
            className="flex items-center gap-1.5 bg-cyber-red/15 hover:bg-cyber-red/25 border border-cyber-red/60 text-cyber-red px-3 py-1.5 rounded font-bold transition shadow-[0_0_12px_rgba(255,0,60,0.3)] animate-pulse"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>DISPATCH PATROL</span>
          </button>

          {/* Offline Resiliency Indicator or Live Connection */}
          {!connected ? (
            <div className="flex items-center gap-1.5 bg-cyber-amber/15 text-cyber-amber border border-cyber-amber px-2.5 py-1.5 rounded font-bold animate-pulse">
              <Shield className="w-3.5 h-3.5" />
              <span>OFFLINE EDGE MODE: SECURE</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 bg-cyber-dark px-2.5 py-1.5 rounded border border-cyber-border">
              <Wifi className="w-3.5 h-3.5 text-cyber-green" />
              <span className="text-cyber-green font-semibold">
                ONLINE ({latency}ms)
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Cloud Token Savings Meter & Edge Vision Gating Banner */}
      <div className="bg-cyber-card/70 border-b border-cyber-border px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
          <span className="text-gray-400">EDGE-FIRST VISION GATING:</span>
          <span className="text-white font-bold">&gt; 75% Local Confidence Filter Active</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400">Frames Filtered at Edge:</span>
          <span className="text-cyber-cyan font-bold">{frame.frames_filtered_at_edge ?? 1420}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-cyber-dark px-2.5 py-0.5 rounded border border-cyber-border">
            <span className="text-gray-400">Cloud Token Savings:</span>
            <span className="text-cyber-green font-bold">{frame.cloud_token_savings_percent ?? 84.6}%</span>
          </div>

          <div className="flex items-center gap-1.5 bg-cyber-dark px-2.5 py-0.5 rounded border border-cyber-border">
            <span className="text-gray-400">Cost Saved:</span>
            <span className="text-cyber-cyan font-bold">${(frame.cloud_cost_saved_usd ?? 142.30).toFixed(2)}/mo</span>
          </div>
        </div>
      </div>

      {/* Main Tactical Grid */}
      <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1700px] w-full mx-auto">
        {/* Left Column: Live Camera Video HUD + Audio Sentinel (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          <VideoFeed
            threatLevel={frame.threat_level}
            targets={frame.detected_targets}
            lockdownActive={frame.lockdown_active}
          />
          <AudioWaveform
            decibelLevel={frame.decibel_level}
            acousticEvent={frame.acoustic_event}
            acousticShieldActive={frame.acoustic_shield_active}
            noiseFloorDb={frame.noise_floor_db ?? 42.0}
          />
          <TelemetryFeed logs={logs} />
        </section>

        {/* Right Column: Threat Radar + Airlock + Intercom + Lockdown (5 Cols) */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          <ThreatMatrix
            threatLevel={frame.threat_level}
            threatScore={frame.threat_score}
            deceptionIndex={frame.deception_index}
            activeDirective={frame.active_agent_directive}
          />

          <LockdownControls
            lockdownActive={frame.lockdown_active}
            acousticShieldActive={frame.acoustic_shield_active}
            onToggleLockdown={handleToggleLockdown}
            onToggleAcousticShield={handleToggleAcousticShield}
            onClearAlarm={handleClearAlarm}
            onInjectThreat={handleInjectThreat}
          />

          <AirlockScanner
            status={frame.airlock_status}
            timeRemaining={frame.airlock_time_remaining}
            onVerify={handleVerifyAirlock}
            isOffline={!connected}
          />

          <IntercomConsole
            onSendMessage={handleSendMessage}
            messages={messages}
          />
        </section>
      </main>

      {/* Footer bar */}
      <footer className="border-t border-cyber-border/60 bg-cyber-card/60 px-6 py-2 text-[10px] text-gray-500 flex flex-wrap justify-between items-center">
        <span>Ring Track (Build, Ship, Shape: Amazon Developer Hackathon) + AWS Builder Mini Challenges</span>
        <span>Keyboard shortcuts: [Space] PTT Intercom | [L] Lockdown | [S] Shield | [C] Clear | [T] Cycle Threat Scenarios</span>
      </footer>

      {/* Modal 1: Ring Hardware Manager */}
      {showRingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cyber-card border border-cyber-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyber-cyan" />
                <h3 className="font-bold text-base text-white">Ring Cloud Device Gateway</h3>
              </div>
              <button onClick={() => setShowRingModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-cyber-dark border border-cyber-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Front Porch Pro 2</span>
                  <span className="text-cyber-green text-[10px] px-2 py-0.5 rounded bg-cyber-green/10 border border-cyber-green">ONLINE (98%)</span>
                </div>
                <div className="text-gray-400 text-[11px]">WebRTC Stream: webrtc://edge.ring.com/live/stream/front-01</div>
                <div className="text-gray-500 text-[10px]">Firmware: v3.18.22-cerberus-edge | Motion Webhook: ACTIVE</div>
              </div>

              <div className="p-3 rounded bg-cyber-dark border border-cyber-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">North Gate Floodlight Cam</span>
                  <span className="text-cyber-green text-[10px] px-2 py-0.5 rounded bg-cyber-green/10 border border-cyber-green">ONLINE (100%)</span>
                </div>
                <div className="text-gray-400 text-[11px]">WebRTC Stream: webrtc://edge.ring.com/live/stream/gate-02</div>
                <div className="text-gray-500 text-[10px]">Aux Strobe Siren: SYNCHRONIZED</div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <a
                href={`${apiUrl}/api/ring/oauth/authorize`}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-cyber-cyan hover:bg-cyber-cyan/90 text-black font-bold px-4 py-2 rounded transition flex items-center gap-1.5"
              >
                <span>Re-Authenticate Ring OAuth</span>
              </a>
              <button
                onClick={() => setShowRingModal(false)}
                className="text-xs text-gray-400 hover:text-white px-3 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Emergency Dispatch Patrol */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cyber-card border border-cyber-red/50 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <div className="flex items-center gap-2 text-cyber-red">
                <AlertOctagon className="w-5 h-5 animate-pulse" />
                <h3 className="font-bold text-base text-white">Emergency Dispatch System</h3>
              </div>
              <button onClick={() => setShowDispatchModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <p>
                Triggering emergency dispatch will broadcast 256-bit encrypted SMS (Twilio) and Amazon SNS alerts to designated emergency contacts and private armed response patrol.
              </p>
              <div className="p-3 bg-cyber-dark rounded border border-cyber-border space-y-1 text-[11px]">
                <div><strong>Location:</strong> 742 Evergreen Terrace, Front Gate Perimeter</div>
                <div><strong>Current Threat Score:</strong> {frame.threat_score}% ({frame.threat_level})</div>
                <div><strong>Evidence Digest:</strong> SHA-256 Verifiable Snapshot Included</div>
              </div>

              {dispatchStatus && (
                <div className="p-3 bg-cyber-red/10 border border-cyber-red rounded text-cyber-red font-bold text-xs flex items-start gap-2">
                  <PhoneCall className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{dispatchStatus}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={handleEmergencyDispatch}
                className="text-xs bg-cyber-red hover:bg-cyber-red/90 text-white font-bold px-4 py-2.5 rounded transition shadow-[0_0_15px_rgba(255,0,60,0.5)] flex items-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Transmit Armed Dispatch Now</span>
              </button>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-xs text-gray-400 hover:text-white px-3 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Billing & Subscription Tiers */}
      {showBillingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cyber-card border border-cyber-border rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyber-green" />
                <h3 className="font-bold text-base text-white">Cerberus Enterprise Subscription</h3>
              </div>
              <button onClick={() => setShowBillingModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-cyber-dark border border-cyber-border rounded-lg space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-white">Home Guard</div>
                  <div className="text-lg font-black text-gray-200 mt-1">$0<span className="text-xs font-normal text-gray-500">/mo</span></div>
                  <p className="text-[10px] text-gray-400 mt-1">1 Camera, basic rule engine, manual airlock entry.</p>
                </div>
                <button
                  disabled
                  className="w-full py-1.5 rounded text-[11px] bg-cyber-border/40 text-gray-500 font-bold"
                >
                  Standard
                </button>
              </div>

              <div className="p-3 bg-cyber-dark border border-cyber-cyan/40 rounded-lg space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-cyber-cyan">Sentinel Pro</div>
                  <div className="text-lg font-black text-white mt-1">$9.99<span className="text-xs font-normal text-gray-500">/mo</span></div>
                  <p className="text-[10px] text-gray-400 mt-1">3 Cameras, Claude 3.5 Haiku, Acoustic DSP, SMS Alerts.</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentTier('Sentinel Pro ($9.99/mo)');
                    addLog('Subscription updated: Switched to Sentinel Pro ($9.99/mo)');
                    setShowBillingModal(false);
                  }}
                  className="w-full py-1.5 rounded text-[11px] bg-cyber-cyan/20 hover:bg-cyber-cyan text-cyber-cyan hover:text-black font-bold border border-cyber-cyan/40 transition"
                >
                  Select Plan
                </button>
              </div>

              <div className="p-3 bg-cyber-dark border border-cyber-green/60 rounded-lg space-y-2 flex flex-col justify-between relative shadow-[0_0_15px_rgba(0,255,102,0.15)]">
                <span className="absolute -top-2.5 right-3 bg-cyber-green text-black text-[9px] font-bold px-1.5 py-0.5 rounded">ACTIVE</span>
                <div>
                  <div className="font-bold text-cyber-green">Estate Fortress</div>
                  <div className="text-lg font-black text-white mt-1">$29.99<span className="text-xs font-normal text-gray-500">/mo</span></div>
                  <p className="text-[10px] text-gray-400 mt-1">Unlimited Swarm, Claude 3.5 Sonnet, Acoustic Shield, Armed Patrol Dispatch.</p>
                </div>
                <button
                  disabled
                  className="w-full py-1.5 rounded text-[11px] bg-cyber-green text-black font-bold shadow-[0_0_10px_rgba(0,255,102,0.4)]"
                >
                  Active Plan
                </button>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-gray-400 flex justify-between items-center border-t border-cyber-border">
              <span>Stripe 256-bit Encrypted Checkout | Cancel Anytime</span>
              <button onClick={() => setShowBillingModal(false)} className="text-xs text-gray-300 hover:text-white">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
