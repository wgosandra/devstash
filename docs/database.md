# Database Documentation

> Generated documentation for DevStash's Neon PostgreSQL database

---

## Overview

DevStash uses **Neon PostgreSQL** (serverless Postgres) with **Prisma 7** as the ORM. The database has two branches:

| Branch | ID | Purpose |
| --- | --- | --- |
| `development` | `br-flat-union-b4hq7u1z` | Development and testing |
| `production` | `br-bold-smoke-b4ld7b14` | Live production data |

**Neon Project:** `autumn-sea-33059346`

---

## Enums

### ContentType

Classifies how an item stores its content.

| Value | Used By | Storage |
| --- | --- | --- |
| `TEXT` | Snippet, Prompt, Command, Note | `content` field (text blob) |
| `FILE` | File, Image | `fileUrl` (Cloudflare R2 URL) |
| `URL` | Link | `url` field |

---

## Models

### User

Authentication and profile data. Supports both OAuth and credentials login.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | String | PK, cuid | Unique identifier |
| `name` | String? | | Display name |
| `email` | String | **unique** | Login email |
| `emailVerified` | DateTime? | | When email was verified |
| `image` | String? | | Avatar URL |
| `password` | String? | | Hashed password (null for OAuth-only) |
| `isPro` | Boolean | default: `false` | Pro subscription status |
| `stripeCustomerId` | String? | **unique** | Stripe customer reference |
| `stripeSubscriptionId` | String? | **unique** | Stripe subscription reference |
| `stripePriceId` | String? | | Current Stripe price |
| `stripeCurrentPeriodEnd` | DateTime? | | Subscription period end |
| `createdAt` | DateTime | default: `now()` | Account creation date |
| `updatedAt` | DateTime | `@updatedAt` | Last update timestamp |

**Relations:** Account[], Session[], Item[], ItemType[], Collection[], Tag[]

---

### Account

OAuth provider accounts linked to users (Auth.js adapter model).

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | String | PK, cuid | |
| `userId` | String | FK → User, **onDelete: Cascade** | Owner |
| `type` | String | | Account type |
| `provider` | String | | OAuth provider name |
| `providerAccountId` | String | | Provider's account ID |
| `refresh_token` | String? | | OAuth refresh token |
| `access_token` | String? | | OAuth access token |
| `expires_at` | Int? | | Token expiry (epoch) |
| `token_type` | String? | | Token type |
| `scope` | String? | | OAuth scopes |
| `id_token` | String? | | OIDC ID token |
| `session_state` | String? | | Session state |

**Unique:** `[provider, providerAccountId]`
**Indexes:** `[userId]`

---

### Session

Active user sessions (Auth.js adapter model).

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | String | PK, cuid | |
| `sessionToken` | String | **unique** | Session identifier |
| `userId` | String | FK → User, **onDelete: Cascade** | Owner |
| `expires` | DateTime | | Expiry timestamp |

**Indexes:** `[userId]`

---

### VerificationToken

Email verification and password reset tokens (Auth.js adapter model).

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `identifier` | String | | Email or `pwd-reset:<email>` |
| `token` | String | **unique** | Hashed token value |
| `expires` | DateTime | | Token expiry |

**Unique:** `[identifier, token]`

---

### ItemType

Defines the category/type for items. 7 system types are seeded; Pro users can create custom types.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | String | PK, cuid | |
| `name` | String | | Display name (e.g. "Snippet") |
| `slug` | String | | URL slug (e.g. "snippets") |
| `icon` | String? | | Lucide icon name |
| `color` | String? | | Hex color code |
| `isSystem` | Boolean | default: `false` | System-defined (immutable) |
| `userId` | String? | FK → User, **onDelete: Cascade** | null for system types |

**Unique:** `[userId, slug]`
**Relations:** Item[]

---

### Item

Core entity — every saved resource is an Item.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | String | PK, cuid | |
| `title` | String | | Display title |
| `description` | String? | | Optional description |
| `contentType` | ContentType | | TEXT, FILE, or URL |
| `content` | String? | | Text content (TEXT types) |
| `language` | String? | | Programming language for highlighting |
| `fileUrl` | String? | | R2 URL (FILE types) |
| `fileName` | String? | | Original filename |
| `fileSize` | Int? | | Size in bytes |
| `mimeType` | String? | | MIME type |
| `url` | String? | | External URL (URL types) |
| `isFavorite` | Boolean | default: `false` | Favorited by user |
| `isPinned` | Boolean | default: `false` | Pinned to top |
| `lastUsedAt` | DateTime? | | Last accessed timestamp |
| `userId` | String | FK → User, **onDelete: Cascade** | Owner |
| `typeId` | String | FK → ItemType, **onDelete: Restrict** | Item type |
| `createdAt` | DateTime | default: `now()` | Creation date |
| `updatedAt` | DateTime | `@updatedAt` | Last update |

**Indexes:** `[userId, typeId]`, `[userId, isPinned]`, `[userId, isFavorite]`, `[userId, lastUsedAt]`
**Relations:** ItemCollection[], ItemTag[]

---

### Collection

Groups of items. An item can belong to multiple collections.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | String | PK, cuid | |
| `name` | String | | Collection name |
| `description` | String? | | Description |
| `isFavorite` | Boolean | default: `false` | Favorited |
| `userId` | String | FK → User, **onDelete: Cascade** | Owner |
| `createdAt` | DateTime | default: `now()` | Creation date |
| `updatedAt` | DateTime | `@updatedAt` | Last update |

**Indexes:** `[userId]`
**Relations:** ItemCollection[]

---

### ItemCollection (join table)

Many-to-many relationship between Items and Collections.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `itemId` | String | PK (composite), FK → Item, **onDelete: Cascade** | |
| `collectionId` | String | PK (composite), FK → Collection, **onDelete: Cascade** | |
| `addedAt` | DateTime | default: `now()` | When item was added |

**Indexes:** `[collectionId]`

---

### Tag

User-defined labels for categorizing items.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | String | PK, cuid | |
| `name` | String | | Tag name |
| `userId` | String | FK → User, **onDelete: Cascade** | Owner |

**Unique:** `[userId, name]`
**Relations:** ItemTag[]

---

### ItemTag (join table)

Many-to-many relationship between Items and Tags.

| Field | Type | Constraints | Description |
| --- | --- | --- | --- |
| `itemId` | String | PK (composite), FK → Item, **onDelete: Cascade** | |
| `tagId` | String | PK (composite), FK → Tag, **onDelete: Cascade** | |

**Indexes:** `[tagId]`

---

## Relationships Diagram

```
User ──┬── 1:N ──→ Account
       ├── 1:N ──→ Session
       ├── 1:N ──→ Item
       ├── 1:N ──→ ItemType (custom only)
       ├── 1:N ──→ Collection
       └── 1:N ──→ Tag

ItemType ── 1:N ──→ Item

Item ──┬── N:M ──→ Collection  (via ItemCollection)
       └── N:M ──→ Tag         (via ItemTag)
```

---

## Row Counts (development branch)

Queried on 2026-10-23.

| Table | Rows |
| --- | --- |
| User | 3 |
| Account | 1 |
| Session | 0 |
| VerificationToken | 1 |
| ItemType | 7 |
| Item | 18 |
| Collection | 5 |
| ItemCollection | 18 |
| Tag | 16 |
| ItemTag | 41 |

---

## Seed Data Summary

The seed script (`prisma/seed.ts`) creates a demo environment:

**Demo User:** `demo@devstash.io` (password: `12345678`, hashed with bcrypt)

**7 System Item Types:**

| Name | Slug | Icon | Color |
| --- | --- | --- | --- |
| Snippet | snippets | Code | #3b82f6 (blue) |
| Prompt | prompts | Sparkles | #8b5cf6 (purple) |
| Command | commands | Terminal | #f97316 (orange) |
| Note | notes | StickyNote | #fde047 (yellow) |
| File | files | File | #6b7280 (gray) |
| Image | images | Image | #ec4899 (pink) |
| Link | links | Link | #10b981 (emerald) |

**16 Tags:** react, hooks, typescript, patterns, ai, prompts, docker, git, devops, ci-cd, css, tailwind, design, terminal, npm, workflow

**5 Collections with 18 Items:**

| Collection | Items | Types |
| --- | --- | --- |
| React Patterns | 3 | Snippets (useDebounce, Context Provider, cn() utility) |
| AI Workflows | 3 | Prompts (Code Review, Documentation Generator, Refactoring Assistant) |
| DevOps | 4 | 1 Snippet (Dockerfile), 1 Command (Deploy), 2 Links (Vercel, GitHub Actions) |
| Terminal Commands | 4 | Commands (Git Rebase, Docker, Process Mgmt, npm shortcuts) |
| Design Resources | 4 | Links (Tailwind, shadcn/ui, Radix, Lucide) |

**Pinned items (4):** useDebounce Hook, Context Provider Pattern, Multi-stage Dockerfile, Git Interactive Rebase
**Favorited items (4):** useDebounce Hook, Code Review Prompt, Git Interactive Rebase, Tailwind CSS Documentation

---

## Cascade Behavior

| Parent Deleted | Effect |
| --- | --- |
| User | All Account, Session, Item, ItemType (custom), Collection, Tag rows deleted |
| Item | All ItemCollection, ItemTag rows deleted |
| Collection | All ItemCollection rows deleted |
| Tag | All ItemTag rows deleted |
| ItemType | **Restricted** — cannot delete a type that has items |

---

## Sources

- [prisma/schema.prisma](../prisma/schema.prisma) — Database models and enums
- [prisma/seed.ts](../prisma/seed.ts) — Seed script with demo data
- Neon MCP (development branch `br-flat-union-b4hq7u1z`) — Live row counts

---

*Generated: 2026-10-23*
