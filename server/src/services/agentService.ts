import OpenAI from 'openai';
import { env } from '../config/env.js';
import { forecastService } from './forecastService.js';
import { logger } from '../lib/logger.js';
import type { SpotDTO } from '@wavecast/shared';

// Groq uses OpenAI-compatible API — free, fast, no rate limit issues for dev
const MODEL = 'llama-3.3-70b-versatile';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

const SYSTEM_PROMPT = `You are a friendly surf forecasting assistant for WaveCast, a free surf forecasting app.
You help surfers understand wave conditions at various spots around the world.
Always use the provided tools to fetch live data before answering questions about conditions.
Respond in the same language the user writes in.
Score labels: flat (<20), poor (20–39), fair (40–59), good (60–79), epic (80+).
Keep answers concise, practical, and surf-focused.
When recommending spots, always mention the score and key conditions (wave height, period, wind).
IMPORTANT: When calling tools, always use valid JSON for arguments. Never use any other format.`;

const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_spots',
      description: 'Returns a list of all known surf spots with their IDs, names, and locations.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_forecast',
      description: 'Get the current surf forecast and score for a named surf spot.',
      parameters: {
        type: 'object',
        properties: {
          spot_name: {
            type: 'string',
            description: 'The name of the surf spot (e.g. "Bali", "Tel Aviv", "Pipeline"). Case-insensitive partial match.',
          },
        },
        required: ['spot_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_best_spots',
      description: 'Returns the top N surf spots ranked by current conditions score.',
      parameters: {
        type: 'object',
        properties: {
          top_n: { type: 'number', description: 'How many spots to return (default 3, max 5)' },
        },
      },
    },
  },
];

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
  { id: 'jeffreys-bay',     name: "Jeffrey's Bay",  lat: -34.0488, lng: 24.9117,   country: 'South Africa',     region: 'Eastern Cape' },
  { id: 'snapper-rocks',    name: 'Snapper Rocks',  lat: -28.1680, lng: 153.5490,  country: 'Australia',        region: 'Queensland' },
  { id: 'uluwatu',          name: 'Uluwatu',        lat: -8.8290,  lng: 115.0850,  country: 'Indonesia',        region: 'Bali' },
  { id: 'padang-padang',    name: 'Padang Padang',  lat: -8.8120,  lng: 115.0880,  country: 'Indonesia',        region: 'Bali' },
  { id: 'teahupoo',         name: "Teahupo'o",      lat: -17.8630, lng: -149.2650, country: 'French Polynesia', region: 'Tahiti' },
  { id: 'bundoran',         name: 'Bundoran',       lat: 54.4770,  lng: -8.2820,   country: 'Ireland',          region: 'Donegal' },
  { id: 'anchor-point',     name: 'Anchor Point',   lat: 30.5350,  lng: -9.7700,   country: 'Morocco',          region: 'Agadir' },
  { id: 'punta-de-lobos',   name: 'Punta de Lobos', lat: -34.4200, lng: -72.0060,  country: 'Chile',            region: "O'Higgins" },
  { id: 'chiba',            name: 'Chiba',          lat: 35.3990,  lng: 140.1790,  country: 'Japan',            region: 'Chiba' },
];

const BEST_SPOTS_SAMPLE = ['tel-aviv-hilton', 'pipeline', 'nazare', 'uluwatu', 'hossegor', 'jeffreys-bay', 'snapper-rocks', 'teahupoo'];

function findSpot(query: string): SpotDTO | undefined {
  const q = query.toLowerCase();
  return SPOTS.find((s) =>
    s.name.toLowerCase().includes(q) ||
    s.region.toLowerCase().includes(q) ||
    s.country.toLowerCase().includes(q),
  );
}

async function toolSearchSpots(): Promise<string> {
  return JSON.stringify(SPOTS.map((s) => ({ id: s.id, name: s.name, country: s.country, region: s.region })));
}

async function toolGetForecast(spotName: string): Promise<string> {
  const spot = findSpot(spotName);
  if (!spot) return JSON.stringify({ error: `No spot found matching "${spotName}". Try search_spots.` });
  try {
    const forecast = await forecastService.getSpotForecast(spot.id);
    return JSON.stringify({ spot: { id: spot.id, name: spot.name, country: spot.country, region: spot.region }, current: forecast.current });
  } catch (err) {
    return JSON.stringify({ error: `Failed to fetch forecast for ${spot.name}: ${err instanceof Error ? err.message : 'Unknown error'}` });
  }
}

async function toolGetBestSpots(topN: number): Promise<string> {
  const n = Math.min(topN, 5);
  const sample = SPOTS.filter((s) => BEST_SPOTS_SAMPLE.includes(s.id));
  const results = await Promise.allSettled(
    sample.map(async (spot) => {
      const forecast = await forecastService.getSpotForecast(spot.id);
      return { spot, score: forecast.current.score.overall, forecast: forecast.current };
    }),
  );
  const successful = results
    .filter((r): r is PromiseFulfilledResult<{ spot: SpotDTO; score: number; forecast: unknown }> => r.status === 'fulfilled')
    .map((r) => r.value)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
  return JSON.stringify(successful.map((r) => ({ name: r.spot.name, country: r.spot.country, region: r.spot.region, score: r.score, conditions: r.forecast })));
}

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  logger.debug('Agent executing tool', { tool: name });
  switch (name) {
    case 'search_spots':   return toolSearchSpots();
    case 'get_forecast':   return toolGetForecast(input['spot_name'] as string);
    case 'get_best_spots': return toolGetBestSpots((input['top_n'] as number) ?? 3);
    default:               return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

async function chat(message: string): Promise<string> {
  if (!env.API_KEY) {
    return 'AI assistant is not configured. Please set API_KEY to enable this feature.';
  }

  const client = new OpenAI({ apiKey: env.API_KEY, baseURL: GROQ_BASE_URL });
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: message },
  ];

  for (let iteration = 0; iteration < 10; iteration++) {
    let response: Awaited<ReturnType<typeof client.chat.completions.create>>;
    try {
      response = await client.chat.completions.create({ model: MODEL, tools: TOOLS, messages });
    } catch (err: unknown) {
      // Groq throws when the model generates malformed tool calls (non-JSON format).
      // Retry once without tools so the model can still answer in plain text.
      logger.warn('Agent tool call failed, retrying without tools', { err });
      const fallback = await client.chat.completions.create({ model: MODEL, messages });
      return fallback.choices[0]?.message.content ?? 'I was unable to complete the request.';
    }

    const choice = response.choices[0];
    if (!choice) break;

    if (choice.finish_reason === 'stop') {
      return choice.message.content ?? 'I could not generate a response.';
    }

    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
      messages.push(choice.message);
      for (const call of choice.message.tool_calls) {
        const args = JSON.parse(call.function.arguments || '{}') as Record<string, unknown>;
        const result = await executeTool(call.function.name, args);
        messages.push({ role: 'tool', tool_call_id: call.id, content: result });
      }
      continue;
    }

    break;
  }

  return 'I was unable to complete the request.';
}

export const agentService = { chat };
