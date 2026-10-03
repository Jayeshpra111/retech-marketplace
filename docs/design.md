# design.md — UI/UX Design Guide

Design goal: **trustworthy, clean, and fast.** Buyers of used electronics need confidence, so the UI should make condition, price, and seller trust obvious at a glance.

---

## 1. Design Principles
1. **Trust first** — show condition grade, seller rating, verification badges prominently.
2. **Photos sell** — large, clear image galleries.
3. **Mobile-first** — most users browse on phones.
4. **Low friction** — minimal steps to list or buy.
5. **Consistent** — reuse the same components everywhere.

---

## 2. Brand & Colors

Use CSS custom properties in `client/src/styles/global.css` for shared palette values:

| Token | Hex | Use |
|---|---|---|
| `--color-primary-600` | `#2563EB` | Main buttons, links |
| `--color-primary-700` | `#1D4ED8` | Hover |
| `--color-primary-50` | `#EFF6FF` | Light backgrounds |
| `--color-accent-500` | `#10B981` | Success, "Verified", price drops |
| `--color-warning-500` | `#F59E0B` | Pending, Fair condition |
| `--color-danger-500` | `#EF4444` | Errors, delete, reported |
| `--color-eco-600` | `#059669` | Impact badges, e-waste counter, sustainability elements |
| `--color-eco-50` | `#ECFDF5` | Impact section backgrounds |
| `--color-neutral-900` | `#111827` | Headings |
| `--color-neutral-600` | `#4B5563` | Body text |
| `--color-neutral-200` | `#E5E7EB` | Borders |
| `--color-neutral-50` | `#F9FAFB` | Page background |

**Condition badge colors**
| Grade | Color |
|---|---|
| Like New | Green |
| Good | Blue |
| Fair | Amber |
| Needs Repair | Red |
| For Parts | Purple (with a "Reusable parts" tooltip) |

Dark mode: optional (Phase 9). Use CSS variables and a `prefers-color-scheme` media query if added.

---

## 3. Typography
- **Font:** Inter (Google Fonts), fallback `system-ui, sans-serif`.
- Scale: 12px · 14px · 16px · 18px · 20px · 24px · 36px (hero).
- Headings: semibold/bold, neutral 900. Body: regular, neutral 600.
- Prices: bold, larger size, tabular numbers.

---

## 4. Spacing, Radius, Shadows
- Spacing scale: multiples of 4px.
- Containers use centered, max-width layouts with responsive side padding.
- Radius: cards 12px, buttons/inputs 8px, badges fully rounded.
- Shadows: subtle card shadows, stronger hover shadows, deep modal shadows.

---

## 5. Breakpoints
`sm 640px` · `md 768px` · `lg 1024px` · `xl 1280px`
Listing grid: **1 col (mobile) → 2 (sm) → 3 (lg) → 4 (xl)**.

---

## 6. Core Components

| Component | Notes |
|---|---|
| **Button** | Variants: primary, secondary, outline, danger, ghost. Sizes: sm/md/lg. Loading state with spinner. |
| **Input / Select / Textarea** | Label above, helper text, red error message below. |
| **ListingCard** | Image (4:3), condition badge (top-left), wishlist heart (top-right), title (2-line clamp), price, city, posted time. |
| **FilterPanel** | Category, brand, price range slider, condition checkboxes, city. Drawer on mobile. |
| **ImageGallery** | Main image + thumbnails, swipe on mobile, click to zoom. |
| **SellerCard** | Avatar, name, rating stars, member since, "Chat" button. |
| **Badge** | Condition, Verified, Sold, Reserved, Pending. |
| **Modal / Drawer** | Focus trap, ESC to close. |
| **Toast** | `react-hot-toast`, top-right (top-center on mobile). |
| **Pagination** | Numbered + prev/next. |
| **Skeleton** | For cards and detail page while loading. |
| **EmptyState** | Icon + message + CTA. |
| **Stepper** | For the create-listing flow. |

---

## 7. Page Layouts (wireframe notes)

### Home
```
[Navbar: Logo | Search bar | Sell (CTA) | Wishlist | Chat | Profile]
[Hero: headline + big search + category quick-links]
[Shop by Category: icon grid — devices + components (RAM, Motherboards, GPUs, Storage, PSUs)]
[Impact counter: "X kg of e-waste kept in use" (estimated), link to methodology]
[Latest Listings: 8 cards + "View all"]
[How it works: 3 steps (List → Chat → Sell)]
[Trust section: verified sellers, secure payments, report system]
[Footer]
```

### Listings (Browse)
```
[Search + Sort dropdown]
[Sidebar filters (desktop) | Grid of ListingCards]
[Pagination]
```

### Listing Detail
```
[Breadcrumb]
[Left: ImageGallery]   [Right: Title, Price, Negotiable tag, Condition badge,
                        Key specs (brand, model, age, warranty, bill),
                        Buttons: Buy Now | Make Offer | Chat | ♡ Wishlist | Report]
[Description] [Specs table] [Accessories included]
[SellerCard + reviews]
[Similar listings]
```

### Create Listing (Stepper)
1. Basic info (category, brand, model, title)
2. Details (price, condition, age, warranty, accessories, description)
3. Photos (drag & drop, min 2, max 6, reorder, first = cover)
4. Review & submit

### Dashboard (Seller)
Sidebar: Overview · My Listings · Orders · Offers · Messages · Settings
Overview: stat cards (active listings, views, sales), recent activity.

### Chat
Two-pane: conversation list (left) + messages (right). Listing preview pinned at top of chat. Mobile: one pane at a time.

### Admin
Sidebar layout, data tables with search/filter/actions, approve/reject modal with reason field.

---

## 8. UX Behaviors
- **Loading:** skeletons instead of spinners for lists.
- **Empty:** helpful message + action ("No results — try removing filters").
- **Errors:** inline field errors + toast for server errors.
- **Confirmations:** modal before destructive actions (delete, cancel order).
- **Feedback:** success toast after every mutation; disable buttons while submitting.
- **Auth-gated actions:** if logged out and clicking Chat/Buy, redirect to login and return afterward.
- **Price format:** locale-aware currency (e.g., `₹24,999`), via `Intl.NumberFormat`.
- **Dates:** relative ("2 days ago") via `date-fns`.

---

## 9. Accessibility
- Color contrast ≥ 4.5:1 for text.
- All interactive elements keyboard reachable with visible focus ring (`focus:ring-2`).
- `alt` text on all images; `aria-label` on icon-only buttons.
- Form inputs have associated `<label>`.
- Respect `prefers-reduced-motion`.

---

## 10. Icons & Imagery
- Icons: `lucide-react`, 20px default, stroke 1.75.
- Images: Cloudinary transforms (`w_600,c_fill,ar_4:3,q_auto,f_auto`), lazy-loaded, blurred placeholder optional.
- Category illustrations: simple line icons for consistency.

---

## 11. Motion
- Subtle only: 150–200ms transitions (`transition-all duration-200`).
- Card hover: slight lift + shadow.
- No heavy animation libraries in MVP.

---

## 12. Trust Elements (differentiators)
- ✅ "Verified email" badge on sellers
- ⭐ Seller rating + number of sales
- 🛡️ "Report this listing" on every listing
- 📋 Condition grade guide (tooltip/modal explaining each grade)
- 🧾 "Bill available" / "Warranty left" chips
- Safety tips banner in chat ("Meet in public places, inspect before paying")


---

## 13. Eco & Impact UI
- **Impact counter** on the home page: large number, `eco-600`, with a leaf icon and the label "estimated". Animate count-up once on load (respect reduced motion).
- **Impact chip** on ListingCard/detail: "Saves ~1.6 kg e-waste". Small, `eco-50` background, `eco-600` text.
- **Profile impact card:** total kg diverted, items reused, CO2 saved (estimated).
- **Methodology page:** how impact is calculated, with cited sources. Link to it from every impact figure.
- **For Parts listings:** purple badge and a "What works / what's broken" two-column block on the detail page.
- **Component compatibility panel** on component listings: spec table (type, capacity, speed, socket...) plus a "Check compatibility" hint.
- **Recycle prompt:** "Can't sell it? Find a certified recycler near you" card with city search (Phase 6).
- **Data-wipe checklist modal** shown before publishing: factory reset, sign out of accounts, remove SIM/SD, remove device locks. Requires ticking each box.

## 14. Checkout, Payment & Privacy UX
- **Checkout steps:** Address → Payment method → Review → Pay. Show item price, shipping (if any), and total before paying.
- **Protection banner:** "Your payment is held safely until you confirm delivery."
- **Order timeline:** Paid → Confirmed → Shipped → Delivered → Completed, with dates.
- **Confirm delivery / Open dispute** buttons appear on delivered orders with a countdown to auto-confirm.
- **Dispute form:** reason, description, photo upload.
- **Chat warnings:** persistent banner "Never pay or share OTPs outside the platform."
- **Privacy cues:** phone shows "Hidden — shared only if the owner allows"; address is only shown inside a paid order.
- **Payment failure states:** clear message, "Try again" and "Choose another method", listing stays reserved for a short window.
- Never show gateway secrets, raw payment IDs, or full card numbers in the UI. A last-4 display comes only from the gateway's response.
