# Phases.md — Development Roadmap

Build in order. Finish and test each phase before starting the next.
Estimated timeline assumes 1 developer, ~3–4 hours/day. Adjust as needed.

**Legend:** ⬜ Not started · 🟨 In progress · ✅ Done

---

## Phase 0 — Setup & Planning (Days 1–2) ⬜
**Goal:** Working project skeleton, both apps run.

- [ ] Create monorepo folders (`client/`, `server/`, `docs/`)
- [ ] Initialize Git repo, `.gitignore`, branch strategy
- [ ] Server: `npm init`, install core packages, ESLint + Prettier
- [ ] Client: `npm create vite@latest` (React), configure standard CSS, Router, and shared fetch wrapper
- [ ] Create MongoDB Atlas cluster, get `MONGO_URI`
- [ ] Create Cloudinary account
- [ ] Add `.env.example` files
- [ ] Express app with `/api/v1/health` route, DB connection, global error middleware, logger
- [ ] Husky + lint-staged

**Deliverable:** `GET /api/v1/health` returns OK; React app shows a home placeholder.

---

## Phase 1 — Authentication & Users (Days 3–7) ⬜
**Goal:** Users can register, log in, and manage profile securely.

**Backend**
- [ ] User model
- [ ] Register / Login / Logout / Refresh token endpoints
- [ ] `protect` and `restrictTo` middlewares
- [ ] Email verification + forgot/reset password
- [ ] `GET/PATCH /users/me`, avatar upload
- [ ] Rate limiting on auth routes

**Frontend**
- [ ] Shared auth-aware fetch wrapper
- [ ] App Context auth state and route protection
- [ ] Login, Register, Forgot/Reset pages
- [ ] Navbar with auth state
- [ ] Profile page

**Deliverable:** Full auth cycle works, tokens refresh silently, protected pages redirect.

---

## Phase 2 — Categories & Listings CRUD (Days 8–15) ⬜
**Goal:** Sellers can post items with images.

**Backend**
- [ ] Category model + seed script (Mobiles, Laptops, Tablets, Cameras, Audio, Gaming, Wearables, RAM, Motherboards, GPUs, Storage, Power Supplies)
- [ ] Per-category Zod spec schemas (DDR type, socket, wattage, etc.)
- [ ] Listing model + indexes
- [ ] Multer + Cloudinary upload middleware
- [ ] Listing CRUD with ownership checks
- [ ] Listing status flow (`pending → active → sold`)
- [ ] `GET /listings/my`
- [ ] Add `for_parts` condition and required-description rule
- [ ] Impact weight table + server-side `impactKg` / `co2SavedKg` calculation
- [ ] Public serializer that hides serial number and private seller data

**Frontend**
- [ ] Create/Edit listing multi-step form (details → condition → images → review)
- [ ] Image uploader with previews + remove
- [ ] Listing detail page with gallery
- [ ] "My Listings" page in dashboard
- [ ] Data-wipe checklist step before publishing
- [ ] Dynamic spec fields in the form based on category

**Deliverable:** A seller can create, edit, delete, and mark listings sold.

---

## Phase 3 — Browse, Search & Filters (Days 16–20) ⬜
**Goal:** Buyers can find items quickly.

- [ ] Text search + filters (category, brand, price, condition, city) + sorting
- [ ] Server-side pagination
- [ ] Filter panel UI (drawer on mobile)
- [ ] URL-synced query params
- [ ] Home page (hero, categories, latest listings, total e-waste diverted counter)
- [ ] Compatibility filters for components (DDR type, socket, form factor, wattage)
- [ ] "For parts" filter and badge
- [ ] Wishlist (backend + UI)
- [ ] Debounced search bar
- [ ] Skeleton loaders, empty states

**Deliverable:** Fast, filterable listing browse experience.

---

## Phase 4 — Admin Panel & Moderation (Days 21–25) ⬜
**Goal:** Platform stays clean and safe.

- [ ] Admin role + seed admin user
- [ ] Pending listings queue: approve / reject with reason
- [ ] User management: view, ban/unban
- [ ] Manage categories
- [ ] Report listing/user feature + reports queue
- [ ] Dashboard stats (users, listings, orders)

**Deliverable:** Admin can moderate everything from `/admin`.

---

## Phase 5 — Orders & Payments (Days 26–33) ⬜
**Goal:** Complete a purchase.

- [ ] Order model + status lifecycle
- [ ] Checkout page (address + payment method)
- [ ] Cash on Delivery flow
- [ ] Choose gateway (Razorpay Route / Stripe Connect) and set up test mode
- [ ] Create-payment endpoint (amount from DB) + checkout on the client
- [ ] Webhook: raw body, signature verification, idempotency (`Payment.rawEventId`)
- [ ] Hold funds until delivery; payout to seller after confirmation
- [ ] Seller onboarding / KYC via gateway
- [ ] Reserve listing when order placed (atomic/transactional); release on cancel
- [ ] `transitionOrder` state machine with `statusHistory`
- [ ] Confirm-delivery endpoint + auto-confirm cron job
- [ ] Auto-cancel unshipped / unpaid orders (cron)
- [ ] Refund flow
- [ ] Dispute: buyer opens with evidence, admin resolves (refund or release)
- [ ] Seller order management (confirm, ship, complete)
- [ ] Buyer order tracking page
- [ ] Order emails

**Deliverable:** End-to-end purchase from listing to completed order.

---

## Phase 6 — Chat, Offers & Reviews (Days 34–40) ⬜
**Goal:** Build trust and enable negotiation.

- [ ] Socket.io server with JWT auth handshake
- [ ] Conversation + Message models
- [ ] Chat UI (list + window, unread badges, typing indicator)
- [ ] Make/accept/reject/counter offers
- [ ] Reviews & ratings after completed orders
- [ ] Public seller profile with reviews
- [ ] In-app + email notifications
- [ ] Impact dashboard: per-user impact on profile, public totals page with methodology and sources
- [ ] Recycler directory: RecyclingCenter model, admin CRUD, public search by city
- [ ] "Can't sell it? Recycle it" prompt for items marked `for_parts` or unsold for a long time

**Deliverable:** Buyers and sellers chat in real time; ratings appear on profiles.

---

## Phase 7 — Polish, Testing & Performance (Days 41–46) ⬜
- [ ] Responsive/accessibility pass
- [ ] Error boundary, 404 page, consistent toasts
- [ ] Unit + integration tests for critical flows
- [ ] Image optimization (Cloudinary transforms), lazy loading, code splitting
- [ ] DB index review, query optimization
- [ ] SEO meta tags (react-helmet-async)
- [ ] Security checklist review (`rules.md` §7)
- [ ] Seed demo data

---

## Phase 8 — Deployment & Launch (Days 47–50) ⬜
- [ ] Deploy backend (Render/Railway) with env vars
- [ ] Deploy frontend (Vercel/Netlify), set `VITE_API_URL`
- [ ] Configure CORS, cookies (`secure`, `sameSite`) for production domains
- [ ] MongoDB Atlas network access + backups
- [ ] Domain + HTTPS
- [ ] Monitoring/logging (e.g., Sentry, UptimeRobot)
- [ ] Write final `README.md` with setup + screenshots
- [ ] Soft launch and collect feedback

---

## Phase 9 — Future Enhancements ⬜
- [ ] Price suggestion, device comparison
- [ ] Saved searches + alerts
- [ ] Device diagnostic checklist
- [ ] PWA + push notifications
- [ ] Seller verification badge
- [ ] Multi-language, multi-currency
- [ ] Analytics dashboard for sellers

---

## Milestone Summary

| Milestone | End of Phase | What works |
|---|---|---|
| M1 – Users | 1 | Auth & profiles |
| M2 – Catalog | 3 | Post, browse, search |
| M3 – Safe | 4 | Moderation |
| M4 – Transact | 5 | Buy & sell |
| M5 – Social | 6 | Chat & reviews |
| M6 – Live | 8 | Production launch |
