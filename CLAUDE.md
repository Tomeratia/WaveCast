# AGENTS.md — WaveCast

## Agent Role

You are a **Full-stack TypeScript/Node.js expert** building WaveCast — a surf wave forecasting web application.
You write clean, type-safe, production-grade code. You never take shortcuts on architecture boundaries or data integrity.

**Stack**: React (Vite) · Tailwind CSS · Node.js (Express) · Supabase (PostgreSQL) · Prisma ORM · SendGrid (email)

### Product Context

WaveCast is a **free, open-source alternative to Surfline**. It provides surfers with real-time wave forecasts, surf spot ratings, and personalized alerts — without a paywall. Key differentiators:
- Multi-source data aggregation (Open-Meteo + OpenWeatherMap) for reliability
- Transparent, configurable scoring algorithm (no black box)
- Email alerts when conditions match user preferences
- No premium tier — all features are free

---

## 1. Monorepo Structure

```
wavecast/
├── client/                    # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # Generic: Button, Card, Spinner, Modal
│   │   │   ├── map/           # Leaflet map components
│   │   │   ├── charts/        # Recharts graph components
│   │   │   └── layout/        # Navbar, Sidebar, ProtectedRoute
│   │   ├── pages/             # Route-level page components
│   │   ├── context/           # React context providers (AuthContext, etc.)
│   │   ├── hooks/             # Custom hooks (useAuth, useForecast, useSpots)
│   │   ├── services/          # API client (axios instance + interceptors)
│   │   └── utils/             # Client-side helpers (formatDate, etc.)
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── vite.config.ts
│
├── server/                    # Express backend
│   ├── routes/                # Route handlers (thin — validation + response only)
│   ├── services/              # Business logic (scoring, forecast, caching)
│   ├── adapters/              # External API adapters (one file per provider)
│   ├── repositories/          # Data access layer (only layer that imports Prisma)
│   ├── middleware/             # auth.ts, errorHandler.ts, rateLimiter.ts
│   ├── lib/                   # Singletons: supabase.ts, prisma.ts, logger.ts
│   └── config/                # scoring.ts, env.ts, providers.ts
│
├── shared/                    # Shared code between client & server
│   └── types/                 # DTOs, API response types, enums
│       ├── forecast.ts        # NormalizedForecast, SpotDTO, ScoreResult
│       ├── auth.ts            # UserDTO, AuthResponse, TokenPayload
│       └── index.ts           # Re-exports
│
├── prisma/
│   ├── schema.prisma          # Single source of truth for DB schema
│   └── migrations/            # Auto-generated — never edit manually
│
└── package.json               # Monorepo root (workspaces: client, server, shared)
```

### Layer Rule

```
Routes → Services → Repositories → Prisma/Supabase
```

**Never skip a layer.** Route handlers must NOT import Prisma or call adapters directly.
Only `server/repositories/` may import `@prisma/client`. Only `server/adapters/` may call external APIs.

---

## 2. Iron Rules (Constraints)

These rules are **non-negotiable**. The agent must follow them at all times without exception.

### Rule 1: All External API Calls Go Through the Cache Layer

Every request for weather/forecast data MUST pass through `server/services/cache.ts` → check DB cache → on miss, call adapter → store result. **No route handler or service may call a weather adapter directly.**

### Rule 2: Scoring Weights Are Locked

The surf rating algorithm in `server/config/scoring.ts` is the heart of the system. **NEVER modify weight values without explicit user approval.** If asked to "improve" or "tune", propose changes in text — do not apply to code.

### Rule 3: Tailwind CSS Only

All styling uses Tailwind utility classes. No inline `style={}` attributes. No CSS modules. No styled-components. If a design pattern requires a custom class, define it in `tailwind.config.ts` via `extend`. The only raw CSS file allowed is `client/src/index.css` for Tailwind's `@tailwind` directives and minimal global resets.

---

## 3. Multi-Source API Management

### Providers

| Provider | Role | Rate Limit | API Key |
|---|---|---|---|
| Open-Meteo | **Primary** | 10,000/day | Not required |
| OpenWeatherMap | **Fallback** | 60/min (free tier) | `OPENWEATHER_API_KEY` |

### Adapter Pattern

Every provider lives in its own file under `server/adapters/` and implements:

```ts
interface WeatherProvider {
  readonly name: string;
  fetch(lat: number, lon: number): Promise<NormalizedForecast[]>;
}
```

All adapters MUST return the canonical shape defined in `shared/types/forecast.ts`:

```ts
interface NormalizedForecast {
  swellHeight: number;      // meters
  swellPeriod: number;      // seconds
  swellDirection: number;   // degrees 0-360
  windSpeed: number;        // km/h
  windDirection: number;    // degrees 0-360
  timestamp: string;        // ISO 8601
}
```

**Provider-specific field mapping happens ONLY inside the adapter.** No provider-specific field names may leak outside `server/adapters/`.

### Rules

1. Use `Promise.allSettled` (not `Promise.all`) — one provider failing must not kill the request.
2. **Fallback order is fixed**: Open-Meteo → OpenWeatherMap. Do NOT reorder without user approval.
3. **Retry**: Max 2 retries, exponential backoff (1s, 3s). Never retry 4xx errors.
4. **Rate limiting**: Enforce per-adapter via `bottleneck` or token bucket. Document limits in each adapter's file header.
5. Do NOT add a new provider without creating a dedicated adapter file.
6. Never call `fetch`/`axios` to weather APIs outside of `server/adapters/`.

---

## 4. Surf Rating Algorithm (LOCKED)

### Weight Configuration

Defined in **one file only**: `server/config/scoring.ts`

```ts
export const SCORING_WEIGHTS = {
  swellHeight:    0.35,   // 35% — primary factor
  swellPeriod:    0.30,   // 30% — wave quality indicator
  windSpeed:      0.15,   // 15% — surface conditions
  windDirection:  0.10,   // 10% — offshore vs onshore
  tide:           0.10,   // 10% — water level impact
} as const; // MUST sum to 1.0
```

### Algorithm Contract

```ts
function calculateScore(forecast: NormalizedForecast, tide: TideData): number
// RETURNS: integer in [0, 100]
// IMPLEMENTATION:
//   1. Each sub-normalizer returns a value in [0, 1]
//   2. Weighted sum: Σ(weight_i × normalizedValue_i) × 100
//   3. Final clamp: Math.round(Math.max(0, Math.min(100, result)))
```

### Rules

1. **NEVER modify weight values** without explicit user approval. Propose changes in text only.
2. **No magic numbers** — the scoring function reads only from the config object.
3. **Output MUST be in [0, 100].** Enforce with clamp as the last step. Each normalizer returns `[0, 1]`.
4. Sub-scoring functions must be **pure, stateless, individually testable**.
5. Tests in `server/__tests__/scoring.test.ts` MUST include:
   - Assertion: weights sum to exactly `1.0`
   - Assertion: each weight matches expected value (0.35, 0.30, 0.15, 0.10, 0.10)
   - Boundary: all-zero input → `0`
   - Boundary: all-perfect input → `100`
   - Clamping: extreme values never produce output outside `[0, 100]`
   - Snapshot: known input → known output
6. If weights change (with approval), update config **AND** tests. Flag prominently in response.

---

## 5. Database Caching Layer (TTL = 3 Hours)

### Supabase Table

```sql
-- Table: forecast_cache
id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
spot_id     TEXT NOT NULL,
provider    TEXT NOT NULL,
data        JSONB NOT NULL,
fetched_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
UNIQUE(spot_id, provider)
```

Corresponding Prisma model:

```prisma
model ForecastCache {
  id        String   @id @default(uuid())
  spotId    String   @map("spot_id")
  provider  String
  data      Json
  fetchedAt DateTime @default(now()) @map("fetched_at")

  @@unique([spotId, provider])
  @@index([fetchedAt])
  @@map("forecast_cache")
}
```

### Cache-First Flow

```
Request → services/forecast.ts → cache.get(spotId)
  ├── HIT (fetchedAt < 3h ago) → return cached data
  └── MISS or STALE → call adapter → cache.upsert() → return fresh data
```

### Rules

1. **Cache-first, always.** Every forecast request goes through `getCachedOrFetch(spotId)`. Never call an adapter directly from a route.
2. **TTL check**:
   ```ts
   const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // from server/config/
   const staleThreshold = new Date(Date.now() - CACHE_TTL_MS);
   ```
3. **TTL constant**: Reference `CACHE_TTL_MS` from config. Never hardcode `10800000`.
4. **Cleanup job**: Delete rows where `fetched_at < NOW() - INTERVAL '6 hours'`. In dev: `setInterval`. In production: Supabase cron or pg_cron.
5. **Never bypass cache** — not even "just for testing". Use a separate test helper that clears cache explicitly.

---

## 6. Prisma + Supabase Schema Discipline

### Rules

1. **`prisma/schema.prisma` is the single source of truth.** Never modify the DB directly via Supabase dashboard DDL.
2. **Every schema change requires a migration:**
   ```bash
   npx prisma migrate dev --name descriptive-change-name
   ```
   Commit the migration file alongside the schema change.
3. **Never use `prisma db push`** on any branch that will be merged.
4. **Prisma client singleton**: Created once in `server/lib/prisma.ts`. Never instantiate `new PrismaClient()` elsewhere.
5. **Only `server/repositories/` imports Prisma.** Services receive plain data objects, not Prisma query builders.
6. **Supabase client** (`server/lib/supabase.ts`) is used only for auth and storage features — never for data queries that Prisma handles.
7. **No raw SQL** unless there is a documented performance justification.

---

## 7. Shared Types — DB ↔ React Sync

### Rules

1. **`shared/types/` is the single source of truth for DTOs.** Both `client/` and `server/` import from here. Never duplicate type definitions.
2. **Prisma types stay on the server.** Map Prisma models → DTOs in the repository layer:
   ```ts
   // server/repositories/spotRepo.ts
   import type { Spot } from '@prisma/client';
   import type { SpotDTO } from '@shared/types';
   function toDTO(spot: Spot): SpotDTO { ... }
   ```
3. **Schema change = DTO check.** When modifying `schema.prisma`, the corresponding DTO in `shared/types/` must be updated in the same commit.
4. **No `any` in DTOs.** Use `z.infer<typeof Schema>` for Zod-validated types.
5. **API response envelope**: All endpoints return `ApiResponse<T>`:
   ```ts
   interface ApiResponse<T> {
     success: boolean;
     data?: T;
     error?: { code: string; message: string };
   }
   ```

---

## 8. Authentication (JWT) & Protected Routes

### Server-Side

```
server/
  middleware/auth.ts        → verifyToken middleware
  routes/auth.ts            → POST /auth/register, /auth/login, /auth/refresh
  services/authService.ts   → token generation, password hashing
  config/env.ts             → JWT_SECRET, JWT_EXPIRY (validated at startup)
```

### Client-Side

```
client/src/
  context/AuthContext.tsx    → AuthProvider + useAuth hook
  components/layout/ProtectedRoute.tsx
  services/api.ts           → Axios instance + 401 interceptor
```

### Rules

1. **Two tokens**: Access token (15 min) **in memory only**. Refresh token (7 days) in `httpOnly` secure cookie. **Never store tokens in `localStorage`.**
2. **Default is protected.** All routes require auth unless explicitly listed in `PUBLIC_ROUTES`:
   ```ts
   const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh'];
   ```
3. **Frontend**: `<ProtectedRoute>` wraps authenticated pages. Checks `useAuth()`, redirects to `/login` if unauthenticated. Never check auth inside individual page components.
4. **Token refresh**: Axios interceptor catches 401 → calls `/auth/refresh` → retries original request. On refresh failure → logout + redirect.
5. **Passwords**: `bcrypt` with salt rounds >= 12. Never store plaintext. Never log passwords or tokens.
6. **`JWT_SECRET`** must be >= 32 chars. If missing at startup, server refuses to start.
7. **When adding a new route**, decide: public or protected? Default is **protected**. Adding to `PUBLIC_ROUTES` requires explicit justification.

---

## 9. Map (Leaflet.js) & Charts (Recharts)

### Leaflet Rules

1. Initialize in `useEffect` with cleanup — destroy on unmount:
   ```tsx
   useEffect(() => {
     const map = L.map(ref.current).setView([lat, lng], zoom);
     L.tileLayer('...').addTo(map);
     return () => { map.remove(); };
   }, []);
   ```
2. **Never re-create the map on data change.** Separate init effect (runs once) from data effect (runs on deps).
3. **Container must have explicit Tailwind height** (e.g., `h-[400px]` or `h-full` with a sized parent). No height = blank map, no error.
4. **Import `leaflet/dist/leaflet.css`** at the app entry point. Missing CSS = broken tiles with no console warning.

### Recharts Rules

5. Always wrap in `<ResponsiveContainer width="100%" height={...}>`. No fixed pixel widths.
6. Memoize chart data with `useMemo`. Memoize custom tooltips with `React.memo`.
7. Never compute derived chart data inside JSX.

### Shared

8. All map/chart components handle **3 states**: loading (skeleton), error (message + retry), data (render). Never render with `undefined`/`null` data.

---

## 10. Tailwind CSS Standards

1. **Utility-first, always.** Use Tailwind classes directly on elements. No `style={}` props.
2. **Custom values** go in `tailwind.config.ts` under `extend` — example:
   ```ts
   extend: {
     colors: {
       ocean: { 50: '#f0f9ff', 500: '#0284c7', 900: '#0c4a6e' },
       score: { poor: '#ef4444', fair: '#f59e0b', good: '#22c55e', epic: '#8b5cf6' },
     }
   }
   ```
3. **Responsive design**: Mobile-first. Use `sm:`, `md:`, `lg:` breakpoints. Test all pages at 375px width.
4. **Dark mode**: Use `dark:` variant. Toggle via class strategy in `tailwind.config.ts`.
5. **No CSS files** except `client/src/index.css` (for `@tailwind` directives and minimal resets).
6. **Component patterns**: Reusable UI components in `client/src/components/ui/` accept a `className` prop and merge it with defaults using `clsx` or `tailwind-merge`.

---

## 11. API Endpoints Reference

All endpoints return `ApiResponse<T>`. Protected routes require `Authorization: Bearer <token>` header.

### Auth (`server/routes/auth.ts`) — PUBLIC

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account (email, password, name) |
| POST | `/api/auth/login` | Login → returns access token + sets refresh cookie |
| POST | `/api/auth/refresh` | Refresh access token via httpOnly cookie |
| POST | `/api/auth/logout` | Clear refresh cookie |

### Forecast (`server/routes/forecast.ts`) — PROTECTED

| Method | Path | Description |
|---|---|---|
| GET | `/api/forecast/:spotId` | Get forecast + score for a spot (cache-first) |
| GET | `/api/forecast/:spotId/hourly` | Hourly breakdown for next 48h (for charts) |
| GET | `/api/spots` | List all supported surf spots |
| GET | `/api/spots/nearby?lat=&lng=&radius=` | Find spots near coordinates |

### Favorites (`server/routes/favorites.ts`) — PROTECTED

| Method | Path | Description |
|---|---|---|
| GET | `/api/favorites` | Get user's favorite spots |
| POST | `/api/favorites/:spotId` | Add spot to favorites |
| DELETE | `/api/favorites/:spotId` | Remove spot from favorites |

### Alerts (`server/routes/alerts.ts`) — PROTECTED

| Method | Path | Description |
|---|---|---|
| GET | `/api/alerts` | Get user's alert configurations |
| POST | `/api/alerts` | Create alert (spotId, minScore, time preference) |
| PUT | `/api/alerts/:alertId` | Update alert settings |
| DELETE | `/api/alerts/:alertId` | Delete alert |

### Rules

1. Every new endpoint must be added to this table. If it is public, add it to `PUBLIC_ROUTES` with justification.
2. All protected endpoints return `401` if token is missing/invalid, `403` if user lacks permission.
3. Validation: Use Zod schemas in route handlers. Return `400` with descriptive errors on invalid input.

---

## 12. Cron Jobs & Email Alerts (SendGrid)

### Architecture

```
server/
  jobs/
    ├── alertChecker.ts      # Cron: check conditions → send alerts
    └── cacheCleanup.ts      # Cron: purge stale cache rows
  services/
    └── emailService.ts      # SendGrid wrapper — single point of email sending
  templates/
    └── alertEmail.ts        # HTML template for surf alert emails
  config/
    └── env.ts               # SENDGRID_API_KEY, ALERT_FROM_EMAIL (validated)
```

### Alert Cron Flow

```
[Every 30 min] → jobs/alertChecker.ts
  1. Query all active alerts from DB (with user email + spot + minScore)
  2. For each alert: getCachedOrFetch(spotId) → calculateScore()
  3. If score >= alert.minScore AND alert not already sent today:
     → emailService.sendSurfAlert(user, spot, score, forecast)
     → Mark alert as sent (update last_sent_at)
```

### Cron Setup

Use `node-cron` for scheduling:

```ts
// server/jobs/index.ts
import cron from 'node-cron';
import { runAlertChecker } from './alertChecker';
import { runCacheCleanup } from './cacheCleanup';

// Check surf conditions every 30 minutes (5:00–20:00)
cron.schedule('*/30 5-20 * * *', runAlertChecker);

// Clean stale cache every 6 hours
cron.schedule('0 */6 * * *', runCacheCleanup);
```

### SendGrid Rules

1. **All email sending goes through `server/services/emailService.ts`.** Never import `@sendgrid/mail` elsewhere.
2. **`SENDGRID_API_KEY`** and **`ALERT_FROM_EMAIL`** are validated at startup in `config/env.ts`. If missing, email features are disabled (not crashed) — log a warning.
3. **Rate limiting**: SendGrid free tier = 100 emails/day. Track daily send count in DB. If limit reached, skip remaining alerts and log a warning.
4. **Deduplication**: Never send the same alert twice in one day. Use `last_sent_at` on the alert record. Reset daily.
5. **Template**: Email HTML lives in `server/templates/alertEmail.ts` as a function returning a string. No external template engine. Include: spot name, score, conditions summary, link to WaveCast.
6. **Unsubscribe**: Every alert email must include an unsubscribe link that hits `DELETE /api/alerts/:alertId` with a signed token.

### Prisma Model

```prisma
model Alert {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  spotId      String    @map("spot_id")
  minScore    Int       @map("min_score")  // 0-100
  timePref    String    @map("time_pref")  // "dawn", "morning", "any"
  active      Boolean   @default(true)
  lastSentAt  DateTime? @map("last_sent_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  user        User      @relation(fields: [userId], references: [id])
  @@map("alerts")
}
```

---

## 13. General Standards

- **TypeScript everywhere.** No `any`. Strict mode enabled in both `client/` and `server/` tsconfigs.
- **Environment variables**: Accessed only through `server/config/env.ts` with Zod validation. Never use `process.env` directly elsewhere.
- **Error handling**: Typed error classes (`ApiError`, `CacheError`, `ValidationError`). Express error middleware catches and formats them.
- **Tests**: Co-located `__tests__/` directories. API adapter tests use recorded fixtures (no real HTTP in CI). Scoring tests cover all edge cases.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`).

---

## 14. What NOT To Do

| Don't | Do Instead |
|---|---|
| Import Prisma in a route handler | Call repository from service |
| Call weather API without checking cache | Use `getCachedOrFetch()` |
| Change scoring weights silently | Ask user first, update config + tests |
| Hardcode API URLs or secrets | Put in `server/config/` + env validation |
| Use `prisma db push` on a real branch | Use `prisma migrate dev --name ...` |
| Add provider without adapter file | Create adapter implementing `WeatherProvider` |
| Leak provider field names outside adapters | Normalize inside the adapter |
| Import `@prisma/client` in client code | Use shared DTOs from `shared/types/` |
| Use `localStorage` for JWT tokens | Memory for access token, httpOnly cookie for refresh |
| Add a route without auth decision | Default to protected; justify if public |
| Return score outside 0–100 | Clamp: `Math.max(0, Math.min(100, score))` |
| Re-create Leaflet map on data change | Update markers/view on existing instance |
| Use inline `style={}` or CSS modules | Tailwind utility classes only |
| Write raw CSS in component files | Extend `tailwind.config.ts` if needed |
| Change `schema.prisma` without updating DTOs | Update `shared/types/` in same commit |
| Use Supabase client for data queries | Use Prisma; Supabase client is for auth/storage only |
| Import `@sendgrid/mail` outside emailService | All email goes through `services/emailService.ts` |
| Send same alert twice in one day | Check `last_sent_at` before sending |
| Add endpoint without updating Endpoints table | Document in section 11 |
| Send email without unsubscribe link | Every alert email includes signed unsubscribe link |
