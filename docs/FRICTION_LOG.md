# Developer Friction Log & Hardware Integration Learnings

This document captures real-world engineering friction points, architecture trade-offs, and solutions identified while building Ring Cerberus for the Ring Hackathon and AWS Builder challenges.

---

## Friction Point 1: Ring Real-Time Stream Latency vs Bedrock Vision Frame Rate
- **Problem**: Raw WebRTC Ring video streams run at 1080p 30fps. Sending full 30fps video directly to LLM vision models causes severe latency spikes, rate limit exhaustion, and excessive cloud token burn.
- **Solution**: Implemented an edge keyframe downsampler & motion vector gate in FastAPI. Full frames are only forwarded to AWS Bedrock Claude 3.5 Sonnet when motion vectors or acoustic threshold triggers breach $\Delta > 18\%$. Local canvas overlays run at 60fps using lightweight client-side edge bounding interpolation.

---

## Friction Point 2: Full-Duplex Intercom Audio Echo & Barge-In
- **Problem**: When the AI interrogator (Amazon Polly voice) speaks over the Ring doorbell speaker, the doorbell microphone captures the playback, causing recursive feedback loops in the acoustic sentinel.
- **Solution**: Implemented an Acoustic Echo Cancellation (AEC) ducking state machine in `audio_sentinel.py`. When an automated Polly speech buffer is active, acoustic classification sensitivity in the speaker output band is attenuated by $24\text{ dB}$, while high-frequency glass break spikes ($>4\text{ kHz}$) remain unattenuated.

---

## Friction Point 3: Offline Resilience & Zero-Trust Airlock Verification
- **Problem**: If internet connectivity is interrupted during an active delivery, cloud-only verification would trap parcels outside or leave airlocks locked.
- **Solution**: Designed the Airlock verification protocol using time-synchronized TOTP (RFC 6238) with shared secret seeds. Both the courier app / resident app and the local Ring Cerberus gateway calculate deterministic 30-second rotating OTPs locally without requiring synchronous cloud roundtrips.
