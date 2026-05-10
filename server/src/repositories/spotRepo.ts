import type { SpotDTO } from '@wavecast/shared';

const SPOTS: SpotDTO[] = [
  { id: 'tel-aviv-hilton',  name: 'Hilton Beach',    lat: 32.0907,  lng: 34.7707,   country: 'Israel',           region: 'Tel Aviv' },
  { id: 'tel-aviv-maaravi', name: "Ma'aravi Beach",  lat: 32.0745,  lng: 34.7655,   country: 'Israel',           region: 'Tel Aviv' },
  { id: 'herzliya-dromi',   name: 'Herzliya Dromi',  lat: 32.1560,  lng: 34.7980,   country: 'Israel',           region: 'Sharon' },
  { id: 'netanya-poleg',    name: 'Netanya Poleg',   lat: 32.3512,  lng: 34.8545,   country: 'Israel',           region: 'Sharon' },
  { id: 'caesarea',         name: 'Caesarea',        lat: 32.5000,  lng: 34.8980,   country: 'Israel',           region: 'Haifa District' },
  { id: 'ashdod',           name: 'Ashdod',          lat: 31.7920,  lng: 34.6360,   country: 'Israel',           region: 'Southern District' },
  { id: 'pipeline',         name: 'Pipeline',        lat: 21.6650,  lng: -158.0530, country: 'USA',              region: 'Hawaii' },
  { id: 'sunset-beach',     name: 'Sunset Beach',    lat: 21.6780,  lng: -158.0400, country: 'USA',              region: 'Hawaii' },
  { id: 'mavericks',        name: 'Mavericks',       lat: 37.4920,  lng: -122.5010, country: 'USA',              region: 'California' },
  { id: 'nazare',           name: 'Nazaré',          lat: 39.6010,  lng: -9.0700,   country: 'Portugal',         region: 'Centro' },
  { id: 'supertubos',       name: 'Supertubos',      lat: 39.3560,  lng: -9.3600,   country: 'Portugal',         region: 'Centro' },
  { id: 'biarritz',         name: 'Biarritz',        lat: 43.4830,  lng: -1.5586,   country: 'France',           region: 'Nouvelle-Aquitaine' },
  { id: 'hossegor',         name: 'Hossegor',        lat: 43.6640,  lng: -1.4350,   country: 'France',           region: 'Nouvelle-Aquitaine' },
  { id: 'mundaka',          name: 'Mundaka',         lat: 43.4060,  lng: -2.6990,   country: 'Spain',            region: 'Basque Country' },
  { id: 'jeffreys-bay',     name: "Jeffrey's Bay",   lat: -34.0488, lng: 24.9117,   country: 'South Africa',     region: 'Eastern Cape' },
  { id: 'snapper-rocks',    name: 'Snapper Rocks',   lat: -28.1680, lng: 153.5490,  country: 'Australia',        region: 'Queensland' },
  { id: 'uluwatu',          name: 'Uluwatu',         lat: -8.8290,  lng: 115.0850,  country: 'Indonesia',        region: 'Bali' },
  { id: 'padang-padang',    name: 'Padang Padang',   lat: -8.8120,  lng: 115.0880,  country: 'Indonesia',        region: 'Bali' },
  { id: 'teahupoo',         name: "Teahupo'o",       lat: -17.8630, lng: -149.2650, country: 'French Polynesia', region: 'Tahiti' },
  { id: 'bundoran',         name: 'Bundoran',        lat: 54.4770,  lng: -8.2820,   country: 'Ireland',          region: 'Donegal' },
  { id: 'anchor-point',     name: 'Anchor Point',    lat: 30.5350,  lng: -9.7700,   country: 'Morocco',          region: 'Agadir' },
  { id: 'punta-de-lobos',   name: 'Punta de Lobos',  lat: -34.4200, lng: -72.0060,  country: 'Chile',            region: "O'Higgins" },
  { id: 'chiba',            name: 'Chiba',           lat: 35.3990,  lng: 140.1790,  country: 'Japan',            region: 'Chiba' },
];

export const spotRepo = {
  async findAll(): Promise<SpotDTO[]> {
    return SPOTS;
  },

  async findById(id: string): Promise<SpotDTO | undefined> {
    return SPOTS.find((s) => s.id === id);
  },

  toDTO(spot: SpotDTO): SpotDTO {
    return spot;
  },
};
