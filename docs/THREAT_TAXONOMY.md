# Threat Taxonomy & Defense Escalation Matrix

Ring Cerberus operates on a 5-tier threat escalation ladder, continually calibrating threat probability through multi-modal sensor fusion (Vision, Acoustic, and Cryptographic Airlock telemetry).

---

## 1. Threat Classification Tiers

| Level | Severity | Status Code | Color Code | Typical Indicators | Autonomous Response Protocol |
|---|---|---|---|---|---|
| **0** | **Nominal** | `CLEAR` | `#00FF66` (Neon Green) | Empty perimeter, registered household members, standard wildlife. | Passive sensor monitoring; idle radar sweep. |
| **1** | **Informational** | `MONITOR` | `#00E5FF` (Cyan) | Known delivery van detected on curb, expected visitor approaching. | Activate live HUD overlay; prompt for Airlock TOTP. |
| **2** | **Elevated** | `SUSPICIOUS` | `#FFB800` (Amber) | Loitering > 45s without doorbell press, masked face, obscured hands. | Deploy Haiku Interrogator voice challenge; initiate target tracking. |
| **3** | **Critical Threat** | `ALERT` | `#FF4900` (Orange-Red) | Crowbar / tool brandished, aggressive knocking, invalid OTP repetition. | High-intensity floodlight strobe; audible countdown warning; push dispatch notice. |
| **4** | **Hostile Breach** | `LOCKDOWN` | `#FF003C` (Crimson) | Shattered glass detected, physical lock tampering, violent impact. | Full perimeter lockdown: magnetic deadbolts engage, acoustic warning siren active. |

---

## 2. Deception Index Formulation

The **Deception Index** ($D \in [0.0, 1.0]$) represents the statistical likelihood that an approaching individual is impersonating authorized personnel or masking illicit intent:

$$D = w_1 \cdot V_{\text{mask}} + w_2 \cdot A_{\text{stress}} + w_3 \cdot T_{\text{hesitation}} + w_4 \cdot C_{\text{totp\_fail}}$$

Where:
- $V_{\text{mask}}$: Visual occlusion coefficient ($0.0$ bare face $\rightarrow 1.0$ balaclava / sunglasses + hood).
- $A_{\text{stress}}$: Acoustic vocal tension & micro-tremor score evaluated via audio spectrum.
- $T_{\text{hesitation}}$: Normalized response latency during tactical voice interrogation ($>3.2\text{s} \rightarrow 1.0$).
- $C_{\text{totp\_fail}}$: Cryptographic airlock verification failures ($0.5$ for 1 fail, $1.0$ for $\ge 2$ fails).
- Default weights: $w_1 = 0.35, w_2 = 0.20, w_3 = 0.20, w_4 = 0.25$.

---

## 3. Acoustic Fingerprint Signatures

| Event Signature | Primary Frequency Band | Transient Profile | Decibel Threshold |
|---|---|---|---|
| **Tempered Glass Fracture** | $4.2\text{ kHz} - 6.8\text{ kHz}$ | Fast rise time ($< 5\text{ ms}$), high spectral centroid | $> 82\text{ dB}$ |
| **Pry-bar / Metal Tamper** | $1.8\text{ kHz} - 3.4\text{ kHz}$ | Metallic resonance resonance rings | $> 75\text{ dB}$ |
| **Blunt Door Impact** | $40\text{ Hz} - 180\text{ Hz}$ | Low-frequency sub-bass shockwave | $> 88\text{ dB}$ |
| **Human Vocal Distress** | $1.5\text{ kHz} - 3.0\text{ kHz}$ | Irregular vibrato, sudden pitch excursion | $> 80\text{ dB}$ |
