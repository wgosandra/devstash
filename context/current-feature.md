# Current Feature

Dashboard Items — Replace dummy item data in the main dashboard area with real data from the database.

## Status

In Progress

## Spec

- Create `src/lib/db/items.ts` with data fetching functions
- Fetch items directly in server component
- Item card icon/border derived from the item type
- Display item type tags and anything else currently shown
- If there are no pinned items, nothing should display there
- Update collection stats display

## References

- `context/features/dashboard-items-spec.md`
- `context/devstash-dashboard.html`

## History

- **2026-09-30** — Initial Next.js and Tailwind CSS v4 setup (commit `4542980`)
- **2026-10-01** — Dashboard UI Phase 1: shadcn/ui init, dark mode, top bar, sidebar/main placeholders
- **2026-10-01** — Dashboard UI Phase 2: collapsible sidebar, item types with icons, collections, user avatar, mobile drawer
- **2026-10-01** — Dashboard UI Phase 3: main content area with stats cards, collections grid, pinned items, recent items
- **2026-10-01** — Prisma 7 + Neon PostgreSQL setup: schema, migrations, Neon adapter, db test script
- **2026-10-09** — Database seed script: demo user, system item types, collections, tags, and 18 sample items
- **2026-10-09** — Dashboard collections: replaced mock data with real Prisma queries, type-colored borders, type icons
