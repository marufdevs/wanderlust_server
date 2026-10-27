# AGENTS.md

Small single-file Express + MongoDB API. All app code lives in `index.js`; there are no routes/, controllers/, or tests directories.

## Run / verify

- Start: `node index.js` (no build, no test, no lint scripts that work). Node does not hot-reload; restart after any code or `.env` change.
- Requires a local `.env` with `MONGODB_URL` (Atlas connection string) and `PORT` (plain number, e.g. `5000`). Both are gitignored; no committed `.env.example`. Do not commit or print their values.
- Mongo connects via top-level `await connectToMongoDB()` before routes are built; on failure the process exits with code 1 — if the server won't start, check credentials/network first.
- Routes (all in `index.js`): `GET /` health, `GET /add-destination` (list all), `POST /add-destination` (insert, needs `Content-Type: application/json`, returns `{ insertedId }` with 201), `GET /add-destination/:id` (single fetch; 400 on malformed id, 404 if missing).
- DB name is `Wanderlust`, single collection `destination_collections`.

## Gotchas

- `"type": "module"` — always use ESM `import`, never `require`.
- Dependencies are **Express 5** (`^5.3.0`) and **MongoDB driver 7** — don't apply Express 4 advice (wildcard route strings like `'*'` are invalid in Express 5; use a regex or `/*splat`). Express 5 auto-forwards rejected promises from async handlers to the error middleware.
- `app.listen()` only accepts a numeric port. A URI/URL string gets misinterpreted as a socket path and the server binds to a pipe instead of TCP (ironically while still logging a success message). `PORT` must stay `5000`-style.
- Querying `{ _id: someString }` returns nothing — the MongoDB 7 driver no longer accepts string ids; always validate with `ObjectId.isValid()` and convert via `new ObjectId(id)` (see the `/add-destination/:id` route).
- Errors funnel through a single error middleware registered at the bottom of `index.js`; Mongo operations inside routes are wrapped in `try/catch` -> `next(err)`.
