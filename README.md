# Unified Automation — EdTech Platform

Project-based engineering education platform. Built with Next.js 15, Prisma, PostgreSQL, and Clerk.

## Status: Phase 1 + 1.5 + 2 complete

| Phase | Status | What it adds |
|-------|--------|--------------|
| 1 | ✓ Complete | Foundation: landing, catalog, auth, DB |
| 1.5 | ✓ Complete | All static pages + legal (terms/privacy/refunds for Razorpay) |
| 2 | ✓ Complete | Full curriculum view, search, category filters, mobile menu, instructor section |
| 3 | Next | Student dashboard with progress, profile editor |
| 4 | Pending | Razorpay checkout, enrollment, coupons |
| 5 | Pending | VdoCipher player, lesson progress, quizzes |
| 6 | Pending | PDF certificates, admin panel, email notifications |

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure env (see Service setup below)
cp .env.example .env.local

# 3. Reset DB with new schema + seed
npm run db:push
npm run db:seed

# 4. Run
npm run dev
```

Open http://localhost:3000.

> **Important:** if you're upgrading from a previous version, you must re-run `npm run db:seed` because the new seed adds modules and lessons that didn't exist before.

---

## What's new in Phase 1.5

All static and legal pages built. **Critical for Razorpay onboarding** — they require the legal pages live before approving payment integration.

| Route | Purpose |
|-------|---------|
| `/about` | Mission, story, stats |
| `/contact` | Email channels for admissions, support, partnerships, press |
| `/internships` | How the internship program works + sample briefs |
| `/colleges` | B2B partnerships landing |
| `/mentors` | Mentor philosophy + recruitment CTA |
| `/careers` | Hiring (currently shows "no open roles") |
| `/verify` | **Functional** certificate verification — looks up by ID |
| `/terms` | Terms of Service (DPDP-compliant for India) |
| `/privacy` | Privacy Policy (DPDP-compliant for India) |
| `/refunds` | Refund Policy (Razorpay-required) |

**Action item for you:** before going live, replace the placeholder phone number in `/contact` and review all legal copy with a lawyer. The drafts are reasonable starting points but should be reviewed for your specific case.

---

## What's new in Phase 2

### Course detail page upgrades
- Full curriculum accordion with modules and lessons (server-rendered, no JS bloat — uses native `<details>`)
- Lesson type icons (▶ video, ≡ text, ↓ pdf)
- "Preview" badge on free preview lessons
- Module-level duration totals
- Instructor section with avatar fallback
- Target audience + prerequisites side-by-side
- Sticky enrollment card with refund policy link
- 7-day refund explainer

### Catalog page upgrades
- **Search bar** with 300ms debounce, updates URL (`?q=stm32`)
- **Category filter chips** — multi-state, URL-driven (`?cat=embedded`)
- Combined filtering: search + category work together
- Sticky filter bar that stays visible on scroll
- Empty state with reset link
- Result summary ("3 results for 'mqtt' in IoT")

### Mobile responsiveness
- Hamburger menu for mobile (replaces previously hidden desktop nav)
- All pages tested at 380px viewport
- Sticky filter bar collapses cleanly on small screens

### Better seed data
Each of the 4 courses now has 4 modules with 12-16 lessons. Run `npm run db:seed` to refresh.

---

## Service setup (one-time)

### 1. Database — Neon (free tier)

[neon.tech](https://neon.tech) → create project → copy connection string into `DATABASE_URL` in `.env.local`.

### 2. Authentication — Clerk

[clerk.com](https://clerk.com) → create application → enable **Email** only under sign-in methods (no SMS = no DLT registration). Optionally enable Google OAuth for higher conversion.

Copy keys into `.env.local`:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### 3. Clerk webhook (user sync)

In Clerk → Webhooks → Add Endpoint:
- URL: `https://yourdomain.com/api/webhooks/clerk` (use ngrok for local: `ngrok http 3000`)
- Events: `user.created`, `user.updated`, `user.deleted`

Copy the signing secret into `CLERK_WEBHOOK_SECRET`.

---

## Project structure (post-Phase 2)

```
ua-platform/
├── prisma/
│   ├── schema.prisma                      # Database models
│   └── seed.ts                            # 4 courses, 16 modules, 52 lessons
├── src/
│   ├── middleware.ts                      # Clerk route protection
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                       # Landing
│   │   ├── globals.css
│   │   ├── courses/
│   │   │   ├── page.tsx                   # Catalog with search + filters
│   │   │   └── [slug]/page.tsx            # Course detail with curriculum
│   │   ├── dashboard/page.tsx             # Student dashboard
│   │   ├── about/page.tsx                 # ← NEW (1.5)
│   │   ├── contact/page.tsx               # ← NEW (1.5)
│   │   ├── internships/page.tsx           # ← NEW (1.5)
│   │   ├── colleges/page.tsx              # ← NEW (1.5)
│   │   ├── mentors/page.tsx               # ← NEW (1.5)
│   │   ├── careers/page.tsx               # ← NEW (1.5)
│   │   ├── verify/page.tsx                # ← NEW (1.5) functional cert lookup
│   │   ├── terms/page.tsx                 # ← NEW (1.5) legal
│   │   ├── privacy/page.tsx               # ← NEW (1.5) legal
│   │   ├── refunds/page.tsx               # ← NEW (1.5) legal
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   └── api/webhooks/clerk/route.ts
│   ├── components/
│   │   └── marketing/
│   │       ├── navbar.tsx                 # ← UPDATED: mobile menu
│   │       ├── hero.tsx
│   │       ├── course-tracks.tsx
│   │       ├── why-us.tsx
│   │       ├── cta-footer.tsx
│   │       ├── page-shell.tsx             # ← NEW (1.5) shared static layout
│   │       ├── curriculum-accordion.tsx   # ← NEW (Phase 2)
│   │       └── courses-filter.tsx         # ← NEW (Phase 2) client search/filter
│   └── lib/
│       ├── prisma.ts
│       └── utils.ts
```

---

## Verifying Phase 2 works

After `npm install && npm run db:push && npm run db:seed && npm run dev`:

**Landing + navigation**
- [ ] Landing page works as before
- [ ] All footer links resolve to real pages (no 404s)
- [ ] Hamburger menu opens/closes on mobile (resize browser to <768px)

**Catalog**
- [ ] `/courses` shows 4 tracks
- [ ] Type "stm32" in search → filters to one result, URL becomes `/courses?q=stm32`
- [ ] Click a category chip → filters to that category, URL becomes `/courses?cat=embedded`
- [ ] Combine search + category → both filters apply
- [ ] "Reset filters" link clears both

**Course detail**
- [ ] Click any course → detail page loads
- [ ] Curriculum accordion shows 4 modules
- [ ] First module is open by default; clicking others toggles them
- [ ] Lessons show type icons and durations
- [ ] "Preview" badge appears on free preview lessons
- [ ] Sticky sidebar stays in place on scroll (desktop only)

**Static pages**
- [ ] `/about`, `/contact`, `/internships`, `/colleges`, `/mentors`, `/careers` all load
- [ ] `/terms`, `/privacy`, `/refunds` all load with proper content
- [ ] `/verify` shows the form
- [ ] `/verify?id=UA-2026-FAKE123` shows "not found" state correctly

**Build check**
- [ ] `npm run build` completes with no errors

---

## Razorpay onboarding — start NOW

Razorpay approval takes 7-10 days. Start the clock now while we build Phase 4:

1. Sign up at [razorpay.com](https://razorpay.com) with your business email
2. Submit KYC documents (PAN, GST, bank account, business registration)
3. Provide your **website URL** with these specific pages live:
   - `/terms`
   - `/privacy`
   - `/refunds`
   - `/contact`
4. Wait for approval. Test mode keys work in the meantime.

When Phase 4 ships, you'll just plug in your live keys.

---

## Useful commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:push      # Sync schema to DB
npm run db:seed      # Seed sample data (wipes existing!)
npm run db:studio    # Visual DB browser
```

---

## What's next — Phase 3

Once you've verified Phase 2 works:
- Real student dashboard with enrollments, progress bars, continue-learning shortcuts
- Profile editor (name, college, branch, year)
- Settings page
- Empty/loading states polished

Reply "Phase 2 verified, ship Phase 3" to continue.

---

Built in Coimbatore.
