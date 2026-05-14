import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Supabase (auth & storage only)
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),

  // JWT — secret must be >= 32 chars
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Weather APIs
  OPENWEATHER_API_KEY: z.string().min(1).optional(),

  // Groq (AI agent)
  API_KEY: z.string().min(1).optional(),

  // Gmail SMTP (optional — email features disabled if missing)
  GMAIL_USER: z.string().email().optional(),
  GMAIL_APP_PASSWORD: z.string().min(1).optional(),

  // Server
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Environment validation failed:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
