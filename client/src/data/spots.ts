import type { SpotDTO } from '@shared/types';

/**
 * Demo spot data for static-only deployment.
 * In full deployment, this comes from the backend (Spot table via Prisma).
 */
export const DEMO_SPOTS: SpotDTO[] = [
  // Israel
  { id: 'tel-aviv-hilton', name: 'Hilton Beach', lat: 32.0907, lng: 34.7707, country: 'Israel', region: 'Tel Aviv' },
  { id: 'herzliya', name: 'Herzliya', lat: 32.1640, lng: 34.7920, country: 'Israel', region: 'Sharon' },
  { id: 'ashdod', name: 'Ashdod', lat: 31.7920, lng: 34.6360, country: 'Israel', region: 'Southern District' },
  { id: 'haifa-bat-galim', name: 'Bat Galim', lat: 32.8260, lng: 34.9610, country: 'Israel', region: 'Haifa' },
  { id: 'netanya', name: 'Netanya', lat: 32.3210, lng: 34.8530, country: 'Israel', region: 'Sharon' },

  // Famous global spots
  { id: 'pipeline', name: 'Pipeline', lat: 21.6650, lng: -158.0530, country: 'USA', region: 'Hawaii' },
  { id: 'jeffreys-bay', name: "Jeffrey's Bay", lat: -34.0488, lng: 24.9117, country: 'South Africa', region: 'Eastern Cape' },
  { id: 'nazare', name: 'Nazaré', lat: 39.6010, lng: -9.0700, country: 'Portugal', region: 'Centro' },
  { id: 'mavericks', name: 'Mavericks', lat: 37.4920, lng: -122.5010, country: 'USA', region: 'California' },
  { id: 'biarritz', name: 'Biarritz', lat: 43.4830, lng: -1.5586, country: 'France', region: 'Nouvelle-Aquitaine' },
];
