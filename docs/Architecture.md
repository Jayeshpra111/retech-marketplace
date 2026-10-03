# Architecture — Second-Hand Electronics Marketplace

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8, React Router 7, standard CSS |
| State / Data fetching | React Context, localStorage, fetch API wrapper |
| Forms & validation | Controlled React forms; server-side Zod validation |
| Backend | Node.js, Express 5 (CommonJS) |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT access token, rotating refresh cookie, bcrypt |
| Real-time | Socket.io server; client chat is currently local state |
| File storage | Cloudinary (via Multer memory storage) |
| Payments | Razorpay Route or Stripe Connect (marketplace: hold, split, payout, seller KYC) — Phase 5 |
| Email | Nodemailer (SMTP / Resend / SendGrid) |
| Validation (server) | Zod |
| Logging | Pino (or Winston) + Morgan for HTTP logs |
| Testing | Client build/lint; server API smoke script (requires configured API) |
| Deployment | Frontend: Vercel/Netlify · Backend: Render/Railway · DB: MongoDB Atlas |
| Tooling | ESLint, Prettier, Husky + lint-staged, dotenv |

---

## 2. High-Level Architecture

```
┌────────────────────┐         HTTPS / REST         ┌──────────────────────┐
│  React SPA (Vite)  │ ───────────────────────────► │  Express API Server  │
│  - Pages/Components│ ◄─────────────────────────── │  - Routes            │
│  - App Context     │        JSON responses        │  - Controllers       │
│  - API wrapper     │                              │  - Services          │
└─────────┬──────────┘                              │  - Middlewares       │
          │  WebSocket (Socket.io)                  └───────┬───────┬──────┘
          └────────────────────────────────────────────────►│       │
                                                            │       │
                                     ┌──────────────────────▼─┐   ┌─▼─────────────┐
                                     │ MongoDB Atlas          │   │ Cloudinary    │
                                     │ (Mongoose models)      │   │ (images)      │
                                     └────────────────────────┘   └───────────────┘
                                                            │
                                     ┌──────────────────────▼─┐   ┌───────────────┐
                                     │ Payment Gateway        │   │ Email service │
                                     └────────────────────────┘   └───────────────┘
```

**Backend pattern:** `Route → Middleware (auth/validate) → Controller → Service → Model`
- **Controller:** handles req/res only.
- **Service:** business logic, DB calls.
- **Model:** Mongoose schema.

---

## 3. Website Flow

### 3.1 Buyer Flow
```
Home → Browse/Search → Apply Filters → Listing Detail
   → (Login if needed) → Add to Wishlist / Chat / Make Offer / Buy Now
   → Checkout (address + payment) → Order Placed
   → Track Order → Delivered → Confirm → Leave Review
```

### 3.2 Seller Flow
```
Register → Verify Email → Complete Profile → Create Listing (images, details, condition)
   → Listing "Pending" → Admin Approves → Listing "Active"
   → Receive Chats/Offers/Orders → Confirm Order → Ship → Mark Completed → Get Rating
```

### 3.3 Admin Flow
```
Admin Login → Dashboard (stats) → Pending Listings → Approve/Reject
   → Reports Queue → Remove Listing / Ban User → Manage Categories
```

### 3.4 Auth Flow
```
Login → API returns an accessToken and sets the refreshToken httpOnly cookie
Client → stores the accessToken in localStorage; `services/api.js` adds the Bearer header
Refresh → server exposes `/auth/refresh`; client does not currently refresh automatically
```

### 3.5 Listing Status Lifecycle
`draft → pending → active → reserved → sold`  (or `rejected` / `removed`)

### 3.6 Order Status Lifecycle
`pending → paid → confirmed → shipped → delivered → completed`  (or `cancelled` / `refunded` / `disputed`)

### 3.7 Payment & Transaction Flow (online)
```
1. Buyer clicks "Buy Now"
2. POST /orders            → server loads listing from DB, checks status = active,
                             sets price from DB, sets listing = reserved, order = pending
3. POST /payments/create   → server creates gateway order (amount from DB) → returns gateway order id
4. Client opens gateway checkout (card/UPI handled entirely by gateway)
5. Gateway → POST /payments/webhook
      - verify signature with webhook secret
      - reject if rawEventId already processed (idempotency)
      - mark Payment = captured, Order = paid, paymentStatus = held
6. Seller sees the paid order → confirms → ships (adds tracking info) → order = shipped
7. Buyer receives → POST /orders/:id/confirm-delivery  (or auto-confirm at autoConfirmAt)
8. Server triggers gateway payout/transfer to seller (minus commission) → paymentStatus = released
   → order = completed → listing = sold → reviews unlocked → impact counter updated
```
**Failure paths**
- Payment fails or times out → order cancelled, listing back to `active` (scheduled job cleans up stale pending orders).
- Seller does not ship in N days → auto-cancel + full refund.
- Buyer opens dispute before `autoConfirmAt` → payout frozen, admin reviews evidence → refund or release.
- Cash on Delivery → no gateway; order = confirmed by seller; buyer pays on handover; seller marks completed.

---

## 4. Frontend Pages / Routes

| Route | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/browse` | Browse + filters | Public |
| `/listings/:id` | Listing detail | Public |
| `/login`, `/register` | Auth | Guest only |
| `/verify-email/:token`, `/forgot-password`, `/reset-password/:token` | Auth utilities | Guest |
| `/sell` | Create listing | Auth |
| `/checkout/:id` | Checkout | Public/demo flow |
| `/dashboard` | Seller dashboard | Auth |
| `/recycle` | Recycler directory | Public |
| `/impact` | Impact calculator | Public |
| `/verify-email/:token` | Email verification confirmation | Guest |
| `/admin` | Admin moderation page | Client role check |

---

## 5. Folder & File Structure

```
second-hand-marketplace/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/           # Navbar, Footer, listing cards, and modals
│   │   ├── context/              # AppContext
│   │   ├── data/                 # mock catalog and static data
│   │   ├── pages/                # route-level views
│   │   ├── services/api.js       # shared fetch wrapper and endpoint functions
│   │   ├── styles/               # global, component, browse, and page CSS
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── src/styles/ (global, component, page, responsive CSS)
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # mongoose connection
│   │   │   ├── env.js            # validated env vars
│   │   │   ├── cloudinary.js
│   │   │   └── logger.js
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   ├── Listing.model.js
│   │   │   ├── Category.model.js
│   │   │   ├── Order.model.js
│   │   │   ├── Conversation.model.js
│   │   │   ├── Message.model.js
│   │   │   ├── Offer.model.js
│   │   │   ├── Review.model.js
│   │   │   ├── Report.model.js
│   │   │   ├── Wishlist.model.js
│   │   │   ├── Payment.model.js
│   │   │   ├── Dispute.model.js
│   │   │   └── RecyclingCenter.model.js
│   │   ├── routes/
│   │   │   ├── index.js          # mounts all routers under /api/v1
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── listing.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── review.routes.js
│   │   │   ├── report.routes.js
│   │   │   ├── payment.routes.js      # create payment, webhook
│   │   │   ├── impact.routes.js
│   │   │   └── admin.routes.js
│   │   ├── controllers/          # one per route file
│   │   ├── services/             # business logic
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js       # protect, restrictTo
│   │   │   ├── validate.middleware.js   # zod validation
│   │   │   ├── upload.middleware.js     # multer
│   │   │   ├── rateLimit.middleware.js
│   │   │   └── error.middleware.js      # global error handler
│   │   ├── validators/           # zod schemas per resource
│   │   ├── utils/
│   │   │   ├── AppError.js
│   │   │   ├── asyncHandler.js
│   │   │   ├── apiResponse.js
│   │   │   ├── token.js
│   │   │   └── sendEmail.js
│   │   ├── sockets/              # socket.io handlers
│   │   ├── app.js                # express app setup
│   │   └── server.js             # http server + db connect + socket init
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── docs/                         # PRD.md, Architecture.md, rules.md, Phases.md, design.md, memory.md
├── .gitignore
└── README.md
```

---

## 6. Database Schemas (summary)

**User**
`name, email (unique), password (select:false), role (buyer|seller|admin — default "user" with seller ability), avatar{url,publicId}, phone, address{city,state,pincode}, isEmailVerified, isBanned, ratingAvg, ratingCount, refreshTokenHash, createdAt`

**Category**
`name, slug, parent (ref Category), icon`

**Listing**
`seller (ref User), title, slug, description, category (ref), brand, model, price, negotiable (bool), condition (like_new|good|fair|needs_repair|for_parts), ageInMonths, warrantyLeftMonths, hasBill (bool), accessories[String], specs (Map), serialNumber (select:false), images[{url,publicId}], location{city,state,coords(GeoJSON)}, status, views, rejectionReason, impactKg, co2SavedKg, createdAt`
Indexes: text index (`title, brand, model, description`), `{status, category, price}`, `{location.coords: 2dsphere}`.

**Order**
`buyer, seller, listing, priceAtPurchase, shippingAddress, paymentMethod (online|cod), paymentStatus (unpaid|held|released|refunded), gatewayOrderId, gatewayPaymentId, commissionAmount, autoConfirmAt, orderStatus, disputeStatus, statusHistory[{status, at}], createdAt`

**Conversation** — `participants[2], listing, lastMessage, updatedAt`
**Message** — `conversation, sender, text, readBy[], createdAt`
**Offer** — `listing, buyer, amount, status (pending|accepted|rejected|countered), expiresAt`
**Review** — `order, reviewer, reviewee, rating (1–5), comment` (unique per order+reviewer)
**Report** — `reporter, targetType (listing|user), targetId, reason, status, resolvedBy`
**Wishlist** — `user, listings[ref]`
**Payment** — `order, gateway, gatewayOrderId, gatewayPaymentId, amount, currency, status, rawEventId (unique, for idempotency), createdAt`
**Dispute** — `order, openedBy, reason, evidence[{url,publicId}], status (open|resolved_refund|resolved_release), resolvedBy, resolutionNote, createdAt`
**RecyclingCenter** — `name, address{city,state,pincode}, coords (GeoJSON), phone, website, acceptedItems[String], certification, isActive`

**Component specs by category** (stored in `Listing.specs`, validated by Zod per category)

| Category | Required specs |
|---|---|
| RAM | type (DDR3/DDR3L/DDR4/DDR5), capacity, speed, formFactor (DIMM/SODIMM) |
| Motherboards | socket, chipset, formFactor, ramType, ramSlots |
| GPUs | vram, powerConnector, recommendedPsu |
| Storage | type (HDD/SSD/NVMe), capacity, interface, health (optional) |
| Power supplies | wattage, efficiency, modular |
| Mobiles / Tablets | storage, ram, batteryHealth |
| Laptops | cpu, ram, storage, screen |

**Impact calculation:** `impactKg` comes from a per-category weight table (editable by admin); `co2SavedKg` = `impactKg × factor` from a cited dataset. Both are *estimates* and labeled as such in the UI. Total impact = sum over listings with `status = sold` and order `completed`.

---

## 7. API Design (base: `/api/v1`)

**Auth**
- `POST /auth/register` · `POST /auth/login` · `POST /auth/logout` · `POST /auth/refresh`
- `GET /auth/verify-email/:token` · `POST /auth/forgot-password` · `POST /auth/reset-password/:token`

**Users**
- `GET /users/me` · `PATCH /users/me` · `GET /users/:id` (public profile)

**Listings**
- `GET /listings` (query: `q, category, brand, minPrice, maxPrice, condition, city, sort, page, limit`)
- `GET /listings/:id` · `POST /listings` · `PATCH /listings/:id` · `DELETE /listings/:id`
- `PATCH /listings/:id/status` (sold/reserved)
- `GET /listings/my` · `POST /listings/:id/wishlist` · `DELETE /listings/:id/wishlist`

**Categories** — `GET /categories`

**Orders**
- `POST /orders` · `GET /orders/my` · `GET /orders/selling` · `GET /orders/:id` · `PATCH /orders/:id/status`

**Chat / Offers** — `GET /conversations` · `POST /conversations` · `GET /conversations/:id/messages` · `POST /offers` · `PATCH /offers/:id`

**Reviews** — `POST /reviews` · `GET /users/:id/reviews`
**Reports** — `POST /reports`
**Payments** — `POST /payments/create` (creates gateway order for an existing order) · `POST /payments/webhook` (raw body, signature verified, no auth cookie) · `POST /orders/:id/confirm-delivery` · `POST /orders/:id/dispute`
**Impact** — `GET /impact/summary` (public totals) · `GET /users/:id/impact`
**Recycling centers** — `GET /recycling-centers?city=` · admin CRUD under `/admin/recycling-centers`
**Admin** — `GET /admin/stats` · `GET /admin/listings?status=pending` · `PATCH /admin/listings/:id/approve|reject` · `GET /admin/users` · `PATCH /admin/users/:id/ban` · `GET /admin/reports` · `PATCH /admin/reports/:id`

### Standard Response Format
```json
// success
{ "success": true, "message": "Listing created", "data": { ... }, "meta": { "page": 1, "limit": 12, "total": 120 } }

// error
{ "success": false, "message": "Validation failed", "errors": [{ "field": "price", "message": "Price must be positive" }] }
```

---

## 8. Security Architecture
- Passwords hashed with bcrypt (salt rounds 12).
- Access token short-lived (15 min); refresh token rotated and stored hashed in DB.
- `helmet`, `cors` (whitelist client origin), `express-rate-limit` (stricter on auth routes).
- Custom sanitization of request body/params + Zod validation to block NoSQL operators.
- File upload: whitelist MIME types, size limits, upload to Cloudinary (never store locally).
- Role-based access control (`protect`, `restrictTo('admin')`), ownership checks in services.
- Secrets only in env variables; `.env` never committed.

---

### 8.1 Auth & Session Details
- Server access tokens are short-lived; refresh tokens are `httpOnly` cookies, rotated on refresh, with the hash stored in the DB. Reuse of an old refresh token invalidates the session.
- Current client storage is localStorage for the access token; the fetch wrapper does not automatically call `/auth/refresh`.
- Email verification required before creating listings, ordering, or chatting.
- Sensitive actions (change email/password, delete account) require the current password.
- Admin accounts should use two-factor authentication (later phase).
- Login and password-reset endpoints are rate-limited; repeated failures trigger a temporary lockout.

### 8.2 Payment Security
- No card/UPI/bank data ever touches our servers or DB; only gateway IDs and statuses are stored.
- All amounts are calculated server-side from DB values.
- Webhook endpoint: raw body parser, signature verification, idempotent by event id, returns 200 quickly.
- Payment API keys and webhook secret live only in server env variables.
- Payout and refund actions are server-only and logged with the acting user or job.
- Sellers must complete gateway KYC before payouts are enabled.

### 8.3 Privacy Matrix

| Data | Visible to |
|---|---|
| Name, avatar, rating, city, member since | Public |
| Email | Owner only |
| Phone | Owner only; shared with counterpart only if the owner opts in |
| Full address | Owner; seller of an active paid order |
| Serial number / IMEI | Seller and admin only (`select: false`) |
| Chat messages | The two participants; admin only while reviewing a report/dispute |
| Payment details | Never stored |
| Order history | Buyer, seller of that order, admin |

- Chat happens in-platform so users need not share phone numbers early; warn against paying outside the platform.
- Account deletion: anonymize personal data, keep order records required for accounting.
- Publish a Privacy Policy and Terms of Service; consider data-protection laws in the launch country.
- Do not log passwords, tokens, full addresses, or payment payloads.

## 9. Environment Variables

**server/.env**
```
NODE_ENV=development
PORT=5000
MONGO_URI=
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
AUTO_CONFIRM_DAYS=5
SELLER_SHIP_DEADLINE_DAYS=3
PLATFORM_COMMISSION_PERCENT=0
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```
