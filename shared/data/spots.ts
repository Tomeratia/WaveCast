import type { SpotDTO } from '../types/index.js';

export const SPOTS: SpotDTO[] = [
  // ── Israel ──────────────────────────────────────────────────────────────────
  { id: 'tel-aviv-hilton',    name: 'Hilton Beach',     lat: 32.0907, lng: 34.7707,   country: 'Israel',           region: 'Tel Aviv' },
  { id: 'tel-aviv-maaravi',   name: "Ma'aravi Beach",   lat: 32.0745, lng: 34.7655,   country: 'Israel',           region: 'Tel Aviv' },
  { id: 'tel-aviv-manau',     name: 'Manau (Naourim)',  lat: 32.0871, lng: 34.7687,   country: 'Israel',           region: 'Tel Aviv' },
  { id: 'herzliya-dromi',     name: 'Herzliya Dromi',   lat: 32.1560, lng: 34.7980,   country: 'Israel',           region: 'Sharon' },
  { id: 'herzliya-zvulun',    name: 'Herzliya Zvulun',  lat: 32.1682, lng: 34.8004,   country: 'Israel',           region: 'Sharon' },
  { id: 'netanya-poleg',      name: 'Netanya Poleg',    lat: 32.3512, lng: 34.8545,   country: 'Israel',           region: 'Sharon' },
  { id: 'netanya-north',      name: 'Netanya North',    lat: 32.3380, lng: 34.8510,   country: 'Israel',           region: 'Sharon' },
  { id: 'caesarea',           name: 'Caesarea',         lat: 32.5000, lng: 34.8980,   country: 'Israel',           region: 'Haifa District' },
  { id: 'hadera',             name: 'Hadera',           lat: 32.4420, lng: 34.8890,   country: 'Israel',           region: 'Haifa District' },
  { id: 'haifa-bat-galim',    name: 'Bat Galim',        lat: 32.8260, lng: 34.9610,   country: 'Israel',           region: 'Haifa' },
  { id: 'haifa-dado',         name: 'Dado Beach',       lat: 32.7980, lng: 34.9600,   country: 'Israel',           region: 'Haifa' },
  { id: 'ashdod',             name: 'Ashdod',           lat: 31.7920, lng: 34.6360,   country: 'Israel',           region: 'Southern District' },
  { id: 'ashkelon',           name: 'Ashkelon',         lat: 31.6640, lng: 34.5650,   country: 'Israel',           region: 'Southern District' },
  { id: 'palmachim',          name: 'Palmachim',        lat: 31.9270, lng: 34.6900,   country: 'Israel',           region: 'Central District' },
  { id: 'beit-yanai',         name: 'Beit Yanai',       lat: 32.4070, lng: 34.8670,   country: 'Israel',           region: 'Sharon' },
  { id: 'michmoret',          name: 'Michmoret',        lat: 32.3820, lng: 34.8710,   country: 'Israel',           region: 'Sharon' },
  { id: 'jisr-az-zarqa',      name: 'Jisr Beach',       lat: 32.5310, lng: 34.9090,   country: 'Israel',           region: 'Haifa District' },
  { id: 'nahariya',           name: 'Nahariya',         lat: 33.0050, lng: 35.0890,   country: 'Israel',           region: 'Northern District' },
  { id: 'acre-akko',          name: 'Akko',             lat: 32.9220, lng: 35.0680,   country: 'Israel',           region: 'Northern District' },

  // ── Hawaii, USA ──────────────────────────────────────────────────────────────
  { id: 'pipeline',           name: 'Pipeline',         lat: 21.6650, lng: -158.0530, country: 'USA',              region: 'Hawaii' },
  { id: 'sunset-beach',       name: 'Sunset Beach',     lat: 21.6780, lng: -158.0400, country: 'USA',              region: 'Hawaii' },
  { id: 'waimea-bay',         name: 'Waimea Bay',       lat: 21.6420, lng: -158.0660, country: 'USA',              region: 'Hawaii' },
  { id: 'haleiwa',            name: "Hale'iwa",         lat: 21.5950, lng: -158.1060, country: 'USA',              region: 'Hawaii' },

  // ── California, USA ──────────────────────────────────────────────────────────
  { id: 'mavericks',          name: 'Mavericks',        lat: 37.4920, lng: -122.5010, country: 'USA',              region: 'California' },
  { id: 'steamer-lane',       name: 'Steamer Lane',     lat: 36.9510, lng: -122.0260, country: 'USA',              region: 'California' },
  { id: 'trestles',           name: 'Trestles',         lat: 33.3810, lng: -117.5880, country: 'USA',              region: 'California' },
  { id: 'huntington-beach',   name: 'Huntington Beach', lat: 33.6550, lng: -118.0000, country: 'USA',              region: 'California' },
  { id: 'rincon',             name: 'Rincon',           lat: 34.3720, lng: -119.4760, country: 'USA',              region: 'California' },

  // ── Portugal ─────────────────────────────────────────────────────────────────
  { id: 'nazare',             name: 'Nazaré',           lat: 39.6010, lng: -9.0700,   country: 'Portugal',         region: 'Centro' },
  { id: 'supertubos',         name: 'Supertubos',       lat: 39.3560, lng: -9.3600,   country: 'Portugal',         region: 'Centro' },
  { id: 'ericeira',           name: 'Ericeira',         lat: 38.9620, lng: -9.4170,   country: 'Portugal',         region: 'Lisboa' },
  { id: 'sagres',             name: 'Sagres',           lat: 36.9980, lng: -8.9380,   country: 'Portugal',         region: 'Algarve' },

  // ── France ───────────────────────────────────────────────────────────────────
  { id: 'biarritz',           name: 'Biarritz',         lat: 43.4830, lng: -1.5586,   country: 'France',           region: 'Nouvelle-Aquitaine' },
  { id: 'hossegor',           name: 'Hossegor',         lat: 43.6640, lng: -1.4350,   country: 'France',           region: 'Nouvelle-Aquitaine' },
  { id: 'lacanau',            name: 'Lacanau',          lat: 45.0000, lng: -1.1970,   country: 'France',           region: 'Nouvelle-Aquitaine' },

  // ── Spain ────────────────────────────────────────────────────────────────────
  { id: 'mundaka',            name: 'Mundaka',          lat: 43.4060, lng: -2.6990,   country: 'Spain',            region: 'Basque Country' },
  { id: 'playa-norte-lanzarote', name: 'Playa Norte',  lat: 29.0800, lng: -13.4800,  country: 'Spain',            region: 'Lanzarote' },

  // ── South Africa ─────────────────────────────────────────────────────────────
  { id: 'jeffreys-bay',       name: "Jeffrey's Bay",   lat: -34.0488, lng: 24.9117,  country: 'South Africa',     region: 'Eastern Cape' },
  { id: 'dungeons',           name: 'Dungeons',        lat: -34.0740, lng: 18.3280,  country: 'South Africa',     region: 'Western Cape' },
  { id: 'muizenberg',         name: 'Muizenberg',      lat: -34.1090, lng: 18.4710,  country: 'South Africa',     region: 'Western Cape' },

  // ── Australia ────────────────────────────────────────────────────────────────
  { id: 'snapper-rocks',      name: 'Snapper Rocks',   lat: -28.1680, lng: 153.5490, country: 'Australia',        region: 'Queensland' },
  { id: 'bells-beach',        name: 'Bells Beach',     lat: -38.3690, lng: 144.2800, country: 'Australia',        region: 'Victoria' },
  { id: 'margaret-river',     name: 'Margaret River',  lat: -33.9560, lng: 114.9900, country: 'Australia',        region: 'Western Australia' },
  { id: 'manly-beach',        name: 'Manly Beach',     lat: -33.7970, lng: 151.2870, country: 'Australia',        region: 'New South Wales' },

  // ── Indonesia ────────────────────────────────────────────────────────────────
  { id: 'uluwatu',            name: 'Uluwatu',         lat: -8.8290,  lng: 115.0850, country: 'Indonesia',        region: 'Bali' },
  { id: 'padang-padang',      name: 'Padang Padang',   lat: -8.8120,  lng: 115.0880, country: 'Indonesia',        region: 'Bali' },
  { id: 'g-land',             name: 'G-Land',          lat: -8.6710,  lng: 114.3800, country: 'Indonesia',        region: 'East Java' },
  { id: 'desert-point',       name: 'Desert Point',    lat: -8.7500,  lng: 115.9000, country: 'Indonesia',        region: 'Lombok' },

  // ── Tahiti / Pacific ─────────────────────────────────────────────────────────
  { id: 'teahupoo',           name: "Teahupo'o",       lat: -17.8630, lng: -149.2650, country: 'French Polynesia', region: 'Tahiti' },

  // ── Ireland / UK ─────────────────────────────────────────────────────────────
  { id: 'bundoran',           name: 'Bundoran',        lat: 54.4770,  lng: -8.2820,  country: 'Ireland',          region: 'Donegal' },
  { id: 'fistral',            name: 'Fistral Beach',   lat: 50.4160,  lng: -5.1060,  country: 'UK',               region: 'Cornwall' },

  // ── Morocco ──────────────────────────────────────────────────────────────────
  { id: 'anchor-point',       name: 'Anchor Point',    lat: 30.5350,  lng: -9.7700,  country: 'Morocco',          region: 'Agadir' },
  { id: 'taghazout',          name: 'Taghazout',       lat: 30.5470,  lng: -9.7090,  country: 'Morocco',          region: 'Agadir' },

  // ── Canary Islands ───────────────────────────────────────────────────────────
  { id: 'el-quemao',          name: 'El Quemao',       lat: 29.0800,  lng: -13.4800, country: 'Spain',            region: 'Lanzarote' },
  { id: 'la-santa',           name: 'La Santa',        lat: 29.1000,  lng: -13.6560, country: 'Spain',            region: 'Lanzarote' },

  // ── Chile ────────────────────────────────────────────────────────────────────
  { id: 'punta-de-lobos',     name: 'Punta de Lobos',  lat: -34.4200, lng: -72.0060, country: 'Chile',            region: "O'Higgins" },

  // ── Brazil ───────────────────────────────────────────────────────────────────
  { id: 'itacare',            name: 'Itacaré',         lat: -14.2780, lng: -38.9950, country: 'Brazil',           region: 'Bahia' },
  { id: 'itamambuca',         name: 'Itamambuca',      lat: -23.3300, lng: -44.8580, country: 'Brazil',           region: 'São Paulo' },

  // ── Japan ────────────────────────────────────────────────────────────────────
  { id: 'chiba',              name: 'Chiba',           lat: 35.3990,  lng: 140.1790, country: 'Japan',            region: 'Chiba' },
  { id: 'shizunami',          name: 'Shizunami',       lat: 34.7460,  lng: 138.0290, country: 'Japan',            region: 'Shizuoka' },
];
