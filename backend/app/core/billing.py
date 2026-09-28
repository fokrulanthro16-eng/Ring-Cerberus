from typing import Dict, List
from app.models.schemas import SubscriptionTier, SubscriptionPlan, CheckoutSessionRequest, CheckoutSessionResponse
import uuid
import time

PLANS: Dict[SubscriptionTier, SubscriptionPlan] = {
    SubscriptionTier.HOME_GUARD: SubscriptionPlan(
        tier=SubscriptionTier.HOME_GUARD,
        name="Home Guard (Free)",
        price_usd_monthly=0.0,
        features=[
            "1 Ring Camera Live WebRTC Feed",
            "Basic Motion & Edge Reticle HUD",
            "Manual Airlock Keypad Entry",
            "Local Telemetry Buffer (100 events)"
        ],
        max_cameras=1,
        bedrock_model="Simulated Rule Engine",
        dispatch_enabled=False
    ),
    SubscriptionTier.SENTINEL_PRO: SubscriptionPlan(
        tier=SubscriptionTier.SENTINEL_PRO,
        name="Sentinel Pro ($9.99/mo)",
        price_usd_monthly=9.99,
        features=[
            "Up to 3 Ring Video Doorbells & Floodlights",
            "AWS Bedrock Claude 3.5 Haiku Interrogation Agent",
            "Acoustic Sentinel DSP Glass-Break Detection",
            "Rotating TOTP Zero-Trust Delivery Airlock",
            "SMS Incident Alerts via Twilio / Amazon SNS"
        ],
        max_cameras=3,
        bedrock_model="anthropic.claude-3-5-haiku",
        dispatch_enabled=True
    ),
    SubscriptionTier.ESTATE_FORTRESS: SubscriptionPlan(
        tier=SubscriptionTier.ESTATE_FORTRESS,
        name="Estate Fortress ($29.99/mo)",
        price_usd_monthly=29.99,
        features=[
            "Unlimited Ring Hardware & Multi-Cam Swarm",
            "Dual-Agent AWS Bedrock Swarm (Claude 3.5 Sonnet + Haiku)",
            "Autonomous Acoustic Warning Shield & Strobe",
            "Instant Private Armed Security Dispatch Link",
            "Military-Grade 256-bit Encrypted Incident Snapshots",
            "Sub-15ms Edge WebRTC Video Relays"
        ],
        max_cameras=999,
        bedrock_model="anthropic.claude-3-5-sonnet & haiku",
        dispatch_enabled=True
    )
}

class BillingEngine:
    def __init__(self):
        self.active_subscriptions: Dict[str, SubscriptionTier] = {
            "default_user": SubscriptionTier.ESTATE_FORTRESS # Default active demo tier
        }

    def get_plans(self) -> List[SubscriptionPlan]:
        return list(PLANS.values())

    def get_user_tier(self, user_id: str = "default_user") -> SubscriptionTier:
        return self.active_subscriptions.get(user_id, SubscriptionTier.HOME_GUARD)

    def create_checkout_session(self, req: CheckoutSessionRequest) -> CheckoutSessionResponse:
        session_id = f"cs_test_cerberus_{uuid.uuid4().hex[:12]}"
        # Direct user to simulated Stripe checkout or confirmation
        checkout_url = f"{req.success_url}&session_id={session_id}&tier={req.tier.value}"
        
        # In demo mode, automatically update user tier
        self.active_subscriptions["default_user"] = req.tier
        
        return CheckoutSessionResponse(
            session_id=session_id,
            checkout_url=checkout_url,
            tier=req.tier,
            status="OPEN"
        )

    def verify_feature_access(self, feature: str, user_id: str = "default_user") -> bool:
        tier = self.get_user_tier(user_id)
        if tier == SubscriptionTier.ESTATE_FORTRESS:
            return True
        elif tier == SubscriptionTier.SENTINEL_PRO:
            return feature not in ["autonomous_acoustic_shield", "sonnet_multimodal_unlimited"]
        else: # HOME_GUARD
            return feature in ["webrtc_stream", "basic_hud"]

billing_engine = BillingEngine()
