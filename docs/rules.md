# rules.md — Development Rules & Conventions

These rules apply to every contributor (and every AI assistant) working on this project. Follow them strictly for consistent, secure, maintainable code.

---

## 1. General Principles
1. **Keep it simple.** Prefer readable code over clever code.
2. **One responsibility per file/function.**
3. **Never trust client input.** Validate everything on the server.
4. **No secrets in code.** Use environment variables only.
5. **Small commits, small PRs.** One feature or fix at a time.
6. **Follow the folder structure** in `Architecture.md`. Do not invent new top-level folders.
7. **Build in order** of `Phases.md`. Do not start a later phase before the current one is working.

---

## 2. What TO Use

### Backend
| Purpose | Library |
|---|---|
| Framework | `express` |
| DB | `mongoose` |
| Auth | `jsonwebtoken`, `bcryptjs` (or `bcrypt`), `cookie-parser` |
| Validation | `zod` |
| Security | `helmet`, `cors`, `express-rate-limit`, request-body/param sanitizer |
| Uploads | `multer` (memory storage) + `cloudinary` |
| Real-time | `socket.io` |
| Email | `nodemailer` |
| Logging | `pino` + `pino-http` (or `winston` + `morgan`) |
| Env | `dotenv` |
| Dev | `nodemon`, `pino-pretty` |
| Testing | `server/test-api.js` (requires running API and configured database) |
| Compression | `compression` |

### Frontend
| Purpose | Library |
|---|---|
| Build tool | `vite` |
| Routing | `react-router-dom` v7 |
| HTTP | `fetch` through `client/src/services/api.js` |
| State | React Context and localStorage |
| Forms | Controlled React inputs; server-side Zod validation |
| Styling | Standard CSS, semantic component classes, CSS custom properties |
| Icons | `lucide-react` |
| Toasts | `react-hot-toast` |
| Real-time | Server Socket.IO; no client socket connection currently |
| Testing | `npm run build`, `npm run lint` |

---

## 3. What to AVOID

- ❌ **Storing JWT in localStorage** → keep access token in memory, refresh token in httpOnly cookie.
- ❌ **Storing images on the server disk or in MongoDB** → use Cloudinary.
- ❌ **`console.log` in committed code** → use the logger (server) or remove it (client).
- ❌ **Fat controllers** → business logic belongs in `services/`.
- ❌ **Calling `fetch` directly from components** → use the shared API wrapper.
- ❌ **Redux** (overkill for this project), **moment.js** (deprecated), **request** (deprecated).
- ❌ **Inline style objects / unscoped stylesheets** → use semantic classes in the page, component, and global CSS files.
- ❌ **Prop drilling beyond 2 levels** → use the existing app context where state is shared.
- ❌ **Trusting `req.body` directly** (mass assignment) → pick allowed fields via Zod schema.
- ❌ **Returning password, tokens, or serial numbers in API responses.**
- ❌ **Hard-coded URLs, keys, magic numbers** → constants/env.
- ❌ **Using `any`-style loose code, giant components (>250 lines), or deeply nested callbacks.**
- ❌ **Unindexed queries** on large collections.
- ❌ **Committing `.env`, `node_modules`, build output.**
- ❌ **Skipping error handling in async code.**

---

## 4. Naming & Code Style

| Item | Convention | Example |
|---|---|---|
| Variables / functions | camelCase | `getListingById` |
| React components | PascalCase, file = component name | `ListingCard.jsx` |
| Hooks | `use` prefix | `useDebounce` |
| Constants | UPPER_SNAKE_CASE | `MAX_IMAGES` |
| Mongoose models | PascalCase singular, file `X.model.js` | `Listing.model.js` |
| Routes / controllers / services | `x.routes.js`, `x.controller.js`, `x.service.js` | `order.service.js` |
| API endpoints | plural nouns, kebab-case, versioned | `/api/v1/listings` |
| DB fields | camelCase | `createdAt` |
| Git branches | `feature/…`, `fix/…`, `chore/…` | `feature/listing-crud` |
| Commits | Conventional Commits | `feat(listing): add image upload` |

- Use **ES Modules** (`"type": "module"`) on both client and server.
- Use `async/await` (no `.then` chains).
- Prettier: 2 spaces, single quotes, semicolons, trailing commas `es5`, print width 100.
- Every route file must be mounted only through `routes/index.js`.

---

## 5. Error Handling

### 5.1 Backend

**Custom error class** — `utils/AppError.js`
```js
export class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**Async wrapper** — `utils/asyncHandler.js`
```js
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

**Rules**
1. Wrap **every** async controller in `asyncHandler`. No try/catch in controllers unless needed for special handling.
2. Throw `AppError` from services: `throw new AppError('Listing not found', 404)`.
3. One **global error middleware** (`error.middleware.js`, last in `app.js`) formats all errors.
4. Convert known errors into friendly messages there:
   - Mongoose `ValidationError` → 400
   - Mongoose `CastError` (bad ObjectId) → 400
   - Duplicate key `code 11000` → 409
   - `JsonWebTokenError` → 401, `TokenExpiredError` → 401
   - `ZodError` → 400 with field-level `errors[]`
   - Multer errors (file too large) → 400
5. In **production**, never leak stack traces or internal messages for non-operational errors (send generic "Something went wrong").
6. Log all 5xx errors with the logger; log 4xx at `warn` level.
7. Handle `unhandledRejection` and `uncaughtException` in `server.js` — log and shut down gracefully.
8. Add a 404 handler for unknown routes.

**HTTP status codes used**
`200 OK · 201 Created · 204 No Content · 400 Bad Request · 401 Unauthorized · 403 Forbidden · 404 Not Found · 409 Conflict · 422 Unprocessable · 429 Too Many Requests · 500 Server Error`

### 5.2 Frontend
1. **Shared API wrapper** attaches the stored access token and surfaces response errors.
2. Show API `message` via **toast**; show field `errors[]` under the matching form input.
3. Wrap the app in an **Error Boundary** with a friendly fallback page.
4. Every data-fetching component must handle **loading, error, and empty** states.
5. Never show raw error objects or stack traces to users.
6. Handle loading, error, and empty states at the API-consuming view; provide a retry action where appropriate.

---

## 6. Validation Rules
- Validate with **Zod** on both sides (same rules; client for UX, server for security).
- Server: `validate(schema)` middleware runs before the controller for `body`, `params`, `query`.
- Strip unknown fields (`.strict()` or `.strip()`).
- Sanitize strings (trim); limit lengths (title ≤ 100, description ≤ 2000).

---

## 7. Security Checklist (must pass before each release)
- [ ] Passwords hashed (bcrypt, 12 rounds), never logged
- [ ] Auth routes rate-limited (e.g., 10 req / 15 min)
- [ ] CORS whitelist only the client origin
- [ ] `helmet` enabled
- [ ] Mongo sanitize + Zod on all inputs
- [ ] Ownership/role checks on every write endpoint
- [ ] File type & size checks on uploads
- [ ] Secrets only in env; `.env.example` maintained
- [ ] `npm audit` reviewed
- [ ] Payment webhook verifies signature and is idempotent
- [ ] Prices/amounts never taken from the client
- [ ] No card, UPI or bank data stored anywhere
- [ ] Serial/IMEI, phone, and full address excluded from public responses

---

## 8. API Rules
- All routes under `/api/v1`.
- Always use the standard response shape (`success, message, data, meta`).
- Paginate every list endpoint (default `limit=12`, max `50`).
- Use `select()` / `lean()` for read queries; `populate()` only needed fields.
- Never return arrays or objects without a wrapper.

## 9. Database Rules
- Add indexes for fields used in filters/sorts.
- Use `select: false` on sensitive fields (`password`, `serialNumber`).
- Use transactions when updating multiple collections (e.g., order + listing status).
- Use soft status (`removed`) instead of hard delete for listings with orders.

## 10. Frontend Rules
- Components: small, reusable, one job. Extract logic to hooks.
- Put API calls only in `src/api/`, never inside components.
- Query keys convention: `['listings', filters]`, `['listing', id]`.
- Lazy-load heavy/admin routes with `React.lazy`.
- All images: `loading="lazy"`, `alt` text, use Cloudinary transformations (`w_600,q_auto,f_auto`).
- Use semantic HTML and accessible labels.
- Mobile-first responsive CSS with semantic component classes.

## 11. Git & Workflow
- `main` = stable/production, `develop` = integration; work in feature branches.
- PR must: pass lint + tests, have a description, and be self-reviewed.
- Update `memory.md` after each finished task.
- Update `.env.example` whenever a new env var is added.

## 12. Testing Rules
- Server: test each service and critical route (auth, listing CRUD, order flow).
- Client: test forms and key components.
- Minimum: happy path + one failure path per feature.

## 13. Definition of Done
A task is done only when: code works, validation & error handling are in place, loading/empty/error UI handled, lint passes, tests added, docs/`memory.md` updated.


---

## 14. Payment Rules
1. Use the gateway's **marketplace** product (Razorpay Route / Stripe Connect). Never hold customer money in the platform's own account.
2. **Never store** card numbers, CVV, UPI PINs, or bank credentials. Store only `gatewayOrderId`, `gatewayPaymentId`, amount, and status.
3. **Amount is always computed on the server** from the listing price in the DB. Ignore any price sent by the client.
4. **Payment success = verified webhook**, not the frontend callback. The frontend callback only triggers a UI refresh.
5. Webhook route: use `express.raw()` for that route only, verify the signature, check `rawEventId` for duplicates, respond 200 fast, do heavy work after.
6. Use **MongoDB transactions** (or atomic `findOneAndUpdate` with status checks) when reserving a listing and creating an order, so two buyers cannot buy the same item.
7. Order state changes go through one function (`transitionOrder(order, newStatus)`) that enforces the allowed transitions and appends to `statusHistory`. No direct writes to `orderStatus` elsewhere.
8. Payouts and refunds are triggered only by server code (confirm-delivery, auto-confirm job, dispute resolution). Never from a client-supplied instruction.
9. Run scheduled jobs (`node-cron` or a job queue) for: cancelling stale pending orders, auto-confirming delivered orders, auto-cancelling unshipped orders.
10. Log every payment event and state change with order id (no sensitive payloads).
11. Test with the gateway's **test mode** and test cards. Keep live keys out of dev environments.

**Extra libraries:** `razorpay` (or `stripe`), `node-cron`.

## 15. Privacy Rules
1. Collect only the data the feature needs.
2. Sensitive fields (`password`, `serialNumber`, `refreshTokenHash`) use `select: false` and are removed by a `toJSON` transform.
3. Public profile and public listing endpoints use explicit **DTO/serializer functions** that whitelist fields. Never return a raw Mongoose document to the public.
4. Reveal full address only to the seller of a paid order, and only for that order.
5. Phone numbers stay hidden unless the user opts in.
6. Never log passwords, tokens, addresses, or payment payloads.
7. Provide "Delete my account" that anonymizes personal data while keeping the order records needed for accounting.
8. Show a data-wipe checklist to sellers before publishing a listing.
9. Serve everything over HTTPS in production; cookies are `httpOnly`, `secure`, and `sameSite`.

## 16. Component & Impact Data Rules
1. Each category has a **Zod spec schema** (see `Architecture.md`); the server rejects listings missing required specs (e.g., RAM without DDR type).
2. Use fixed enums for spec values such as DDR type, socket, and form factor, so filters stay reliable.
3. `for_parts` listings must describe what works and what is broken (minimum description length applies).
4. `impactKg` and `co2SavedKg` are **derived on the server** from the category weight table, not typed freely by sellers.
5. Any impact figure shown in the UI is labeled "estimated" and links to the methodology page with sources.
6. Recycler directory entries are added only by admins after verifying certification.
