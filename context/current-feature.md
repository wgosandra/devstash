# Current Feature

Stats & Sidebar — Show real database data in stats cards and sidebar instead of mock data.

## Status

In Progress

## Spec

- Display stats pertaining to database data, keeping the current design/layout
- Display item types in sidebar with their icons, linking to /items/[typename]
- Add "View all collections" link under the collections list that goes to /collections
- Keep the star icons for favorite collections but for recents, each collection should show a colored circle based on the most-used item type in that collection
- Create `src/lib/db/items.ts` and add the database functions. Use the collections file for reference if needed

## References

- `context/features/stats-sidebar-spec.md`
- `src/lib/db/collections.ts`

## History

- **2026-09-30** — Initial Next.js and Tailwind CSS v4 setup (commit `4542980`)
- **2026-10-01** — Dashboard UI Phase 1: shadcn/ui init, dark mode, top bar, sidebar/main placeholders
- **2026-10-01** — Dashboard UI Phase 2: collapsible sidebar, item types with icons, collections, user avatar, mobile drawer
- **2026-10-01** — Dashboard UI Phase 3: main content area with stats cards, collections grid, pinned items, recent items
- **2026-10-01** — Prisma 7 + Neon PostgreSQL setup: schema, migrations, Neon adapter, db test script
- **2026-10-09** — Database seed script: demo user, system item types, collections, tags, and 18 sample items
- **2026-10-09** — Dashboard collections: replaced mock data with real Prisma queries, type-colored borders, type icons
- **2026-10-09** — Dashboard items: replaced mock item data with real Prisma queries, type-colored borders/icons
