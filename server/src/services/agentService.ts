import { GoogleGenerativeAI, type FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { env } from '../config/env.js';
import { spotRepo } from '../repositories/spotRepo.js';
import { forecastService } from './forecastService.js';
import { logger } from '../lib/logger.js';

const MODEL = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `You are a friendly surf forecasting assistant for WaveCast, a free surf forecasting app.
You help surfers understand wave conditions at various spots around the world.
Always use the provided tools to fetch live data before answering questions about conditions.
Respond in the same language the user writes in.
Score labels: flat (<20), poor (20–39), fair (40–59), good (60–79), epic (80+).
Keep answers concise, practical, and surf-focused.
When recommending spots, always mention the score and key conditions (wave height, period, wind).`;

const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'search_spots',
    description:
      'Returns a list of all known surf spots with their IDs, names, and locations. Use this to discover available spots or to find a spot ID before fetching its forecast.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  {
    name: 'get_forecast',
    description:
      'Get the current surf forecast and score for a named surf spot. Returns wave height, period, direction, wind, and an overall score.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spot_name: {
          type: SchemaType.STRING,
          description:
            'The name of the surf spot (e.g. "Bali", "Tel Aviv", "Pipeline"). Case-insensitive partial match is supported.',
        },
      },
      required: ['spot_name'],
    },
  },
  {
    name: 'get_best_spots',
    description:
      'Returns the top N surf spots ranked by current conditions score. Use this when the user asks where to surf or wants recommendations.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        top_n: {
          type: SchemaType.NUMBER,
          description: 'How many spots to return (default 3, max 10)',
        },
      },
    },
  },
];

interface GetForecastInput {
  spot_name: string;
}

interface GetBestSpotsInput {
  top_n?: number;
}

async function toolSearchSpots(): Promise<string> {
  const spots = await spotRepo.findAll();
  return JSON.stringify(
    spots.map((s) => ({ id: s.id, name: s.name, country: s.country, region: s.region })),
  );
}

async function toolGetForecast(input: GetForecastInput): Promise<string> {
  const spots = await spotRepo.findAll();
  const query = input.spot_name.toLowerCase();
  const spot = spots.find(
    (s) =>
      s.name.toLowerCase().includes(query) ||
      s.region.toLowerCase().includes(query) ||
      s.country.toLowerCase().includes(query),
  );

  if (!spot) {
    return JSON.stringify({
      error: `No spot found matching "${input.spot_name}". Try search_spots to see available spots.`,
    });
  }

  try {
    const forecast = await forecastService.getSpotForecast(spot.id);
    return JSON.stringify({
      spot: { id: spot.id, name: spot.name, country: spot.country, region: spot.region },
      current: forecast.current,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return JSON.stringify({ error: `Failed to fetch forecast for ${spot.name}: ${message}` });
  }
}

async function toolGetBestSpots(input: GetBestSpotsInput): Promise<string> {
  const topN = Math.min(input.top_n ?? 3, 10);
  const spots = await spotRepo.findAll();

  const results = await Promise.allSettled(
    spots.map(async (spot) => {
      const forecast = await forecastService.getSpotForecast(spot.id);
      return { spot, score: forecast.current.score.overall, forecast: forecast.current };
    }),
  );

  const successful = results
    .filter(
      (
        r,
      ): r is PromiseFulfilledResult<{
        spot: (typeof spots)[0];
        score: number;
        forecast: unknown;
      }> => r.status === 'fulfilled',
    )
    .map((r) => r.value)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return JSON.stringify(
    successful.map((r) => ({
      name: r.spot.name,
      country: r.spot.country,
      region: r.spot.region,
      score: r.score,
      conditions: r.forecast,
    })),
  );
}

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'search_spots':
      return toolSearchSpots();
    case 'get_forecast':
      return toolGetForecast(args as GetForecastInput);
    case 'get_best_spots':
      return toolGetBestSpots(args as GetBestSpotsInput);
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

async function chat(message: string): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    return 'AI assistant is not configured. Please set GEMINI_API_KEY to enable this feature.';
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
  });

  const chatSession = model.startChat();

  // Send the initial user message
  let response = await chatSession.sendMessage(message);

  // Tool use loop — Gemini may request multiple rounds of function calls
  for (let iteration = 0; iteration < 10; iteration++) {
    const candidate = response.response.candidates?.[0];
    if (!candidate) break;

    const functionCalls = response.response.functionCalls();

    if (!functionCalls || functionCalls.length === 0) {
      // No tool calls — extract and return text
      return response.response.text();
    }

    // Execute all requested tools and collect results
    const functionResults = await Promise.all(
      functionCalls.map(async (call) => {
        logger.debug('Agent executing tool', { tool: call.name, args: call.args });
        const result = await executeTool(call.name, call.args as Record<string, unknown>);
        return {
          functionResponse: {
            name: call.name,
            response: { result },
          },
        };
      }),
    );

    // Send tool results back to Gemini and continue the loop
    response = await chatSession.sendMessage(functionResults);
  }

  return 'I was unable to complete the request.';
}

export const agentService = { chat };
