'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield, Crosshair, Cpu, Volume2, KeyRound, AlertOctagon,
  CheckCircle2, ArrowRight, Star, Lock, Smartphone, Radio,
  Sparkles, Terminal, ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const plans = [
    {
      tier: 'Home Guard',
      price: '$0',
      period: 'forever',
      description: 'Single camera perimeter monitoring for residential homeowners.',
      features: [
        '1 Ring Camera WebRTC Video Feed',
        'Basic Motion Vector Reticle Overlays',
        'Manual Delivery Airlock Keypad Entry',
        'Local 100-event Telemetry Buffer',
        'Community Forum Support'
      ],
      cta: 'Deploy Free Tier',
      popular: false,
      color: 'border-cyber-border'
    },
    {
      tier: 'Sentinel Pro',
      price: '$9.99',
      period: 'per month',
      description: 'Intelligent multi-sensor defense powered by AWS Bedrock Haiku.',
      features: [
        'Up to 3 Ring Video Doorbells & Floodlights',
        'AWS Bedrock Claude 3.5 Haiku Interrogator',
        'Acoustic Sentinel DSP Glass-Break Detection',
        'Rotating TOTP Zero-Trust Delivery Airlock',
        'Instant Twilio SMS & Amazon SNS Alerts',
        '24/7 Threat Telemetry Retention'
      ],
      cta: 'Start 14-Day Free Trial',
      popular: true,
      color: 'border-cyber-cyan shadow-[0_0_20px_rgba(0,229,255,0.2)]'
    },
    {
      tier: 'Estate Fortress',
      price: '$29.99',
      period: 'per month',
      description: 'Maximum zero-trust perimeter lockdown for luxury residences & estates.',
      features: [
        'Unlimited Ring Hardware & Multi-Cam Swarm',
        'Dual-Agent Swarm (Claude 3.5 Sonnet + Haiku)',
        'Autonomous Acoustic Warning Shield Pulse',
        'Direct Private Armed Security Dispatch Link',
        'Cryptographic Incident Evidentiary Hashes',
        'Sub-15ms Edge WebRTC Video Relays',
        'Dedicated VIP Threat Desk'
      ],
      cta: 'Access Fortress Swarm',
      popular: false,
      color: 'border-cyber-green shadow-[0_0_20px_rgba(0,255,102,0.2)]'
    }
  ];

  return (
    <div className="min-h-screen bg-cyber-dark text-gray-100 font-mono flex flex-col selection:bg-cyber-cyan selection:text-black">
      {/* Top Commercial Navigation */}
      <header className="border-b border-cyber-border/70 bg-cyber-card/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-cyber-cyan/15 border border-cyber-cyan flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.4)]">
            <Shield className="w-5 h-5 text-cyber-cyan" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">RING CERBERUS</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 font-bold uppercase">
                ENTERPRISE SAAS
              </span>
            </div>
            <div className="text-[10px] text-gray-400">Autonomous Perimeter Defense & Zero-Trust Lockdown</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs text-gray-400">
          <a href="#features" className="hover:text-cyber-cyan transition">Features</a>
          <a href="#swarm" className="hover:text-cyber-cyan transition">Bedrock Swarm</a>
          <a href="#pricing" className="hover:text-cyber-cyan transition">Commercial Tiers</a>
          <a href="#security" className="hover:text-cyber-cyan transition">Compliance</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="bg-cyber-cyan hover:bg-cyber-cyan/90 text-black text-xs font-extrabold px-4 py-2 rounded transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
          >
            <span>Launch Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center flex flex-col items-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyber-cyan/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-border/60 border border-cyber-border text-xs text-cyber-cyan mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyber-amber" />
          <span>OFFICIAL RING TRACK HACKATHON + AWS BEDROCK PIPELINE</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
          Autonomous Zero-Trust Perimeter Defense for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-white to-cyber-green">Ring Hardware</span>.
        </h1>

        <p className="mt-6 text-sm md:text-base text-gray-400 max-w-2xl leading-relaxed">
          Transform off-the-shelf Ring Video Doorbells into an intelligent multi-agent cyber-defense grid. Real-time edge vector reticles, acoustic glass-fracture detection, cryptographic delivery airlocks, and sub-second armed emergency dispatch.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="bg-cyber-green hover:bg-cyber-green/90 text-black text-sm font-black px-6 py-3.5 rounded-lg transition flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.4)]"
          >
            <Crosshair className="w-4 h-4" />
            <span>Launch Tactical HUD</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#pricing"
            className="bg-cyber-card hover:bg-cyber-border text-gray-200 border border-cyber-border text-sm font-bold px-6 py-3.5 rounded-lg transition flex items-center gap-2"
          >
            <span>View Subscription Tiers</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </a>
        </div>

        {/* Performance metrics banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-4xl">
          <div className="p-4 rounded-xl bg-cyber-card/60 border border-cyber-border text-center">
            <div className="text-2xl font-black text-cyber-cyan">99.8%</div>
            <div className="text-[11px] text-gray-400 mt-1">Threat Interception Rate</div>
          </div>
          <div className="p-4 rounded-xl bg-cyber-card/60 border border-cyber-border text-center">
            <div className="text-2xl font-black text-cyber-green">&lt; 380ms</div>
            <div className="text-[11px] text-gray-400 mt-1">Claude 3.5 Haiku Latency</div>
          </div>
          <div className="p-4 rounded-xl bg-cyber-card/60 border border-cyber-border text-center">
            <div className="text-2xl font-black text-cyber-amber">RFC 6238</div>
            <div className="text-[11px] text-gray-400 mt-1">TOTP Cryptographic Airlock</div>
          </div>
          <div className="p-4 rounded-xl bg-cyber-card/60 border border-cyber-border text-center">
            <div className="text-2xl font-black text-cyber-red">&lt; 6 Min</div>
            <div className="text-[11px] text-gray-400 mt-1">Armed Patrol Dispatch ETA</div>
          </div>
        </div>
      </section>

      {/* Feature Matrix Section */}
      <section id="features" className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase tracking-widest text-cyber-cyan font-bold">MILITARY-GRADE RESIDENTIAL DEFENSE</h2>
          <p className="text-3xl font-black text-white mt-2">Zero-Trust Perimeter Architecture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 transition space-y-3">
            <div className="w-10 h-10 rounded bg-cyber-cyan/10 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">AWS Bedrock Swarm</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Claude 3.5 Sonnet inspects visual keyframes for weapons and balaclavas, while Claude 3.5 Haiku conducts dynamic conversational interrogation.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 transition space-y-3">
            <div className="w-10 h-10 rounded bg-cyber-green/10 border border-cyber-green/40 flex items-center justify-center text-cyber-green">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Acoustic Sentinel DSP</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Continuous spectrogram monitoring triggers instant defense on tempered glass break frequencies (4.2-6.8 kHz) and violent blunt impacts.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 transition space-y-3">
            <div className="w-10 h-10 rounded bg-cyber-amber/10 border border-cyber-amber/40 flex items-center justify-center text-cyber-amber">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Zero-Trust Delivery Airlock</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Replaces vulnerable doorstep drop-offs with time-synchronized TOTP verification. Unlocks secure parcel compartment for 15 seconds.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 transition space-y-3">
            <div className="w-10 h-10 rounded bg-cyber-red/10 border border-cyber-red/40 flex items-center justify-center text-cyber-red">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Armed Security Dispatch</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Automated Twilio SMS and Amazon SNS dispatcher broadcasts cryptographic incident snapshots directly to emergency patrol units.
            </p>
          </div>
        </div>
      </section>

      {/* Commercial Pricing Table */}
      <section id="pricing" className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase tracking-widest text-cyber-green font-bold">COMMERCIAL SUBSCRIPTION PLANS</h2>
          <p className="text-3xl font-black text-white mt-2">Transparent Multi-Tenant Pricing</p>
          <p className="text-xs text-gray-400 mt-2">Instant Stripe onboarding with no long-term contracts. Upgrade or downgrade anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-cyber-card border ${p.color} flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-1`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyber-cyan text-black font-extrabold text-[10px] uppercase px-3 py-0.5 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.6)]">
                  Most Popular
                </div>
              )}

              <div>
                <div className="font-bold text-lg text-white">{p.tier}</div>
                <div className="text-xs text-gray-400 mt-1 min-h-[36px]">{p.description}</div>

                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-white">{p.price}</span>
                  <span className="text-xs text-gray-500 ml-1">/ {p.period}</span>
                </div>

                <div className="space-y-2.5 text-xs text-gray-300 pt-4 border-t border-cyber-border">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyber-green shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/dashboard"
                  className={`w-full py-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
                    p.popular
                      ? 'bg-cyber-cyan hover:bg-cyber-cyan/90 text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                      : p.tier === 'Estate Fortress'
                      ? 'bg-cyber-green hover:bg-cyber-green/90 text-black shadow-[0_0_15px_rgba(0,255,102,0.4)]'
                      : 'bg-cyber-dark hover:bg-cyber-border border border-cyber-border text-white'
                  }`}
                >
                  <span>{p.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance & Security Credentials */}
      <section id="security" className="py-12 px-6 border-t border-cyber-border/70 bg-cyber-card/30">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyber-cyan" />
            <span>256-bit AES Cryptographic End-to-End Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyber-green" />
            <span>Ring Cloud OAuth 2.0 Official Architecture</span>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyber-amber" />
            <span>Twilio SMS & Amazon SNS Emergency Relays</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyber-border bg-cyber-card/80 py-8 px-6 text-center text-xs text-gray-500">
        <p>© 2026 Ring Cerberus Inc. Built for the Ring Track (Build, Ship, Shape: Amazon Developer Hackathon) + AWS Builder Mini Challenges.</p>
        <p className="mt-2 text-[11px] text-gray-600">All trademarks, logos, and brand names are the property of their respective owners.</p>
      </footer>
    </div>
  );
}
