export type ThreatLevel = 'CLEAR' | 'MONITOR' | 'SUSPICIOUS' | 'ALERT' | 'LOCKDOWN';

export type AirlockStatus = 'SECURE' | 'AUTHENTICATING' | 'UNLOCKED' | 'BREACH_ATTEMPT';

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  threat_flag: boolean;
  details?: string;
}

export interface TelemetryFrame {
  timestamp: number;
  threat_level: ThreatLevel;
  threat_score: number; // 0 - 100
  deception_index: number; // 0.0 - 1.0
  decibel_level: number;
  acoustic_event?: string;
  detected_targets: BoundingBox[];
  lockdown_active: boolean;
  acoustic_shield_active: boolean;
  airlock_status: AirlockStatus;
  airlock_time_remaining: number;
  active_agent_directive?: string;
  system_log?: string;
  edge_vision_gating_active?: boolean;
  edge_confidence_threshold?: number;
  cloud_token_savings_percent?: number;
  frames_filtered_at_edge?: number;
  cloud_cost_saved_usd?: number;
  noise_floor_db?: number;
}

export interface IntercomMessage {
  sender: 'OPERATOR' | 'AGENT' | 'VISITOR';
  transcript: string;
  timestamp: number;
}
