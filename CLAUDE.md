# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run lint` — run ESLint (flat config, `eslint.config.mjs`)
- No test framework is configured yet

## Stack

- **Next.js 16** (App Router) — read `node_modules/next/dist/docs/` before writing Next.js code; APIs may differ from training data
- **React 19** with Server Components by default
- **TypeScript** (strict mode)
- **Tailwind CSS v4** via `@tailwindcss/postcss` — styles imported with `@import "tailwindcss"` in `globals.css`, no `tailwind.config` file
- **ESLint 9** flat config with `core-web-vitals` and `typescript` presets

## Neon Database (MCP)

- **Project:** `autumn-sea-33059346` (devstash)
- **Development branch:** `br-flat-union-b4hq7u1z` (name: `development`)
- **Production branch:** `br-bold-smoke-b4ld7b14` (name: `production`)

**Always use the development branch** (`br-flat-union-b4hq7u1z`) for all Neon MCP operations by default. Never read from or write to the production branch unless I explicitly say "production". Pass `branch_id` on every `run_sql` call.

## Project Structure

- `src/app/` — App Router pages and layouts
- `@/*` path alias maps to `./src/*` (configured in `tsconfig.json`)
- Layout uses `LayoutProps<"/">` type from Next.js for the root layout props
- Geist and Geist Mono fonts loaded via `next/font/google`, exposed as CSS variables `--font-geist-sans` and `--font-geist-mono`
