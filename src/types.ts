export interface ParkingSpot {
  id: string;
  lat: number;
  lng: number;
  timestamp: number;
  confidence: number;
  source: 'mobile-app' | 'togg-trumore' | 'tesla-fleet' | 'logistics';
}

export interface SpotIngestionPayload {
  lat: number;
  lng: number;
  timestamp: number;
  confidence: number;
  source: 'mobile-app' | 'togg-trumore' | 'tesla-fleet' | 'logistics';
  image?: unknown; // Strict KVKK Check: if this is present, we must drop it and warn
}

export type SpotStatus = 'green' | 'yellow' | 'expired';

export interface MapSpot extends ParkingSpot {
  status: SpotStatus;
  ageSeconds: number;
}
