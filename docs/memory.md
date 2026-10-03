# memory.md — Project Memory / Living Context

> **Purpose:** A single source of truth about the project's current state, decisions, and progress.
> **Rule:** Read this first at the start of every work session (human or AI). Update it at the end of every task.
> Related docs: `PRD.md`, `Architecture.md`, `rules.md`, `Phases.md`, `design.md`

---

## 1. Project Snapshot
- **Name:** Second-Hand Electronics Marketplace (ReTech Market)
- **Type:** MERN stack web app (marketplace)
- **Roles:** Buyer/Seller (user), Admin
- **Mission:** Reduce e-waste by keeping usable devices and components in circulation (component marketplace, sell-for-parts, impact tracking, recycler directory).
- **Current Phase:** Phase 0 — Setup & Planning
- **Last Updated:** _YYYY-MM-DD_
- **Overall Progress:** 0%

---

## 2. Tech Decisions (locked)
| Area | Decision | Reason |
|---|---|---|
| Frontend | React + Vite + standard CSS | Fast dev, semantic component styles |
| Frontend state | React Context + localStorage | Existing app-wide state |
| API client | `fetch` wrapper | Shared bearer token and error handling |
| Backend | Express 5 (CommonJS) | Existing server runtime |
| DB | MongoDB Atlas + Mongoose | Flexible schemas for varied electronics specs |
| Auth | JWT access token in localStorage + refresh httpOnly cookie | Current implementation |
| Images | Cloudinary | Offloads storage + transforms |
| Validation | Zod (client + server) | Shared rules |
| Real-time | Socket.io server | Client chat currently uses local state |
| Payments | Marketplace gateway: Razorpay Route or Stripe Connect (final choice TBD before Phase 5) | Holds funds, splits payouts, handles seller KYC; we never store payment data |
| Money model | Funds held until delivery confirmed (or auto-confirm), dispute freezes payout | Buyer protection for used goods |
| Impact data | Server-derived `impactKg`/`co2SavedKg` from a cited table, labeled "estimated" | Credibility |

---

## 3. Key Conventions (quick reference)
- API base: `/api/v1`; response shape `{ success, message, data, meta }`
- Backend flow: `route → middleware → controller → service → model`
- Always use `asyncHandler` + throw `AppError`
- Files: `x.model.js`, `x.routes.js`, `x.controller.js`, `x.service.js`
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`)
- Listing statuses: `draft | pending | active | reserved | sold | rejected | removed`
- Order statuses: `pending | paid | confirmed | shipped | delivered | completed | cancelled | refunded | disputed`
- Payment statuses: `unpaid | held | released | refunded`
- Amounts always computed server-side; payment confirmed only by verified webhook
- Condition grades: `like_new | good | fair | needs_repair | for_parts`

---

## 4. Progress Tracker

| Phase | Status | Notes |
|---|---|---|
| 0 Setup | 🔄 | Project initialized in scratch/retech-market, docs migrated |
| 1 Auth & Users | ⬜ | UI prototype components ready |
| 2 Listings CRUD | 🔄 | Create listing studio, data-wipe checklist, for-parts UI implemented |
| 3 Search & Filters | 🔄 | Browse view, filter drawer, category and condition filters implemented |
| 4 Admin | ⬜ | Planned |
| 5 Orders & Payments | 🔄 | Escrow checkout flow and order tracking timeline built |
| 6 Chat, Offers, Reviews | 🔄 | Real-time chat modal simulation and safety alerts built |
| 7 Polish & Testing | ⬜ | |
| 8 Deployment | ⬜ | |

---

## 5. Completed Work Log
_Newest first. Format: `[Date] [Phase] — what was done (files touched)`_

- _2026-10-02 [Bugfixes & Full Stack Alignment] — Completed comprehensive audit and resolved all runtime bugs: fixed Report dynamic refPath model casing; added full Payments flow (`payment.routes.js`, `payment.controller.js`, `payment.service.js`) with escrow webhook verification; fixed Order state transitions to support 'paid', 'confirmed', and buyer completion; added impact snapshots to Order model; fixed FormData preprocessing in listing validators for specs/location; added atomic listing view increment; fixed BSON crash in impact controller; added auto-slug on Category creation; added offer negotiation endpoints (`offer.routes.js`, `offer.controller.js`); hardened Socket.io against banned users with direct message delivery; added automated background cron job (`cronJobs.js`); added client Auth and Admin pages (`AuthPages.jsx`, `AdminPage.jsx`) and wired routes in `App.jsx`._
- _2026-09-29 [Frontend Prototype] — Built complete interactive React + Vite frontend prototype in `client/` using utility-first styling, since migrated to standard CSS. Features Homepage with live e-waste diverted counter, Browse catalog with multi-faceted filtering, Listing detail view with specs & "For Parts" breakdown, 5-step Create Listing studio with mandatory data-wipe verification, Escrow checkout simulation, Seller/Buyer dashboard with order lifecycles, real-time chat modal with safety warning, Recycler directory, and Impact methodology calculator._
- _2026-09-29 [Phase 0] — Created project workspace in `scratch/retech-market`, organized `docs/` with `PRD.md`, `Architecture.md`, `rules.md`, `Phases.md`, `design.md`, and `memory.md`._

---

## 6. Current Task
- **Working on:** Post-bugfix comprehensive verification & deep architecture review
- **Next up:** Replace prototype-only client flows with server APIs when explicitly scoped
- **Blockers:** None

---

## 7. Decisions Log (ADR-lite)
_Record any decision that changes the plan._

| Date | Decision | Alternatives considered | Why |
|---|---|---|---|
| _YYYY-MM-DD_ | Use Zustand instead of Redux (superseded; current client state uses React Context) | Redux Toolkit | Historical decision; current state is maintained in AppContext |
| _YYYY-MM-DD_ | Use gateway marketplace product for holding/splitting funds | Holding money in our own account | Regulatory and trust risk; gateway handles KYC and payouts |
| _YYYY-MM-DD_ | Recycler directory goes in Phase 6, not MVP | Include in MVP | Keeps MVP focused on listing, buying, and payments |
| _YYYY-MM-DD_ | Impact numbers are estimates from a cited table | Seller-entered values | Prevents fake claims |

---

## 8. Environment & Setup Notes
- Node version: 20 LTS
- Package manager: npm
- Local ports: client `5173`, server `5000`
- Services created: MongoDB Atlas ☐ · Cloudinary ☐ · SMTP ☐ · Payment gateway ☐
- Seed commands: _(add when created, e.g., `npm run seed:categories`, `npm run seed:admin`)_
- Run commands:
  - Server: `cd server && npm run dev`
  - Client: `cd client && npm run dev`

---

## 9. API / Feature Status Checklist
_Tick as implemented and tested._

**Auth:** ☐ register ☐ login ☐ logout ☐ refresh ☐ verify email ☐ forgot/reset
**Users:** ☐ get/update me ☐ avatar ☐ public profile
**Listings:** ☐ create ☐ read ☐ update ☐ delete ☐ status ☐ my listings ☐ wishlist
**Search:** ☐ text ☐ filters ☐ sort ☐ pagination
**Orders:** ☐ create ☐ status updates ☐ COD ☐ online payment ☐ webhook ☐ hold/payout ☐ auto-confirm job ☐ refund ☐ dispute
**Impact & Recycling:** ☐ weight table ☐ impact calc ☐ home counter ☐ profile impact ☐ recycler directory
**Chat:** ☐ socket auth ☐ messages ☐ offers
**Reviews/Reports:** ☐ reviews ☐ reports
**Admin:** ☐ approve/reject ☐ ban ☐ stats ☐ categories

---

## 10. Known Issues / Tech Debt
| # | Issue | Severity | Status |
|---|---|---|---|
| — | _None yet_ | | |

---

## 11. Open Questions
- Razorpay Route or Stripe Connect? (depends on launch country and seller KYC)
- Which dataset will we cite for impact weights and CO2 factors?
- Verify the e-waste statistics used in the PRD (UN Global E-waste Monitor) and the "2.7%" figure.
- Will listings be auto-approved for trusted sellers?
- Will we charge a commission or listing fee?
- Shipping: seller-managed only, or integrate a courier API later?

---

## 12. Lessons Learned / Gotchas
_Add anything that cost time so it doesn't repeat._
- _e.g., Cookies need `sameSite: 'none'` + `secure: true` when client and API are on different domains in production._

---

## 13. Session Handoff Template
Copy this at the end of each work session:

```
### Session — YYYY-MM-DD
- Done: 
- Files changed: 
- Tests: pass / fail
- Next: 
- Notes / blockers: 
```
