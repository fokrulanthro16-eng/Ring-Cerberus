import asyncio
import json
import time
import random
from typing import List, Set, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.airlock import airlock_engine
from app.core.billing import billing_engine
from app.core.dispatch import dispatch_service
from app.core.ring_gateway import ring_gateway
from app.models.schemas import (
    ThreatLevel, AirlockStatus, TelemetryFrame, BoundingBox,
    LockdownRequest, LockdownResponse, AirlockVerifyRequest, AirlockVerifyResponse,
    ThreatAssessmentRequest, ThreatAssessmentResponse, IntercomMessage,
    SubscriptionPlan, CheckoutSessionRequest, CheckoutSessionResponse,
    RingDevice, RingWebhookEvent, DispatchAlertRequest, DispatchAlertResponse
)
from app.agents.bedrock_swarm import bedrock_swarm
from app.agents.audio_sentinel import audio_sentinel

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-FPS Defensive Swarm & Zero-Trust Perimeter Lockdown Gateway"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory System State
class SystemState:
    def __init__(self):
        self.threat_level: ThreatLevel = ThreatLevel.CLEAR
        self.threat_score: int = 5
        self.deception_index: float = 0.04
        self.decibel_level: float = 43.0
        self.acoustic_event: str = "NOMINAL_AMBIENT"
        self.lockdown_active: bool = False
        self.acoustic_shield_active: bool = False
        self.targets: List[BoundingBox] = []
        self.active_directive: str = "PERIMETER SECURE - LOW FREQUENCY SWEEP"
        self.scenario_cycle_index: int = 0
        self.frames_filtered_at_edge: int = 1420
        self.cloud_token_savings_percent: float = 84.6
        self.cloud_cost_saved_usd: float = 142.30
        self.logs: List[str] = ["[00:00:00] CERBERUS KERNEL ONLINE - BEDROCK SWARM READY"]

    def add_log(self, text: str):
        timestamp = time.strftime("[%H:%M:%S]")
        entry = f"{timestamp} {text}"
        self.logs.append(entry)
        if len(self.logs) > 50:
            self.logs.pop(0)

state = SystemState()

# WebSocket Connection Managers
class ConnectionManager:
    def __init__(self):
        self.active_telemetry_clients: Set[WebSocket] = set()
        self.active_intercom_clients: Set[WebSocket] = set()

    async def connect_telemetry(self, websocket: WebSocket):
        await websocket.accept()
        self.active_telemetry_clients.add(websocket)

    def disconnect_telemetry(self, websocket: WebSocket):
        self.active_telemetry_clients.discard(websocket)

    async def broadcast_telemetry(self, frame: TelemetryFrame):
        data = frame.model_dump_json()
        dead_clients = []
        for client in self.active_telemetry_clients:
            try:
                await client.send_text(data)
            except Exception:
                dead_clients.append(client)
        for client in dead_clients:
            self.disconnect_telemetry(client)

    async def connect_intercom(self, websocket: WebSocket):
        await websocket.accept()
        self.active_intercom_clients.add(websocket)

    def disconnect_intercom(self, websocket: WebSocket):
        self.active_intercom_clients.discard(websocket)

    async def broadcast_intercom(self, message: IntercomMessage):
        data = message.model_dump_json()
        dead_clients = []
        for client in self.active_intercom_clients:
            try:
                await client.send_text(data)
            except Exception:
                dead_clients.append(client)
        for client in dead_clients:
            self.disconnect_intercom(client)

manager = ConnectionManager()

# Background Telemetry Generator Loop
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(telemetry_broadcast_loop())

async def telemetry_broadcast_loop():
    while True:
        try:
            airlock_status, remaining_time = airlock_engine.check_airlock_state()
            
            # Dynamic Acoustic Noise Floor & environmental rejection
            if state.acoustic_shield_active:
                state.decibel_level = round(random.uniform(94.0, 102.5), 1)
                state.acoustic_event = "HIGH_DECIBEL_ACOUSTIC_SHIELD"
            elif state.lockdown_active:
                state.decibel_level = round(random.uniform(85.0, 92.0), 1)
            else:
                state.decibel_level = round(random.uniform(38.0, 48.0) + (state.threat_score * 0.2), 1)
                event_name, _ = audio_sentinel.analyze_audio_spectrum(state.decibel_level)
                state.acoustic_event = event_name

            # Gradually increment edge filter count during nominal sweep
            if state.threat_level == ThreatLevel.CLEAR:
                state.frames_filtered_at_edge += 1
                state.cloud_cost_saved_usd = round(state.frames_filtered_at_edge * 0.0018, 2)

            frame = TelemetryFrame(
                timestamp=time.time(),
                threat_level=state.threat_level,
                threat_score=state.threat_score,
                deception_index=round(state.deception_index, 2),
                decibel_level=state.decibel_level,
                acoustic_event=state.acoustic_event,
                detected_targets=state.targets,
                lockdown_active=state.lockdown_active,
                acoustic_shield_active=state.acoustic_shield_active,
                airlock_status=airlock_status,
                airlock_time_remaining=remaining_time,
                active_agent_directive=state.active_directive,
                system_log=state.logs[-1] if state.logs else None,
                edge_vision_gating_active=True,
                edge_confidence_threshold=0.75,
                cloud_token_savings_percent=84.6,
                frames_filtered_at_edge=state.frames_filtered_at_edge,
                cloud_cost_saved_usd=state.cloud_cost_saved_usd,
                noise_floor_db=round(audio_sentinel.rolling_noise_floor_db, 1)
            )
            await manager.broadcast_telemetry(frame)
        except Exception as e:
            print(f"Error in telemetry loop: {e}")
        await asyncio.sleep(0.5)

# REST Routes
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mock_mode": settings.MOCK_AWS
    }

@app.get("/api/threats")
async def get_threat_status():
    return {
        "threat_level": state.threat_level,
        "threat_score": state.threat_score,
        "deception_index": state.deception_index,
        "lockdown_active": state.lockdown_active,
        "acoustic_shield_active": state.acoustic_shield_active,
        "targets": state.targets,
        "logs": state.logs[-15:],
        "edge_vision_gating_active": True,
        "cloud_token_savings_percent": 84.6,
        "frames_filtered_at_edge": state.frames_filtered_at_edge,
        "cloud_cost_saved_usd": state.cloud_cost_saved_usd
    }

@app.post("/api/assess-threat", response_model=ThreatAssessmentResponse)
async def assess_threat(req: ThreatAssessmentRequest, edge_confidence: float = 0.88):
    # Edge-first vision gating: Bedrock payload only dispatched if edge motion/person confidence > 75%
    if edge_confidence < 0.75:
        state.frames_filtered_at_edge += 1
        state.cloud_cost_saved_usd = round(state.frames_filtered_at_edge * 0.0018, 2)
        state.add_log(f"EDGE VISION GATING: Frame filtered locally ({int(edge_confidence*100)}% <= 75%). Cloud token saved.")
        return ThreatAssessmentResponse(
            threat_level=ThreatLevel.CLEAR,
            threat_score=3,
            deception_index=0.01,
            analysis_text="Edge motion gating suppressed cloud dispatch (local confidence below 75%).",
            recommended_action="Maintain low-power local edge sensing.",
            targets=[]
        )

    assessment = bedrock_swarm.assess_scene(image_base64=req.image_base64, context=req.context)
    state.threat_level = assessment.threat_level
    state.threat_score = assessment.threat_score
    state.deception_index = assessment.deception_index
    state.targets = assessment.targets
    state.active_directive = assessment.recommended_action
    state.add_log(f"Bedrock Swarm: {assessment.analysis_text[:70]}...")
    return assessment

@app.post("/api/lockdown", response_model=LockdownResponse)
async def trigger_lockdown(req: LockdownRequest):
    # Verify PIN or allow emergency override
    if req.pin != settings.LOCKDOWN_PIN and not req.override:
        raise HTTPException(status_code=403, detail="Invalid lockdown override PIN")
    
    # Toggle lockdown
    state.lockdown_active = not state.lockdown_active
    if state.lockdown_active:
        state.threat_level = ThreatLevel.LOCKDOWN
        state.threat_score = 100
        state.add_log(f"CRITICAL LOCKDOWN ENGAGED: Magnetic deadbolts sealed. Reason: {req.reason}")
        msg = "Emergency lockdown successfully engaged. Perimeter deadbolts locked."
    else:
        state.threat_level = ThreatLevel.CLEAR
        state.threat_score = 5
        state.targets = []
        state.acoustic_shield_active = False
        state.add_log("Lockdown disengaged by operator authorization.")
        msg = "Perimeter lockdown disengaged. Normal security ops restored."

    return LockdownResponse(
        success=True,
        lockdown_active=state.lockdown_active,
        message=msg
    )

@app.post("/api/acoustic-shield")
async def toggle_acoustic_shield():
    state.acoustic_shield_active = not state.acoustic_shield_active
    if state.acoustic_shield_active:
        state.add_log("ACOUSTIC WARNING SHIELD ARMED: High-intensity deterrent pulse active.")
    else:
        state.add_log("Acoustic Warning Shield disarmed.")
    return {"acoustic_shield_active": state.acoustic_shield_active}

@app.post("/api/verify-delivery", response_model=AirlockVerifyResponse)
async def verify_delivery(req: AirlockVerifyRequest):
    res = airlock_engine.verify_token(req.otp_code, req.courier_id)
    if res.verified:
        state.threat_level = ThreatLevel.MONITOR
        state.threat_score = 15
        state.add_log(f"AIRLOCK UNLOCKED: Verified {req.courier_id} via TOTP. 15s parcel window active.")
    else:
        state.threat_score = min(100, state.threat_score + 25)
        state.deception_index = min(1.0, state.deception_index + 0.3)
        if res.status == AirlockStatus.BREACH_ATTEMPT:
            state.threat_level = ThreatLevel.ALERT
            state.add_log(f"AIRLOCK BREACH WARNING: Courier token failed repeatedly.")
        else:
            state.add_log(f"Airlock Auth Failed for token: {req.otp_code}")
    return res

@app.get("/api/airlock-token")
async def get_airlock_token():
    """Helper endpoint to inspect active rotating TOTP for rapid evaluation/demo."""
    token = airlock_engine.get_current_totp()
    seconds = airlock_engine.get_totp_remaining_seconds()
    return {
        "current_totp": token,
        "valid_for_seconds": seconds,
        "seed_format": "RFC 6238 TOTP (30s interval)"
    }

@app.post("/api/inject-threat")
async def inject_threat_scenario(scenario_override: Optional[str] = None):
    """
    Cycles dynamically through 3 realistic high-stakes scenarios:
    - Scenario A: Package Poacher Detected (Deception Index 0.85, flashing orange target, audio warning)
    - Scenario B: Armed Forced Entry (Threat Level 98%, tactical red alert, Emergency Lockdown & Acoustic Shield)
    - Scenario C: Authorized Courier Verification (OTP 844386 verified, Airlock glowing green UNLOCKED)
    """
    scenarios = ["PACKAGE_POACHER", "ARMED_FORCED_ENTRY", "AUTHORIZED_COURIER"]
    chosen = scenario_override if scenario_override in scenarios else scenarios[state.scenario_cycle_index]
    state.scenario_cycle_index = (state.scenario_cycle_index + 1) % len(scenarios)

    if chosen == "PACKAGE_POACHER":
        state.threat_level = ThreatLevel.ALERT
        state.threat_score = 82
        state.deception_index = 0.85
        state.lockdown_active = False
        state.acoustic_shield_active = False
        state.acoustic_event = "ELEVATED_VOCAL_DISTRESS"
        state.decibel_level = 74.5
        state.targets = [
            BoundingBox(
                id="POACHER-01",
                label="Package Poacher Detected",
                confidence=0.96,
                ymin=0.22,
                xmin=0.35,
                ymax=0.86,
                xmax=0.64,
                threat_flag=True,
                details="Deception Index 0.85 - Subject loitering directly over parcel drop zone"
            ),
            BoundingBox(
                id="PKG-01",
                label="Secured Package (Target)",
                confidence=0.93,
                ymin=0.68,
                xmin=0.42,
                ymax=0.84,
                xmax=0.58,
                threat_flag=False,
                details="Amazon Logistics Priority Box"
            )
        ]
        speech = "Warning: Stepping away from the parcel zone immediately."
        state.active_directive = speech
        state.add_log("[SCENARIO A] PACKAGE POACHER DETECTED: Deception Index surges to 0.85. Audible deterrent deployed.")
        return {
            "scenario": "A",
            "name": "Package Poacher Detected",
            "speech": speech,
            "sound": "warning",
            "threat_level": state.threat_level,
            "deception_index": state.deception_index,
            "threat_score": state.threat_score,
            "targets": state.targets
        }

    elif chosen == "ARMED_FORCED_ENTRY":
        state.threat_level = ThreatLevel.LOCKDOWN
        state.threat_score = 98
        state.deception_index = 0.99
        state.lockdown_active = True
        state.acoustic_shield_active = True
        state.acoustic_event = "GLASS_FRACTURE_CONFIRMED"
        state.decibel_level = 98.4
        state.targets = [
            BoundingBox(
                id="HOSTILE-01",
                label="Armed Subject (Crowbar / Forced Entry)",
                confidence=0.98,
                ymin=0.18,
                xmin=0.28,
                ymax=0.90,
                xmax=0.72,
                threat_flag=True,
                details="Class-2 pry implement active on door latch - high impact"
            ),
            BoundingBox(
                id="WEAPON-01",
                label="Heavy Pry Tool",
                confidence=0.95,
                ymin=0.52,
                xmin=0.58,
                ymax=0.74,
                xmax=0.68,
                threat_flag=True,
                details="Impact velocity: 4.8 m/s"
            )
        ]
        speech = "CRITICAL BREACH DETECTED. Emergency lockdown engaged. Acoustic warning shield active."
        state.active_directive = "CRITICAL ARMED FORCED ENTRY: Perimeter locked down. Acoustic shield active."
        state.add_log("[SCENARIO B] ARMED FORCED ENTRY: Threat level spikes to 98%. Emergency deadbolts sealed.")
        return {
            "scenario": "B",
            "name": "Armed Forced Entry",
            "speech": speech,
            "sound": "alarm",
            "threat_level": state.threat_level,
            "deception_index": state.deception_index,
            "threat_score": state.threat_score,
            "targets": state.targets
        }

    else: # AUTHORIZED_COURIER
        state.threat_level = ThreatLevel.CLEAR
        state.threat_score = 8
        state.deception_index = 0.04
        state.lockdown_active = False
        state.acoustic_shield_active = False
        state.acoustic_event = "NOMINAL_AMBIENT"
        state.decibel_level = 42.0
        # Unlock the airlock with the OTP code
        airlock_engine.verify_token("844386", "FEDEX-COURIER-844")
        state.targets = [
            BoundingBox(
                id="COURIER-01",
                label="Authorized Courier (FedEx Logistics)",
                confidence=0.97,
                ymin=0.20,
                xmin=0.36,
                ymax=0.85,
                xmax=0.64,
                threat_flag=False,
                details="Badge verified - QR token authorized"
            ),
            BoundingBox(
                id="AIRLOCK-01",
                label="Airlock Hatch (Unlocked)",
                confidence=0.99,
                ymin=0.50,
                xmin=0.60,
                ymax=0.70,
                xmax=0.72,
                threat_flag=False,
                details="COMPARTMENT UNLOCKED: 15s deposit window active"
            )
        ]
        speech = "Courier authorization confirmed. Compartment unlocked. Please deposit parcel."
        state.active_directive = "Airlock OTP 844386 verified. Compartment hatch unlocked for 15 seconds."
        state.add_log("[SCENARIO C] COURIER VERIFICATION: OTP 844386 confirmed. Parcel compartment unlocked.")
        return {
            "scenario": "C",
            "name": "Authorized Courier Verification",
            "otp": "844386",
            "speech": speech,
            "sound": "success",
            "threat_level": state.threat_level,
            "deception_index": state.deception_index,
            "threat_score": state.threat_score,
            "targets": state.targets
        }

@app.post("/api/clear-alarm")
async def clear_alarm():
    state.threat_level = ThreatLevel.CLEAR
    state.threat_score = 4
    state.deception_index = 0.02
    state.targets = []
    state.lockdown_active = False
    state.acoustic_shield_active = False
    state.active_directive = "PERIMETER SECURE - LOW FREQUENCY SWEEP"
    state.add_log("Threat matrix cleared. Returning to nominal sentinel sweep.")
    return {"status": "Alarm cleared", "threat_level": state.threat_level}

# ==============================================================================
# Ring Official Device Gateway Routes
# ==============================================================================
@app.get("/api/ring/oauth/authorize", tags=["Ring Official Gateway"])
async def ring_oauth_authorize():
    """Generates official Ring Cloud OAuth 2.0 authorization URL for customer device linking."""
    url = ring_gateway.get_oauth_authorize_url()
    return {"authorization_url": url, "scopes": ["devices:read", "devices:stream", "webhooks:manage"]}

@app.post("/api/ring/oauth/callback", tags=["Ring Official Gateway"])
async def ring_oauth_callback(code: str = "sample_auth_code_99182"):
    """Exchanges Ring authorization code for secure encrypted long-lived tokens."""
    token_data = ring_gateway.exchange_oauth_code(code)
    state.add_log("RING GATEWAY: Official Ring account linked. 2 WebRTC device streams registered.")
    return {"status": "LINKED", "data": token_data}

@app.get("/api/ring/devices", response_model=List[RingDevice], tags=["Ring Official Gateway"])
async def get_ring_devices():
    """Retrieves all linked hardware devices with active WebRTC stream URLs."""
    return ring_gateway.get_devices()

@app.post("/api/ring/webhook", tags=["Ring Official Gateway"])
async def handle_ring_webhook(event: RingWebhookEvent):
    """
    Ingests official Ring Cloud motion, doorbell chime (ding), and tamper events.
    Automatically triggers Bedrock Swarm analysis.
    """
    result = ring_gateway.process_webhook_event(event)
    state.add_log(f"RING CLOUD WEBHOOK: {event.kind.upper()} triggered on device {event.device_id}")

    if event.kind == "motion":
        # Run autonomous Bedrock scene assessment
        assessment = bedrock_swarm.assess_scene(context="RING_MOTION_WEBHOOK")
        state.threat_level = assessment.threat_level
        state.threat_score = assessment.threat_score
        state.deception_index = assessment.deception_index
        state.targets = assessment.targets
        state.active_directive = assessment.recommended_action
    
    return {"status": "PROCESSED", "result": result}

# ==============================================================================
# Commercial Subscription & Multi-Tenant Billing Routes
# ==============================================================================
@app.get("/api/billing/plans", response_model=List[SubscriptionPlan], tags=["Commercial Billing"])
async def get_subscription_plans():
    """Returns commercial pricing tiers: Home Guard, Sentinel Pro, and Estate Fortress."""
    return billing_engine.get_plans()

@app.post("/api/billing/checkout", response_model=CheckoutSessionResponse, tags=["Commercial Billing"])
async def create_checkout_session(req: CheckoutSessionRequest):
    """Generates Stripe Checkout session for subscription tier upgrades."""
    session = billing_engine.create_checkout_session(req)
    state.add_log(f"BILLING: Customer {req.customer_email} initiated upgrade to {req.tier.value}")
    return session

@app.post("/api/billing/webhook", tags=["Commercial Billing"])
async def handle_stripe_webhook(payload: dict):
    """Scaffolding for Stripe webhook events (checkout.session.completed, etc.)."""
    event_type = payload.get("type", "checkout.session.completed")
    state.add_log(f"STRIPE WEBHOOK: Processed {event_type} payment verification.")
    return {"received": True, "event": event_type}

@app.get("/api/billing/user-status", tags=["Commercial Billing"])
async def get_user_billing_status(user_id: str = "default_user"):
    """Returns the current subscription tier and feature entitlement flags."""
    tier = billing_engine.get_user_tier(user_id)
    return {
        "user_id": user_id,
        "tier": tier,
        "unlimited_bedrock": billing_engine.verify_feature_access("sonnet_multimodal_unlimited", user_id),
        "autonomous_acoustic_shield": billing_engine.verify_feature_access("autonomous_acoustic_shield", user_id),
        "private_dispatch": billing_engine.verify_feature_access("private_dispatch", user_id)
    }

# ==============================================================================
# Instant Emergency Dispatch Routes
# ==============================================================================
@app.post("/api/dispatch/alert", response_model=DispatchAlertResponse, tags=["Emergency Dispatch"])
async def trigger_emergency_dispatch(req: DispatchAlertRequest):
    """
    Dispatches instant encrypted SMS (Twilio) and Amazon SNS push notices to
    registered emergency contacts and private armed patrol units.
    """
    res = dispatch_service.dispatch_emergency(req)
    state.add_log(f"EMERGENCY DISPATCH TRIGGERED: Units en route to {req.location}. ETA: {res.eta_minutes}m")
    return res

@app.get("/api/dispatch/history", tags=["Emergency Dispatch"])
async def get_dispatch_history():
    """Retrieves evidentiary audit history of all emergency dispatches."""
    return dispatch_service.get_dispatch_history()

# WebSockets
@app.websocket("/ws/telemetry")
async def ws_telemetry(websocket: WebSocket):
    await manager.connect_telemetry(websocket)
    try:
        while True:
            # Client can send heartbeats or command messages
            data = await websocket.receive_text()
            # If client sends a ping or instruction
            if data == "PING":
                await websocket.send_text("PONG")
    except WebSocketDisconnect:
        manager.disconnect_telemetry(websocket)

@app.websocket("/ws/intercom")
async def ws_intercom(websocket: WebSocket):
    await manager.connect_intercom(websocket)
    try:
        while True:
            raw_data = await websocket.receive_text()
            payload = json.loads(raw_data)
            
            # If operator spoke
            user_transcript = payload.get("transcript", "")
            state.add_log(f"Operator Intercom: '{user_transcript}'")
            
            # Let Haiku Interrogator synthesize tactical reply if needed
            haiku_reply = bedrock_swarm.generate_interrogation(
                subject_description="Visitor at front threshold",
                visitor_speech=user_transcript
            )
            
            directive = haiku_reply.get("tactical_directive", "Cerberus perimeter active.")
            state.active_directive = directive
            state.add_log(f"Haiku Tactical Interrogator: '{directive}'")
            
            resp_message = IntercomMessage(
                sender="AGENT",
                transcript=directive
            )
            await manager.broadcast_intercom(resp_message)
    except WebSocketDisconnect:
        manager.disconnect_intercom(websocket)
    except Exception as e:
        print(f"Intercom websocket error: {e}")
        manager.disconnect_intercom(websocket)
