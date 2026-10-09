# Current Feature

## Seed Database with Demo Data

Create a seed script (`prisma/seed.ts`) to populate the database with a demo user, system item types, collections, and sample items for development and demos.

See full spec: [seed-spec.md](features/seed-spec.md)

### Tasks

- [ ] Install `bcryptjs` for password hashing
- [ ] Create `prisma/seed.ts` with demo user (demo@devstash.io / 12345678)
- [ ] Seed 7 system item types (snippet, prompt, command, note, file, image, link)
- [ ] Seed 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources)
- [ ] Seed sample items per collection as defined in spec
- [ ] Associate items with collections and add relevant tags
- [ ] Verify `npm run db:seed` works and data appears in Prisma Studio

## Status

In Progress

## History

- **2026-09-30** — Initial Next.js and Tailwind CSS v4 setup (commit `4542980`)
- **2026-10-01** — Dashboard UI Phase 1: shadcn/ui init, dark mode, top bar, sidebar/main placeholders
- **2026-10-01** — Dashboard UI Phase 2: collapsible sidebar, item types with icons, collections, user avatar, mobile drawer
- **2026-10-01** — Dashboard UI Phase 3: main content area with stats cards, collections grid, pinned items, recent items
- **2026-10-01** — Prisma 7 + Neon PostgreSQL setup: schema, migrations, Neon adapter, db test script
