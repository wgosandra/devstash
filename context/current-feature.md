# Current Feature

## Status

Not Started

## Goals

<!-- Add goals here -->

## Notes

<!-- Add notes here -->

## History

- **2026-09-30** — Initial Next.js and Tailwind CSS v4 setup (commit `4542980`)
- **2026-10-01** — Dashboard UI Phase 1: shadcn/ui init, dark mode, top bar, sidebar/main placeholders
- **2026-10-01** — Dashboard UI Phase 2: collapsible sidebar, item types with icons, collections, user avatar, mobile drawer
- **2026-10-01** — Dashboard UI Phase 3: main content area with stats cards, collections grid, pinned items, recent items
- **2026-10-01** — Prisma 7 + Neon PostgreSQL setup: schema, migrations, Neon adapter, db test script
- **2026-10-09** — Database seed script: demo user, system item types, collections, tags, and 18 sample items
- **2026-10-09** — Dashboard collections: replaced mock data with real Prisma queries, type-colored borders, type icons
- **2026-10-09** — Dashboard items: replaced mock item data with real Prisma queries, type-colored borders/icons
- **2026-10-09** — Stats & sidebar: replaced mock data with real Prisma queries, item types with counts, colored collection circles, "View all collections" link
- **2026-10-12** — Add Pro Badge to Sidebar: shadcn Badge on Files and Images types in sidebar
- **2026-10-13** — Code scanner quick wins: aria labels, next/link, conditional render, initials fix, DATABASE_URL validation, delete mock-data
- **2026-10-15** — Auth Setup: NextAuth v5 with GitHub OAuth + Credentials (email/password), split config pattern, proxy route protection, registration API, Zod validation, bcrypt hashing
- **2026-10-16** — Auth UI: custom sign-in page, register page, sidebar avatar with sign-out dropdown, replaced demo user with real auth session
- **2026-10-16** — Toast notification: show success toast after registration redirects to sign-in page, added Sonner to root layout
- **2026-10-19** — Email Verification on Register: verification email via Resend with token link, block unverified sign-in, check-email and verify-email pages, expired token handling with resend, SKIP_EMAIL_VERIFICATION env toggle
- **2026-10-20** — Forgot Password: forgot password link on sign-in, forgot password page with email form, password reset email via Resend, reset password page with token validation, expired/invalid token handling, reuses VerificationToken model with `pwd-reset:` prefix, success toast redirect to sign-in
- **2026-10-20** — Profile Page: profile page at /dashboard/profile with user info (avatar, email, join date, auth method badges), usage stats (total items, collections, item type breakdown), change password form (credentials users only), delete account with confirmation dialog
- **2026-10-21** — Rate Limiting for Auth: Upstash Redis rate limiting on login (5/15min), register (3/1hr), forgot-password (3/1hr), reset-password (5/15min), resend-verification (3/15min), sliding window algorithm, fail-open design, 429 responses with Retry-After headers, frontend error display
- **2026-10-24** — Items List View: dynamic `/items/[type]` route, extracted shared ItemCard component, type-filtered Prisma queries, responsive 2-column grid, type-colored left borders, empty state, 404 for invalid slugs
