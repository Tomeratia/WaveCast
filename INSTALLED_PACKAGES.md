# WaveCast — Installed npm Packages

When the project is complete, delete the `node_modules/` folder with:
```bash
rm -rf node_modules
```
Then tell Claude which specific packages to remove from `package.json` if needed.

---

## Direct Dependencies (defined in package.json files)

### Server (`server/package.json`)
| Package | Purpose |
|---|---|
| `express` | HTTP server framework |
| `cors` | Cross-origin resource sharing middleware |
| `cookie-parser` | Parse httpOnly cookies (refresh token) |
| `bcrypt` | Password hashing (salt rounds >= 12) |
| `jsonwebtoken` | JWT access & refresh token signing |
| `zod` | Runtime env validation + request schema validation |
| `@prisma/client` | Prisma ORM client (DB queries) |
| `prisma` | Prisma CLI (migrations, generate) |
| `@supabase/supabase-js` | Supabase client (auth & storage only) |
| `axios` | HTTP client for weather API adapters |
| `bottleneck` | Rate limiting per weather provider |
| `node-cron` | Cron scheduler (alert checker, cache cleanup) |
| `@sendgrid/mail` | SendGrid email client (surf alerts) |
| `tsx` | TypeScript runner for development |

### Client (`client/package.json`)
| Package | Purpose |
|---|---|
| `react` | UI library |
| `react-dom` | React DOM renderer |
| `react-router-dom` | Client-side routing |
| `axios` | API calls to backend |
| `leaflet` | Interactive surf spot map |
| `react-leaflet` | React wrapper for Leaflet |
| `recharts` | Wave forecast charts (hourly breakdown) |
| `lucide-react` | Icon library |
| `clsx` | Conditional class names utility |
| `tailwind-merge` | Merge Tailwind classes without conflicts |
| `vite` | Build tool & dev server |
| `@vitejs/plugin-react` | Vite plugin for React |
| `tailwindcss` | CSS utility framework |
| `postcss` | CSS processing (required by Tailwind) |
| `autoprefixer` | CSS vendor prefix automation |

### Shared (`shared/package.json`)
| Package | Purpose |
|---|---|
| `typescript` | TypeScript compiler |

---

## All packages in node_modules/ (307 total — includes transitive dependencies)

```
@alloc, @babel, @esbuild, @jridgewell, @mapbox, @nodelib, @prisma,
@react-leaflet, @remix-run, @rolldown, @rollup, @sendgrid,
@standard-schema, @supabase, @types, @vitejs, @wavecast,
abbrev, accepts, agent-base, ansi-regex, any-promise, anymatch,
aproba, are-we-there-yet, arg, array-flatten, asynckit, autoprefixer,
axios, balanced-match, baseline-browser-mapping, bcrypt,
binary-extensions, body-parser, bottleneck, brace-expansion, braces,
browserslist, buffer-equal-constant-time, bytes, c12,
call-bind-apply-helpers, call-bound, camelcase-css, caniuse-lite,
chokidar, chownr, citty, clsx, color-support, combined-stream,
commander, concat-map, confbox, consola, console-control-strings,
content-disposition, content-type, convert-source-map, cookie,
cookie-parser, cookie-signature, cors, cssesc, csstype, d3-array,
d3-color, d3-ease, d3-format, d3-interpolate, d3-path, d3-scale,
d3-shape, d3-time, d3-time-format, d3-timer, debug, decimal.js-light,
deepmerge, deepmerge-ts, defu, delayed-stream, delegates, depd,
destr, destroy, detect-libc, didyoumean, dlv, dom-helpers, dotenv,
dunder-proto, ecdsa-sig-formatter, ee-first, effect, electron-to-chromium,
emoji-regex, empathic, encodeurl, es-define-property, es-errors,
es-object-atoms, es-set-tostringtag, esbuild, escalade, escape-html,
etag, eventemitter3, express, exsolve, fast-check, fast-equals,
fast-glob, fastq, fill-range, finalhandler, follow-redirects, form-data,
forwarded, fraction.js, fresh, fs-minipass, fs.realpath, fsevents,
function-bind, gauge, gensync, get-intrinsic, get-proto, get-tsconfig,
giget, glob, glob-parent, gopd, has-symbols, has-tostringtag,
has-unicode, hasown, http-errors, https-proxy-agent, iceberg-js,
iconv-lite, inflight, inherits, internmap, ipaddr.js, is-binary-path,
is-core-module, is-extglob, is-fullwidth-code-point, is-glob,
is-number, jiti, js-tokens, jsesc, json5, jsonwebtoken, jwa, jws,
leaflet, lilconfig, lines-and-columns, lodash, lodash.includes,
lodash.isboolean, lodash.isinteger, lodash.isnumber, lodash.isplainobject,
lodash.isstring, lodash.once, loose-envify, lru-cache, lucide-react,
make-dir, math-intrinsics, media-typer, merge-descriptors, merge2,
methods, micromatch, mime, mime-db, mime-types, minimatch, minipass,
minizlib, mkdirp, ms, mz, nanoid, negotiator, node-addon-api,
node-cron, node-fetch, node-fetch-native, node-releases, nopt,
normalize-path, npmlog, nypm, object-assign, object-hash,
object-inspect, ohash, on-finished, once, parseurl, path-is-absolute,
path-parse, path-to-regexp, pathe, perfect-debounce, picocolors,
picomatch, pify, pirates, pkg-types, postcss, postcss-import,
postcss-js, postcss-load-config, postcss-nested, postcss-selector-parser,
postcss-value-parser, prisma, prop-types, proxy-addr, proxy-from-env,
pure-rand, qs, queue-microtask, range-parser, raw-body, rc9, react,
react-dom, react-is, react-leaflet, react-refresh, react-router,
react-router-dom, react-smooth, react-transition-group, read-cache,
readable-stream, readdirp, recharts, recharts-scale, resolve,
resolve-pkg-maps, reusify, rimraf, rollup, run-parallel, safe-buffer,
safer-buffer, scheduler, semver, send, serve-static, set-blocking,
setprototypeof, side-channel, side-channel-list, side-channel-map,
side-channel-weakmap, signal-exit, source-map-js, statuses,
string-width, string_decoder, strip-ansi, sucrase, tailwind-merge,
tailwindcss, tar, thenify, thenify-all, tiny-invariant, tinyexec,
tinyglobby, to-regex-range, toidentifier, tr46, ts-interface-checker,
tslib, tsx, type-is, typescript, undici-types, unpipe,
update-browserslist-db, util-deprecate, utils-merge, uuid, vary,
victory-vendor, vite, webidl-conversions, whatwg-url, wide-align,
wrappy, ws, yallist, zod
```

---

## How to restore after deletion

```bash
# From the project root:
npm install
```
