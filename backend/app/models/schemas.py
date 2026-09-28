from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
import time

class ThreatLevel(str, Enum):
    CLEAR = "CLEAR"
    MONITOR = "MONITOR"
    SUSPICIOUS = "SUSPICIOUS"
    ALERT = "ALERT"
    LOCKDOWN = "LOCKDOWN"

class AirlockStatus(str, Enum):
    SECURE = "SECURE"
    AUTHENTICATING = "AUTHENTICATING"
    UNLOCKED = "UNLOCKED"
    BREACH_ATTEMPT = "BREACH_ATTEMPT"

class BoundingBox(BaseModel):
    id: str
    label: str
    confidence: float
    ymin: float = Field(ge=0.0, le=1.0)
    xmin: float = Field(ge=0.0, le=1.0)
    ymax: float = Field(ge=0.0, le=1.0)
    xmax: float = Field(ge=0.0, le=1.0)
    threat_flag: bool = False
    details: Optional[str] = None

class AcousticSignature(BaseModel):
    frequency_hz: float
    decibels: float
    classification: str
    anomaly_detected: bool

class TelemetryFrame(BaseModel):
    timestamp: float = Field(default_factory=time.time)
    threat_level: ThreatLevel = ThreatLevel.CLEAR
    threat_score: int = Field(ge=0, le=100, default=0) # 0 to 100%
    deception_index: float = Field(ge=0.0, le=1.0, default=0.0) # 0.0 to 1.0
    decibel_level: float = 42.5
    acoustic_event: Optional[str] = None
    detected_targets: List[BoundingBox] = []
    lockdown_active: bool = False
    acoustic_shield_active: bool = False
    airlock_status: AirlockStatus = AirlockStatus.SECURE
    airlock_time_remaining: int = 0
    active_agent_directive: Optional[str] = None
    system_log: Optional[str] = None
    # Edge-first optimization metrics
    edge_vision_gating_active: bool = True
    edge_confidence_threshold: float = 0.75 # Local confidence must be > 75% to invoke Bedrock
    cloud_token_savings_percent: float = 84.6
    frames_filtered_at_edge: int = 1420
    cloud_cost_saved_usd: float = 142.30
    noise_floor_db: float = 42.0

class LockdownRequest(BaseModel):
    pin: str
    reason: Optional[str] = "Manual operator override"
    override: bool = False

class LockdownResponse(BaseModel):
    success: bool
    lockdown_active: bool
    message: str
    timestamp: float = Field(default_factory=time.time)

class AirlockVerifyRequest(BaseModel):
    otp_code: str
    courier_id: Optional[str] = "COURIER-DEFAULT"
    method: str = "TOTP" # TOTP or BIOMETRIC

class AirlockVerifyResponse(BaseModel):
    verified: bool
    message: str
    status: AirlockStatus
    unlock_duration_seconds: int = 15
    timestamp: float = Field(default_factory=time.time)

class IntercomMessage(BaseModel):
    sender: str # "OPERATOR", "AGENT", "VISITOR"
    transcript: str
    audio_base64: Optional[str] = None
    timestamp: float = Field(default_factory=time.time)

class ThreatAssessmentRequest(BaseModel):
    image_base64: Optional[str] = None
    trigger_type: str = "SCHEDULED_SWEEP" # MOTION, ACOUSTIC, MANUAL
    context: Optional[str] = None

class ThreatAssessmentResponse(BaseModel):
    threat_level: ThreatLevel
    threat_score: int
    deception_index: float
    analysis_text: str
    recommended_action: str
    targets: List[BoundingBox] = []
    tactical_speech: Optional[str] = None

# Commercial SaaS & Multi-Tenant Tiers
class SubscriptionTier(str, Enum):
    HOME_GUARD = "HOME_GUARD"           # Free tier: 1 camera, basic rule engine
    SENTINEL_PRO = "SENTINEL_PRO"       # $9.99/mo: Haiku interrogator, OTP airlock, SMS alerts
    ESTATE_FORTRESS = "ESTATE_FORTRESS" # $29.99/mo: Claude 3.5 Sonnet Vision, auto acoustic shield, private dispatch

class SubscriptionPlan(BaseModel):
    tier: SubscriptionTier
    name: str
    price_usd_monthly: float
    features: List[str]
    max_cameras: int
    bedrock_model: str
    dispatch_enabled: bool

class CheckoutSessionRequest(BaseModel):
    tier: SubscriptionTier
    customer_email: str
    success_url: Optional[str] = "http://localhost:3000/dashboard?billing=success"
    cancel_url: Optional[str] = "http://localhost:3000/pricing?billing=cancelled"

class CheckoutSessionResponse(BaseModel):
    session_id: str
    checkout_url: str
    tier: SubscriptionTier
    status: str = "PENDING_CHECKOUT"

# Ring Official Device Gateway
class RingDevice(BaseModel):
    device_id: str
    name: str
    kind: str = "doorbell_v4"
    battery_life: int = 94
    webrtc_stream_url: str
    firmware: str = "v3.18.22-cerberus-edge"
    status: str = "ONLINE"
    motion_detection_enabled: bool = True

class RingWebhookEvent(BaseModel):
    event_id: str
    device_id: str
    kind: str # "motion", "ding", "stream_connected", "tamper"
    timestamp: float = Field(default_factory=time.time)
    data: Optional[dict] = None

# Emergency Dispatch Integration
class DispatchAlertRequest(BaseModel):
    incident_id: str
    threat_level: ThreatLevel
    threat_score: int
    recipients: List[str] = ["+1 (555) 019-2834", "dispatch@sentinel-defense.com"]
    channel: str = "SMS_AND_SNS" # SMS, SNS, PRIVATE_SECURITY
    include_snapshot: bool = True
    transcript: Optional[str] = None
    location: str = "742 Evergreen Terrace, Front Gate Perimeter"

class DispatchAlertResponse(BaseModel):
    dispatch_id: str
    status: str # "DISPATCHED", "PENDING_ACK"
    timestamp: float = Field(default_factory=time.time)
    channel_used: str
    eta_minutes: int
    message: str
