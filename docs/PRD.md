# PRD — Second-Hand Electronics Marketplace

> Working name: **ReTech Market** (change anytime)
> Stack: MERN (MongoDB, Express, React, Node.js)
> Version: 1.0 | Status: Draft

---

## 1. Overview

### 1.0 Mission & Impact
**Mission:** Keep usable electronics and components in circulation instead of in landfills, and make them affordable for people who need them.

**Why it matters**
- E-waste is one of the world's fastest-growing waste streams. The UN Global E-waste Monitor (2024 edition) reports roughly 62 million tonnes generated in 2022, with only about 22% documented as properly collected and recycled, and a projected rise to about 82 million tonnes by 2030. *(Verify these numbers against the latest report and link the source before publishing. Also confirm the source of the "2.7%" figure before using it anywhere.)*
- Prices of RAM, motherboards, GPUs and other components are rising. Working parts from old devices are often thrown away instead of being reused or sold.
- People bin devices because they don't know where to sell them, fear leaving personal data on them, or think broken devices are worthless.

**How this platform helps**
1. Sell whole devices, **individual components**, and **broken devices "for parts"**.
2. Show the environmental impact of every sale (estimated e-waste diverted and CO2 saved).
3. Guide users on wiping data safely.
4. Point unsellable items to authorized recyclers.

### 1.1 Problem
People have working phones, laptops, cameras and gadgets they no longer use, while others cannot afford new ones. Existing general classifieds are full of scams, unclear product condition, and no trust between strangers.

### 1.2 Solution
A web marketplace dedicated to **used electronics** where sellers list items with clear condition grading and verification details, and buyers can search, negotiate, and purchase with confidence.

### 1.3 Goals
- Let any user list a used electronic item in under 3 minutes.
- Give buyers trustworthy info: condition grade, warranty status, serial/IMEI, seller rating.
- Reduce scams via admin moderation, reporting, and reviews.
- Be mobile-friendly (most users will browse on phones).

### 1.4 Non-Goals (v1)
- Native mobile apps.
- Own logistics/courier network (we integrate or let seller ship).
- Auctions / bidding.
- Refurbishment services.

---

## 2. Target Users

| Persona | Description | Main Needs |
|---|---|---|
| **Buyer** | Students, budget-conscious buyers, hobbyists | Find cheap, reliable devices; compare; safe payment |
| **Seller** | Individuals upgrading devices, small resellers | Quick listing, reach buyers, get paid safely |
| **Admin** | Platform moderators | Approve listings, handle reports, ban users, view stats |

---

## 3. User Stories

**Buyer**
- As a buyer, I can search and filter by category, brand, price, condition, and location.
- As a buyer, I can view full product details, images, and seller profile.
- As a buyer, I can save items to a wishlist.
- As a buyer, I can chat with a seller and make an offer.
- As a buyer, I can place an order and pay online or choose cash on delivery.
- As a buyer, I can review a seller after a completed order.
- As a buyer, I can report a suspicious listing.

**Seller**
- As a seller, I can create/edit/delete listings with multiple images.
- As a seller, I can mark an item as sold or reserved.
- As a seller, I can accept/reject offers and manage orders.
- As a seller, I can see my dashboard (views, chats, sales).

**Admin**
- As an admin, I can approve/reject listings, remove listings, and ban users.
- As an admin, I can review reports and view platform analytics.

---

## 4. Features

### 4.1 MVP (Must Have)
1. **Authentication** — register, login, logout, refresh token, forgot/reset password, email verification.
2. **User profile** — name, avatar, phone, address, seller rating.
3. **Listings (CRUD)** — title, description, category, brand, model, price, condition grade, age, warranty, accessories included, serial/IMEI (hidden from public, verified by admin), up to 6 images, location.
4. **Condition grading** — `Like New`, `Good`, `Fair`, `Needs Repair`, `For Parts` with defined criteria.
5. **Search & filters** — keyword, category, brand, price range, condition, city; sort by newest / price.
6. **Pagination** — server-side.
7. **Wishlist**.
8. **Seller dashboard**.
9. **Orders** — create order, status flow (`pending → confirmed → shipped → delivered → completed / cancelled`).
10. **Admin panel** — listing moderation, user management, reports.
11. **Responsive UI**.
12. **Component marketplace** — categories for RAM, motherboards, GPUs, storage, power supplies, plus per-category compatibility specs (e.g., DDR type, socket, form factor, wattage) and filters on them.
13. **Sell for parts** — broken devices can be listed with the `For Parts` grade and a description of what still works.
14. **Impact tracker** — each listing stores an estimated weight and CO2 saving; homepage shows a running "total e-waste diverted" counter; profiles show a user's personal impact.
15. **Data-wipe guide** — checklist shown to sellers before they publish (factory reset, sign out of accounts, remove SIM/SD card).
16. **Secure payments** — online payments held by the payment gateway until delivery is confirmed, plus Cash on Delivery for local deals (see 4.4).

### 4.2 Phase 2 (Should Have)
- Real-time chat (Socket.io) between buyer and seller.
- Make-an-offer / counter-offer.
- Online payments with escrow-like hold (Razorpay or Stripe).
- Reviews & ratings.
- Email/notification system (order updates, new messages).
- Report listing/user.
- **Recycler directory** — admin-managed list of authorized e-waste recyclers and drop-off points, shown as a fallback for items that cannot be sold. Pickup requests come later.
- **Disputes** — buyer can open a dispute within the protection window; admin reviews and refunds or releases payment.

### 4.3 Future (Nice to Have)
- Price suggestion based on similar sold items.
- Compare devices side by side.
- Saved searches with alerts.
- Device diagnostics checklist (battery health, screen test).
- PWA / push notifications.
- Multi-language support.
- Repair-shop listings and a "repairable" filter.
- Recycler pickup requests and partnerships with certified recyclers.
- Bulk listing for small resellers and businesses disposing of office IT equipment.

### 4.4 Payments, Authentication & Privacy (summary)

**Payments**
- The app never stores or sees card, UPI or bank details. A gateway with marketplace support (Razorpay Route or Stripe Connect) handles collection, holding, split and payout.
- Price is always read from the database at checkout, never trusted from the client.
- Flow: order created, buyer pays, gateway webhook (signature verified) marks the order paid and the listing reserved, seller ships, buyer confirms (or auto-confirms after a set number of days), payout released to seller minus any commission.
- Cash on Delivery is available for local deals, with no buyer protection.
- Sellers must complete gateway KYC before receiving payouts.

**Authentication**
- Email + password with bcrypt, short-lived access token, rotating refresh token in an httpOnly cookie, mandatory email verification before listing or buying, rate limiting, role and ownership checks on every write.

**Privacy**
- Public: name, avatar, rating, city. Private: email, full address (shared with the seller only after an order), phone (hidden unless the user opts in), serial/IMEI (seller and admin only), chat (participants only), payment details (never stored).
- Users can delete their account and data. Privacy policy and terms pages are required before launch. Check which data-protection laws apply in your target country.

---

## 5. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | System shall allow only verified-email users to create listings. |
| FR-2 | Listings shall be `pending` until admin approves (configurable auto-approve for trusted sellers). |
| FR-3 | Images shall be uploaded to cloud storage; max 6 images, 5 MB each, jpg/png/webp. |
| FR-4 | Search results shall return in under 500 ms for 10k listings. |
| FR-5 | Only the owner or admin can edit/delete a listing. |
| FR-6 | A sold listing cannot be ordered again. |
| FR-7 | Users can review only after an order is `completed`. |
| FR-8 | Banned users cannot log in or create content. |
| FR-9 | Order price shall be read from the database on the server; client-supplied prices are ignored. |
| FR-10 | Payment success shall be confirmed only via a signature-verified gateway webhook, and processing shall be idempotent. |
| FR-11 | A listing shall be locked (`reserved`) while a paid or pending order exists so it cannot be bought twice. |
| FR-12 | Payout to a seller shall be released only after delivery confirmation or auto-confirmation, and never while a dispute is open. |
| FR-13 | Serial/IMEI, full address and phone shall never be returned in public API responses. |
| FR-14 | Component listings shall include the category's required compatibility specs. |
| FR-15 | Impact figures shall be labeled as estimates and calculated from a documented formula or table. |

## 6. Non-Functional Requirements
- **Performance:** first page load < 3s on 4G; API p95 < 500ms.
- **Security:** hashed passwords (bcrypt), JWT, input validation, rate limiting, XSS/NoSQL-injection protection, HTTPS.
- **Scalability:** stateless API, indexed MongoDB queries, ready for horizontal scale.
- **Accessibility:** WCAG 2.1 AA basics.
- **Reliability:** graceful error handling, logging, daily DB backups (in production).
- **SEO:** listing pages have meta tags (consider SSR/prerender later).

---

## 7. Data Entities (high level)
`User`, `Listing`, `Category`, `Order`, `Conversation`, `Message`, `Offer`, `Review`, `Report`, `Wishlist`
(Full schemas in `Architecture.md`.)

---

## 8. Success Metrics
- 100 listings and 50 registered users within first month of launch.
- Listing creation completion rate > 70%.
- < 2% listings reported as fraudulent.
- Average buyer-to-seller first-response time < 1 hour.
- **Impact metrics:** total kg of e-waste diverted, number of components reused, number of `for_parts` items sold, estimated CO2 saved.
- Percentage of orders completed without a dispute > 95%.

---

## 9. Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Stolen devices sold | IMEI/serial capture, admin review, report system, ban policy |
| Fake listings/scams | Email verification, moderation, ratings, escrow payments |
| Poor photo quality | Guidelines + min image count |
| Cloud image cost | Compress on upload, limit count/size |

---

## 10. Assumptions & Open Questions
- Payment gateway choice (Razorpay Route vs Stripe Connect) — decide before Phase 5, based on the country you launch in and their seller KYC rules.
- Recycler directory is planned for Phase 6 (not MVP). Revisit if a recycling partner is found early.
- Source and formula for impact estimates (weight per category, CO2 per kg) — pick a published dataset and cite it.
- Shipping: seller-arranged in v1.
- Currency: single currency in v1 (configurable).
- Will sellers pay commission? (Default: free in v1.)
