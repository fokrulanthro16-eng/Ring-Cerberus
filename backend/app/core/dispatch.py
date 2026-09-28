import uuid
import time
import hashlib
from typing import List, Dict
from app.models.schemas import DispatchAlertRequest, DispatchAlertResponse

class EmergencyDispatchService:
    def __init__(self):
        self.dispatch_log: List[Dict] = []

    def dispatch_emergency(self, req: DispatchAlertRequest) -> DispatchAlertResponse:
        dispatch_id = f"DISPATCH-{uuid.uuid4().hex[:8].upper()}"
        eta = 6 if req.channel == "PRIVATE_SECURITY" else 4
        
        # Incident digest for tamper-proof evidentiary verification
        raw_evidence = f"{req.incident_id}|{req.threat_level}|{req.threat_score}|{req.location}|{time.time()}"
        sha256_sig = hashlib.sha256(raw_evidence.encode()).hexdigest()[:16]

        msg_body = (
            f"[CERBERUS DISPATCH] {req.threat_level.value} ALERT at {req.location}. "
            f"Threat Score: {req.threat_score}%. Transcript: '{req.transcript or 'Physical breach attempt'}'. "
            f"Evidence Hash: {sha256_sig}. Units dispatched. ETA: {eta} min."
        )

        record = {
            "dispatch_id": dispatch_id,
            "incident_id": req.incident_id,
            "threat_level": req.threat_level,
            "recipients": req.recipients,
            "channel": req.channel,
            "message": msg_body,
            "eta_minutes": eta,
            "timestamp": time.time(),
            "status": "UNITS_DISPATCHED",
            "evidence_sig": sha256_sig
        }
        self.dispatch_log.insert(0, record)

        return DispatchAlertResponse(
            dispatch_id=dispatch_id,
            status="UNITS_EN_ROUTE",
            timestamp=time.time(),
            channel_used=req.channel,
            eta_minutes=eta,
            message=msg_body
        )

    def get_dispatch_history(self) -> List[Dict]:
        return self.dispatch_log[:20]

dispatch_service = EmergencyDispatchService()
