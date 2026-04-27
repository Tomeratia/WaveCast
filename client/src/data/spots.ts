import type { SpotDTO } from '@shared/types';

export interface SpotCamera {
  label: string;
  hlsUrl: string;  // HLS .m3u8 stream from wavehub.co.il
}

export interface SpotWithCams extends SpotDTO {
  cameras: SpotCamera[];
}

export const DEMO_SPOTS: SpotWithCams[] = [
  {
    id: 'tel-aviv-hilton',
    name: 'Hilton Beach',
    lat: 32.0907, lng: 34.7707,
    country: 'Israel', region: 'Tel Aviv',
    cameras: [
      { label: 'Hilton A', hlsUrl: 'https://vod.wavehub.co.il/live/_definst_/HiltonA_HD.stream/playlist.m3u8' },
      { label: 'Hilton B', hlsUrl: 'https://vod.wavehub.co.il/live/_definst_/HiltonB_HD.stream/playlist.m3u8' },
    ],
  },
  {
    id: 'herzliya',
    name: 'Herzliya',
    lat: 32.1640, lng: 34.7920,
    country: 'Israel', region: 'Sharon',
    cameras: [
      { label: 'Dromi',  hlsUrl: 'https://vod.wavehub.co.il/live/_definst_/Dromi_HD.stream/playlist.m3u8' },
      { label: 'Marina', hlsUrl: 'https://vod.wavehub.co.il/live/_definst_/Marina_HD.stream/playlist.m3u8' },
      { label: 'Zvulun', hlsUrl: 'https://vod.wavehub.co.il/live/_definst_/Zvulun_HD.stream/playlist.m3u8' },
    ],
  },
  {
    id: 'ashdod',
    name: 'Ashdod',
    lat: 31.7920, lng: 34.6360,
    country: 'Israel', region: 'Southern District',
    cameras: [],
  },
  {
    id: 'haifa-bat-galim',
    name: 'Bat Galim',
    lat: 32.8260, lng: 34.9610,
    country: 'Israel', region: 'Haifa',
    cameras: [],
  },
  {
    id: 'netanya',
    name: 'Netanya',
    lat: 32.3210, lng: 34.8530,
    country: 'Israel', region: 'Sharon',
    cameras: [
      { label: 'Poleg', hlsUrl: 'https://vod.wavehub.co.il/live/_definst_/Poleg_HD.stream/playlist.m3u8' },
    ],
  },
  {
    id: 'pipeline',
    name: 'Pipeline',
    lat: 21.6650, lng: -158.0530,
    country: 'USA', region: 'Hawaii',
    cameras: [],
  },
  {
    id: 'jeffreys-bay',
    name: "Jeffrey's Bay",
    lat: -34.0488, lng: 24.9117,
    country: 'South Africa', region: 'Eastern Cape',
    cameras: [],
  },
  {
    id: 'nazare',
    name: 'Nazaré',
    lat: 39.6010, lng: -9.0700,
    country: 'Portugal', region: 'Centro',
    cameras: [],
  },
  {
    id: 'mavericks',
    name: 'Mavericks',
    lat: 37.4920, lng: -122.5010,
    country: 'USA', region: 'California',
    cameras: [],
  },
  {
    id: 'biarritz',
    name: 'Biarritz',
    lat: 43.4830, lng: -1.5586,
    country: 'France', region: 'Nouvelle-Aquitaine',
    cameras: [],
  },
];
