import os
import io
import time
import math
import random
from typing import Optional, Tuple
from app.core.config import settings

class AudioSentinel:
    def __init__(self):
        self.polly_client = None
        self.rolling_noise_floor_db = 42.0
        self.noise_history = []
        self._init_aws_polly()

    def _init_aws_polly(self):
        """Initializes boto3 polly client if credentials are present and MOCK_AWS is false."""
        if not settings.MOCK_AWS and settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            try:
                import boto3
                self.polly_client = boto3.client(
                    'polly',
                    region_name=settings.AWS_REGION,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    aws_session_token=settings.AWS_SESSION_TOKEN if settings.AWS_SESSION_TOKEN else None
                )
                print("AWS Polly client initialized successfully.")
            except Exception as e:
                print(f"Warning: Failed to initialize AWS Polly: {e}. Falling back to simulation.")
                self.polly_client = None
        else:
            self.polly_client = None

    def update_noise_floor(self, ambient_db: float):
        """Exponential Moving Average (EMA) baseline filter tracking ambient acoustic floor."""
        # Cap sample at 60 dB to prevent high-amplitude threats from contaminating the baseline
        clamped = min(ambient_db, 60.0)
        self.rolling_noise_floor_db = (0.92 * self.rolling_noise_floor_db) + (0.08 * clamped)
        return round(self.rolling_noise_floor_db, 1)

    def analyze_audio_spectrum(self, decibels: float, sample_freq_hz: Optional[float] = None) -> Tuple[str, bool]:
        """
        Analyzes audio level and dominant frequency band relative to dynamic noise floor.
        Ignores continuous low-frequency environmental noise (wind/traffic).
        """
        current_floor = self.update_noise_floor(decibels)
        snr_delta = decibels - current_floor
        freq = sample_freq_hz if sample_freq_hz is not None else random.uniform(200, 2500)

        # Environmental wind/traffic noise rejection: continuous energy sub-150Hz with low delta
        if freq < 150 and snr_delta < 28.0:
            return "ENVIRONMENTAL_RUMBLE_SUPPRESSED (WIND/TRAFFIC)", False

        # Glass break: 4.2 kHz - 6.8 kHz resonant impulse with sharp rise above floor
        if decibels > 78.0 and snr_delta > 25.0 and 4000 <= freq <= 7000:
            return "GLASS_FRACTURE_CONFIRMED", True
        # Severe physical breach / blunt door shockwave
        elif decibels > 88.0 and snr_delta > 32.0 and freq <= 200:
            return "PERIMETER_HEAVY_IMPACT", True
        # Elevated distress vocalization
        elif decibels > 76.0 and snr_delta > 22.0 and 1400 <= freq <= 3200:
            return "ELEVATED_VOCAL_DISTRESS", True
        elif decibels > 60.0 and snr_delta > 15.0:
            return "AMBIENT_CONVERSATION", False
        else:
            return f"NOMINAL_BASELINE ({current_floor} dB Floor)", False

    def synthesize_tactical_speech(self, text: str) -> Optional[bytes]:
        """
        Synthesizes tactical de-escalation voice directive via Amazon Polly.
        Falls back to None (or simulated audio) if running locally without AWS keys.
        """
        if self.polly_client:
            try:
                response = self.polly_client.synthesize_speech(
                    Text=text,
                    OutputFormat='mp3',
                    VoiceId=settings.POLLY_VOICE_ID,
                    Engine=settings.POLLY_ENGINE
                )
                if "AudioStream" in response:
                    return response["AudioStream"].read()
            except Exception as e:
                print(f"Error in Amazon Polly synthesis: {e}")
                return None
        
        # In mock mode, return None or mock byte marker
        return None

audio_sentinel = AudioSentinel()
