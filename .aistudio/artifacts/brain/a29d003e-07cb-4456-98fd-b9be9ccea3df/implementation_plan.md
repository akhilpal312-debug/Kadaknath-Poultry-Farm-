# Kadaknath Poultry Farm — Verified Contact, Location & Real Customer Reviews Plan

Integrate the farm's verified contact number (`+91 6393860760`), exact Google Maps location pin (`https://goo.gl/maps/AXYQmb3qZBZhFMzj7`), and a genuine customer review submission and owner management system while removing all sample placeholder testimonials.

## User Review & Critical Decisions

> [!IMPORTANT]
> Your confirmed preferences from clarification guide this update:
> - **Confirmed Decision 1 (Authentic Reviews Only)**: Remove all sample placeholder testimonials so zero fake reviews appear. Visitors can submit genuine reviews with their name, locality, purchase category, star rating, and feedback, while the farm owner can sign in with Google (`akhilpal1056@gmail.com`) to review, approve, or delete submissions.
> - **Confirmed Decision 2 (Interactive Map Preview + Direct Link)**: Display an interactive location map preview for the farm alongside direct **View on Google Maps** actions opening `https://goo.gl/maps/AXYQmb3qZBZhFMzj7`.
> - **Confirmed Contact & Location Defaults**: Configure `+91 6393860760` as the primary phone and WhatsApp contact across all call links, enquiry buttons, contact cards, and footer actions, and link `https://goo.gl/maps/AXYQmb3qZBZhFMzj7` across map actions.
> - **Cloud Persistence Confirmation**: Upon approving this plan, you will be prompted once to enable Firebase Firestore and Authentication so customer reviews persist across sessions and devices and owner moderation is protected.

## 1. Overview & Core Concept

- **What It Does**:
  - **Direct Farm Contact (`+91 6393860760`)**: Updates every phone link (`tel:+916393860760`), WhatsApp enquiry drawer target (`916393860760`), contact section display, and footer connect button to use the verified number without placeholder notices.
  - **Exact Location & Interactive Map Preview**: Wires `https://goo.gl/maps/AXYQmb3qZBZhFMzj7` to the Contact section and Footer while providing an interactive map preview with zoom, recenter, pin inspection, and exact directional access along Shivli Road, Bhoshana.
  - **Real Customer Reviews & Owner Management**: Replaces the three sample placeholder quotes with a live customer review section. When no approved reviews exist yet, visitors see a transparent invitation to leave the first verified farm review. Customers can submit new reviews anytime, and the farm owner can authenticate via Google Sign-In to approve pending submissions or remove unwanted entries.
- **Target Audience & Persona**: Local buyers, backyard poultry farmers, and restaurant or household customers in Kanpur Dehat and Uttar Pradesh verifying authentic farm details, opening turn-by-turn directions, messaging via WhatsApp, and reading or posting genuine customer feedback.
- **Key Value**: Eliminates placeholder data completely, establishes immediate trust with verified phone and map links, and gives the farm owner full control over authentic public reviews.

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Customer Review Submission**: Visitors scroll to **What Our Customers Say** and click **Write a Review** to expand a parchment form (Name, Village/City, Order Type — *Kadaknath Chickens*, *Kadaknath Chicks*, *Kadaknath Eggs*, or *Farm Visit*, 1–5 Star Rating, and Review Comment). Submitting saves the review as pending moderation (or immediately visible to the owner) with clear confirmation feedback.
  2. **Owner Review Moderation**: Clicking **Owner Login** in the reviews header triggers Google Sign-In. Once authenticated as the farm owner, an inline **Manage Reviews** panel appears showing pending and published reviews with single-click **Approve**, **Unpublish**, and **Delete** controls plus the ability to publish a direct verified review.
  3. **Location Preview & Directions**: In **Contact Us**, clicking the interactive map pin reveals the farm address card and direct link, zoom/recenter controls adjust the map framing cleanly, and clicking **View on Google Maps** opens `https://goo.gl/maps/AXYQmb3qZBZhFMzj7` in a new tab.
- **Visual Identity & Theme**:
  - Preserves the heritage parchment (`#F5EBD6` / `#FAF3E3`), deep forest green (`#1B3B22`), and antique gold (`#C89B3C` / `#DFB75E`) design tokens with `Playfair Display`, `Cormorant Garamond`, and `Plus Jakarta Sans`.
  - Unboxed typographic metadata (`·` separators), single-line button labels (`whitespace-nowrap shrink-0`), balanced headlines (`text-wrap: balance`), and minimum `40px` (`44px` mobile) touch targets.
- **Interactive Feedback & Motion**:
  - Instant drawer/panel transitions ($\le 200\text{ms}$ easing), inline validation messages for incomplete review fields, empty-state messaging before the first approved review is published, and clear permission/error handling.

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Moderation Queue (`pending` -> `approved`) vs. Unmoderated Instant Public Posting**
  - *Chosen Approach*: Customer-submitted reviews default to `pending` status until approved by the authenticated farm owner (`akhilpal1056@gmail.com`), while still showing a clear confirmation banner to the submitter.
  - *Why*: Protects the farm's public reputation against spam or false entries while allowing any real visitor to submit a genuine review.
  - *Alternatives Considered*: Unmoderated public writes (vulnerable to automated spam) or owner-only entry (prevents customers from submitting reviews themselves).
- **Decision 2: Interactive Custom Map Preview + Exact Google Maps URL vs. Google Maps JavaScript SDK**
  - *Chosen Approach*: Retain the self-contained interactive map preview with zoom/recenter/pin inspection controls enhanced with resolved location details from `https://goo.gl/maps/AXYQmb3qZBZhFMzj7` and direct **View on Google Maps** actions.
  - *Why*: Respects your earlier preference not to enable Google Maps API billing/keys while guaranteeing the interactive preview renders reliably on every device without iframe blocking or quota failures.
  - *Alternatives Considered*: Embedding third-party iframes that frequently block cross-origin rendering or provisioning a Google Maps API key.
- **Decision 3: Firebase Firestore + Google Sign-In for Reviews Persistence**
  - *Chosen Approach*: Persist customer reviews in Cloud Firestore with strict schema validation security rules and Google Sign-In verification for owner moderation actions.
  - *Why*: Ensures real customer reviews survive page reloads and are shared across all visitors while strictly locking moderation actions to the verified farm owner account.
  - *Alternatives Considered*: Local browser storage only (reviews would not be visible to other customers or manageable across devices).

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Kadaknath Poultry Farm Web App                     │
├─────────────────────────────────┬───────────────────────────────────────┤
│   Verified Farm Configuration   │     Customer Reviews & Moderation     │
│  • Phone/WA: +91 6393860760     │  • Public Query: status == 'approved' │
│  • Pin URL: goo.gl/maps/...     │  • Customer Submit -> status: pending │
│  • Interactive Map Preview      │  • Owner Google Auth -> Approve/Del   │
└────────────────┬────────────────┴───────────────────┬───────────────────┘
                 │                                    │
                 ▼                                    ▼
┌─────────────────────────────────┐  ┌────────────────────────────────────┐
│  Contact, Navbar, Drawer &      │  │   Firebase Auth + Cloud Firestore  │
│  Footer Action Dispatchers      │  │  • Collection: /reviews/{reviewId} │
│  • tel:+916393860760            │  │  • Admin Gate: email_verified &&   │
│  • wa.me/916393860760           │  │    owner email / /admins/{uid}     │
└─────────────────────────────────┘  └────────────────────────────────────┘
```

- **Data Model & State**:
  - **Farm Contact Config**: Stores verified `phoneDisplay` (`+91 6393860760`), `whatsappDigits` (`916393860760`), verified Google Maps URL (`https://goo.gl/maps/AXYQmb3qZBZhFMzj7`), address (`Bhoshana, Shivli Road, Uttar Pradesh, India`), and optional inline contact updates.
  - **Review Document (`/reviews/{reviewId}`)**:
    - `authorName`: string (2–60 chars, required)
    - `location`: string (2–60 chars, e.g., village or city, required)
    - `purchaseType`: enum (`Kadaknath Chickens`, `Kadaknath Chicks`, `Kadaknath Eggs`, `Farm Visit`)
    - `rating`: integer (`1` to `5`)
    - `comment`: string (10–450 chars, required)
    - `status`: enum (`pending` | `approved`)
    - `createdAt`: server timestamp (`request.time`)
- **Interactive Component & State Mapping**:
  - **Customer Review Form**: Validates input lengths and rating bounds before writing `{ status: 'pending', createdAt: serverTimestamp() }`; resets fields and displays confirmation upon completion.
  - **Public Review Grid**: Subscribes to approved reviews ordered newest-first; renders a clean empty state when zero approved reviews exist rather than synthetic quotes.
  - **Owner Moderation Panel**: Triggered when authenticated owner signs in via Google popup; subscribes to all reviews (`pending` + `approved`) and executes validated `updateDoc` (`status: 'approved' | 'pending'`) and `deleteDoc` actions with contextual error handling.
  - **Interactive Contact Map Card**: Supports `+`/`-` zoom scaling (`1.0x` to `1.6x`), recenter reset, pin popup toggle with copyable location link, and direct external launch to `https://goo.gl/maps/AXYQmb3qZBZhFMzj7`.
