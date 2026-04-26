import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

/**
 * Supabase client — used ONLY for auth & storage features.
 * For data queries, use Prisma via the repository layer.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
