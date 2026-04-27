import type { SpotDTO } from '@shared/types';

export interface SpotCamera {
  label: string;
  hlsUrl: string;
}

export interface SpotWithCams extends SpotDTO {
  cameras: SpotCamera[];
}

export const DEMO_SPOTS: SpotWithCams[] = [

  // ── Israel ──────────────────────────────────────────────────────────────────
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
    id: 'tel-aviv-maaravi',
    name: "Ma'aravi Beach",
    lat: 32.0745, lng: 34.7655,
    country: 'Israel', region: 'Tel Aviv',
    cameras: [
      { label: "Ma'aravi", hlsUrl: 'https://vod.wavehub.co.il/live/_definst_/Shenkar_HD.stream/playlist.m3u8' },
    ],
  },
  {
    id: 'tel-aviv-manau',
    name: 'Manau (Naourim)',
    lat: 32.0871, lng: 34.7687,
    country: 'Israel', region: 'Tel Aviv',
    cameras: [
      { label: 'Manau', hlsUrl: 'https://vod.wavehub.co.il/live/_definst_/Manau_HD.stream/playlist.m3u8' },
    ],
  },
  {
    id: 'herzliya-dromi',
    name: 'Herzliya Dromi',
    lat: 32.1560, lng: 34.7980,
    country: 'Israel', region: 'Sharon',
    cameras: [
      { label: 'Dromi',  hlsUrl: 'https://vod.wavehub.co.il/live/_definst_/Dromi_HD.stream/playlist.m3u8' },
      { label: 'Marina', hlsUrl: 'https://vod.wavehub.co.il/live/_definst_/Marina_HD.stream/playlist.m3u8' },
    ],
  },
  {
    id: 'herzliya-zvulun',
    name: 'Herzliya Zvulun',
    lat: 32.1682, lng: 34.8004,
    country: 'Israel', region: 'Sharon',
    cameras: [
      { label: 'Zvulun', hlsUrl: 'https://vod.wavehub.co.il/live/_definst_/Zvulun_HD.stream/playlist.m3u8' },
    ],
  },
  {
    id: 'netanya-poleg',
    name: 'Netanya Poleg',
    lat: 32.3512, lng: 34.8545,
    country: 'Israel', region: 'Sharon',
    cameras: [
      { label: 'Poleg', hlsUrl: 'https://vod.wavehub.co.il/live/_definst_/Poleg_HD.stream/playlist.m3u8' },
    ],
  },
  {
    id: 'netanya-north',
    name: 'Netanya North',
    lat: 32.3380, lng: 34.8510,
    country: 'Israel', region: 'Sharon',
    cameras: [],
  },
  {
    id: 'caesarea',
    name: 'Caesarea',
    lat: 32.5000, lng: 34.8980,
    country: 'Israel', region: 'Haifa District',
    cameras: [],
  },
  {
    id: 'hadera',
    name: 'Hadera',
    lat: 32.4420, lng: 34.8890,
    country: 'Israel', region: 'Haifa District',
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
    id: 'haifa-dado',
    name: 'Dado Beach',
    lat: 32.7980, lng: 34.9600,
    country: 'Israel', region: 'Haifa',
    cameras: [],
  },
  {
    id: 'ashdod',
    name: 'Ashdod',
    lat: 31.7920, lng: 34.6360,
    country: 'Israel', region: 'Southern District',
    cameras: [],
  },
  {
    id: 'ashkelon',
    name: 'Ashkelon',
    lat: 31.6640, lng: 34.5650,
    country: 'Israel', region: 'Southern District',
    cameras: [],
  },
  {
    id: 'palmachim',
    name: 'Palmachim',
    lat: 31.9270, lng: 34.6900,
    country: 'Israel', region: 'Central District',
    cameras: [],
  },
  {
    id: 'beit-yanai',
    name: 'Beit Yanai',
    lat: 32.4070, lng: 34.8670,
    country: 'Israel', region: 'Sharon',
    cameras: [],
  },
  {
    id: 'michmoret',
    name: 'Michmoret',
    lat: 32.3820, lng: 34.8710,
    country: 'Israel', region: 'Sharon',
    cameras: [],
  },
  {
    id: 'jisr-az-zarqa',
    name: 'Jisr Beach',
    lat: 32.5310, lng: 34.9090,
    country: 'Israel', region: 'Haifa District',
    cameras: [],
  },
  {
    id: 'nahariya',
    name: 'Nahariya',
    lat: 33.0050, lng: 35.0890,
    country: 'Israel', region: 'Northern District',
    cameras: [],
  },
  {
    id: 'acre-akko',
    name: 'Akko',
    lat: 32.9220, lng: 35.0680,
    country: 'Israel', region: 'Northern District',
    cameras: [],
  },

  // ── Hawaii, USA ──────────────────────────────────────────────────────────────
  {
    id: 'pipeline',
    name: 'Pipeline',
    lat: 21.6650, lng: -158.0530,
    country: 'USA', region: 'Hawaii',
    cameras: [],
  },
  {
    id: 'sunset-beach',
    name: 'Sunset Beach',
    lat: 21.6780, lng: -158.0400,
    country: 'USA', region: 'Hawaii',
    cameras: [],
  },
  {
    id: 'waimea-bay',
    name: 'Waimea Bay',
    lat: 21.6420, lng: -158.0660,
    country: 'USA', region: 'Hawaii',
    cameras: [],
  },
  {
    id: 'haleiwa',
    name: "Hale'iwa",
    lat: 21.5950, lng: -158.1060,
    country: 'USA', region: 'Hawaii',
    cameras: [],
  },

  // ── California, USA ──────────────────────────────────────────────────────────
  {
    id: 'mavericks',
    name: 'Mavericks',
    lat: 37.4920, lng: -122.5010,
    country: 'USA', region: 'California',
    cameras: [],
  },
  {
    id: 'steamer-lane',
    name: 'Steamer Lane',
    lat: 36.9510, lng: -122.0260,
    country: 'USA', region: 'California',
    cameras: [],
  },
  {
    id: 'trestles',
    name: 'Trestles',
    lat: 33.3810, lng: -117.5880,
    country: 'USA', region: 'California',
    cameras: [],
  },
  {
    id: 'huntington-beach',
    name: 'Huntington Beach',
    lat: 33.6550, lng: -118.0000,
    country: 'USA', region: 'California',
    cameras: [],
  },
  {
    id: 'rincon',
    name: 'Rincon',
    lat: 34.3720, lng: -119.4760,
    country: 'USA', region: 'California',
    cameras: [],
  },

  // ── Portugal ─────────────────────────────────────────────────────────────────
  {
    id: 'nazare',
    name: 'Nazaré',
    lat: 39.6010, lng: -9.0700,
    country: 'Portugal', region: 'Centro',
    cameras: [],
  },
  {
    id: 'supertubos',
    name: 'Supertubos',
    lat: 39.3560, lng: -9.3600,
    country: 'Portugal', region: 'Centro',
    cameras: [],
  },
  {
    id: 'ericeira',
    name: 'Ericeira',
    lat: 38.9620, lng: -9.4170,
    country: 'Portugal', region: 'Lisboa',
    cameras: [],
  },
  {
    id: 'sagres',
    name: 'Sagres',
    lat: 36.9980, lng: -8.9380,
    country: 'Portugal', region: 'Algarve',
    cameras: [],
  },

  // ── France ───────────────────────────────────────────────────────────────────
  {
    id: 'biarritz',
    name: 'Biarritz',
    lat: 43.4830, lng: -1.5586,
    country: 'France', region: 'Nouvelle-Aquitaine',
    cameras: [],
  },
  {
    id: 'hossegor',
    name: 'Hossegor',
    lat: 43.6640, lng: -1.4350,
    country: 'France', region: 'Nouvelle-Aquitaine',
    cameras: [],
  },
  {
    id: 'lacanau',
    name: 'Lacanau',
    lat: 45.0000, lng: -1.1970,
    country: 'France', region: 'Nouvelle-Aquitaine',
    cameras: [],
  },

  // ── Spain ────────────────────────────────────────────────────────────────────
  {
    id: 'mundaka',
    name: 'Mundaka',
    lat: 43.4060, lng: -2.6990,
    country: 'Spain', region: 'Basque Country',
    cameras: [],
  },
  {
    id: 'playa-norte-lanzarote',
    name: 'Playa Norte',
    lat: 29.0800, lng: -13.4800,
    country: 'Spain', region: 'Lanzarote',
    cameras: [],
  },

  // ── South Africa ─────────────────────────────────────────────────────────────
  {
    id: 'jeffreys-bay',
    name: "Jeffrey's Bay",
    lat: -34.0488, lng: 24.9117,
    country: 'South Africa', region: 'Eastern Cape',
    cameras: [],
  },
  {
    id: 'dungeons',
    name: 'Dungeons',
    lat: -34.0740, lng: 18.3280,
    country: 'South Africa', region: 'Western Cape',
    cameras: [],
  },
  {
    id: 'muizenberg',
    name: 'Muizenberg',
    lat: -34.1090, lng: 18.4710,
    country: 'South Africa', region: 'Western Cape',
    cameras: [],
  },

  // ── Australia ────────────────────────────────────────────────────────────────
  {
    id: 'snapper-rocks',
    name: 'Snapper Rocks',
    lat: -28.1680, lng: 153.5490,
    country: 'Australia', region: 'Queensland',
    cameras: [],
  },
  {
    id: 'bells-beach',
    name: 'Bells Beach',
    lat: -38.3690, lng: 144.2800,
    country: 'Australia', region: 'Victoria',
    cameras: [],
  },
  {
    id: 'margaret-river',
    name: 'Margaret River',
    lat: -33.9560, lng: 114.9900,
    country: 'Australia', region: 'Western Australia',
    cameras: [],
  },
  {
    id: 'manly-beach',
    name: 'Manly Beach',
    lat: -33.7970, lng: 151.2870,
    country: 'Australia', region: 'New South Wales',
    cameras: [],
  },

  // ── Indonesia ────────────────────────────────────────────────────────────────
  {
    id: 'uluwatu',
    name: 'Uluwatu',
    lat: -8.8290, lng: 115.0850,
    country: 'Indonesia', region: 'Bali',
    cameras: [],
  },
  {
    id: 'padang-padang',
    name: 'Padang Padang',
    lat: -8.8120, lng: 115.0880,
    country: 'Indonesia', region: 'Bali',
    cameras: [],
  },
  {
    id: 'g-land',
    name: 'G-Land',
    lat: -8.6710, lng: 114.3800,
    country: 'Indonesia', region: 'East Java',
    cameras: [],
  },
  {
    id: 'desert-point',
    name: 'Desert Point',
    lat: -8.7500, lng: 115.9000,
    country: 'Indonesia', region: 'Lombok',
    cameras: [],
  },

  // ── Tahiti / Pacific ─────────────────────────────────────────────────────────
  {
    id: 'teahupoo',
    name: "Teahupo'o",
    lat: -17.8630, lng: -149.2650,
    country: 'French Polynesia', region: 'Tahiti',
    cameras: [],
  },

  // ── Ireland / UK ─────────────────────────────────────────────────────────────
  {
    id: 'bundoran',
    name: 'Bundoran',
    lat: 54.4770, lng: -8.2820,
    country: 'Ireland', region: 'Donegal',
    cameras: [],
  },
  {
    id: 'fistral',
    name: 'Fistral Beach',
    lat: 50.4160, lng: -5.1060,
    country: 'UK', region: 'Cornwall',
    cameras: [],
  },

  // ── Morocco ──────────────────────────────────────────────────────────────────
  {
    id: 'anchor-point',
    name: 'Anchor Point',
    lat: 30.5350, lng: -9.7700,
    country: 'Morocco', region: 'Agadir',
    cameras: [],
  },
  {
    id: 'taghazout',
    name: 'Taghazout',
    lat: 30.5470, lng: -9.7090,
    country: 'Morocco', region: 'Agadir',
    cameras: [],
  },

  // ── Canary Islands ───────────────────────────────────────────────────────────
  {
    id: 'el-quemao',
    name: 'El Quemao',
    lat: 29.0800, lng: -13.4800,
    country: 'Spain', region: 'Lanzarote',
    cameras: [],
  },
  {
    id: 'la-santa',
    name: 'La Santa',
    lat: 29.1000, lng: -13.6560,
    country: 'Spain', region: 'Lanzarote',
    cameras: [],
  },

  // ── Chile ────────────────────────────────────────────────────────────────────
  {
    id: 'punta-de-lobos',
    name: 'Punta de Lobos',
    lat: -34.4200, lng: -72.0060,
    country: 'Chile', region: 'O\'Higgins',
    cameras: [],
  },

  // ── Brazil ───────────────────────────────────────────────────────────────────
  {
    id: 'itacare',
    name: 'Itacaré',
    lat: -14.2780, lng: -38.9950,
    country: 'Brazil', region: 'Bahia',
    cameras: [],
  },
  {
    id: 'itamambuca',
    name: 'Itamambuca',
    lat: -23.3300, lng: -44.8580,
    country: 'Brazil', region: 'São Paulo',
    cameras: [],
  },

  // ── Japan ────────────────────────────────────────────────────────────────────
  {
    id: 'chiba',
    name: 'Chiba',
    lat: 35.3990, lng: 140.1790,
    country: 'Japan', region: 'Chiba',
    cameras: [],
  },
  {
    id: 'shizunami',
    name: 'Shizunami',
    lat: 34.7460, lng: 138.0290,
    country: 'Japan', region: 'Shizuoka',
    cameras: [],
  },
];
