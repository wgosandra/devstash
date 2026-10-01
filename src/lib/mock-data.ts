type ContentType = "TEXT" | "FILE" | "URL";

// ─── Current user ────────────────────────────────────────

export const currentUser = {
  id: "user_1",
  name: "Wes Gosandra",
  email: "familygosandra@gmail.com",
  image: null,
  isPro: false,
};

// ─── Item types ──────────────────────────────────────────

export type ItemType = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  isSystem: boolean;
  contentKind: ContentType;
  itemCount: number;
  pro?: boolean;
};

export const itemTypes: ItemType[] = [
  { id: "type_snippet", name: "Snippets", slug: "snippets", icon: "Code", color: "#3b82f6", isSystem: true, contentKind: "TEXT", itemCount: 42 },
  { id: "type_prompt", name: "Prompts", slug: "prompts", icon: "Sparkles", color: "#8b5cf6", isSystem: true, contentKind: "TEXT", itemCount: 18 },
  { id: "type_note", name: "Notes", slug: "notes", icon: "StickyNote", color: "#fde047", isSystem: true, contentKind: "TEXT", itemCount: 23 },
  { id: "type_command", name: "Commands", slug: "commands", icon: "Terminal", color: "#f97316", isSystem: true, contentKind: "TEXT", itemCount: 15 },
  { id: "type_link", name: "Links", slug: "links", icon: "Link", color: "#10b981", isSystem: true, contentKind: "URL", itemCount: 19 },
  { id: "type_image", name: "Images", slug: "images", icon: "Image", color: "#ec4899", isSystem: true, contentKind: "FILE", itemCount: 7 },
  { id: "type_file", name: "Files", slug: "files", icon: "File", color: "#6b7280", isSystem: true, contentKind: "FILE", itemCount: 0, pro: true },
];

// ─── Collections ─────────────────────────────────────────

export type Collection = {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemCount: number;
};

export const collections: Collection[] = [
  { id: "col_1", name: "React Patterns", description: "Hooks, compound components and state patterns I reach for.", isFavorite: true, itemCount: 14 },
  { id: "col_2", name: "Context Files", description: "CLAUDE.md, cursor rules and project briefs for AI tools.", isFavorite: true, itemCount: 8 },
  { id: "col_3", name: "Python Snippets", description: "Data wrangling, CLI scripts and dataclass helpers.", isFavorite: false, itemCount: 22 },
  { id: "col_4", name: "Interview Prep", description: "System design notes and algorithm templates.", isFavorite: false, itemCount: 11 },
  { id: "col_5", name: "DevOps", description: "Docker, git and deploy commands worth keeping.", isFavorite: false, itemCount: 9 },
  { id: "col_6", name: "UI References", description: "Screenshots and links for layout inspiration.", isFavorite: false, itemCount: 12 },
];

// ─── Items ───────────────────────────────────────────────

export type Item = {
  id: string;
  title: string;
  description: string;
  typeId: string;
  contentType: ContentType;
  content?: string;
  language?: string;
  url?: string;
  fileName?: string;
  fileSize?: string;
  isFavorite: boolean;
  isPinned: boolean;
  tags: string[];
  collectionId: string;
  updatedAt: string;
  createdAt: string;
  lastUsedAt: string;
};

export const items: Item[] = [
  {
    id: "item_1",
    typeId: "type_snippet",
    contentType: "TEXT",
    title: "useDebounce hook",
    description: "Debounce any fast-changing value — search inputs, resize handlers, autosave.",
    language: "typescript",
    isPinned: true,
    isFavorite: true,
    tags: ["react", "hooks", "performance"],
    collectionId: "col_1",
    updatedAt: "2h ago",
    createdAt: "Aug 12, 2026",
    lastUsedAt: "12 minutes ago",
    content: `import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}`,
  },
  {
    id: "item_2",
    typeId: "type_prompt",
    contentType: "TEXT",
    title: "Thorough code review",
    description: "Reviewer prompt that flags bugs, security issues and naming before style nits.",
    isPinned: true,
    isFavorite: true,
    tags: ["review", "claude"],
    collectionId: "col_2",
    updatedAt: "Yesterday",
    createdAt: "Jul 3, 2026",
    lastUsedAt: "3 hours ago",
    content: `You are a senior engineer reviewing a pull request.

Review the diff below in this order:
1. Correctness bugs and edge cases
2. Security issues (injection, auth, secrets)
3. Performance problems
4. Naming and readability

For each finding give file:line, severity, and a fix.
Skip formatting nits unless they hide a bug.

<diff>
{{diff}}
</diff>`,
  },
  {
    id: "item_3",
    typeId: "type_command",
    contentType: "TEXT",
    title: "Docker full cleanup",
    description: "Remove stopped containers, dangling images, unused networks and build cache.",
    language: "bash",
    isPinned: true,
    isFavorite: false,
    tags: ["docker", "disk"],
    collectionId: "col_5",
    updatedAt: "3d ago",
    createdAt: "May 20, 2026",
    lastUsedAt: "3 days ago",
    content: `# Reclaim disk space from Docker
docker system prune -af --volumes

# Just build cache
docker builder prune -af`,
  },
  {
    id: "item_4",
    typeId: "type_note",
    contentType: "TEXT",
    title: "Tailwind v4 migration notes",
    description: "What changed moving from v3: CSS-first config, @theme, and renamed utilities.",
    language: "markdown",
    isPinned: false,
    isFavorite: false,
    tags: ["tailwind", "css"],
    collectionId: "col_6",
    updatedAt: "5h ago",
    createdAt: "Sep 2, 2026",
    lastUsedAt: "5 hours ago",
    content: `# Tailwind v4 migration

- Config moves into CSS via @theme
- @tailwind directives -> @import "tailwindcss"
- shadow-sm is now shadow-xs
- ring default width is 1px
- Automatic content detection, no content[]`,
  },
  {
    id: "item_5",
    typeId: "type_link",
    contentType: "URL",
    title: "Prisma relations guide",
    description: "Official docs on one-to-many, many-to-many and self relations.",
    isPinned: false,
    isFavorite: true,
    tags: ["prisma", "docs"],
    collectionId: "col_4",
    updatedAt: "8h ago",
    createdAt: "Aug 30, 2026",
    lastUsedAt: "8 hours ago",
    url: "https://www.prisma.io/docs/orm/prisma-schema/data-model/relations",
  },
  {
    id: "item_6",
    typeId: "type_command",
    contentType: "TEXT",
    title: "Undo last commit, keep changes",
    description: "Soft reset so the changes stay staged.",
    language: "bash",
    isPinned: false,
    isFavorite: false,
    tags: ["git"],
    collectionId: "col_5",
    updatedAt: "1d ago",
    createdAt: "Apr 4, 2026",
    lastUsedAt: "yesterday",
    content: `git reset --soft HEAD~1

# Discard instead
# git reset --hard HEAD~1`,
  },
  {
    id: "item_7",
    typeId: "type_snippet",
    contentType: "TEXT",
    title: "Typed API error handler",
    description: "Wraps route handlers and maps thrown errors to JSON responses.",
    language: "typescript",
    isPinned: false,
    isFavorite: false,
    tags: ["nextjs", "api"],
    collectionId: "col_1",
    updatedAt: "2d ago",
    createdAt: "Jun 18, 2026",
    lastUsedAt: "2 days ago",
    content: `export function withErrors(handler: Handler) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (err) {
      const status = err instanceof HttpError ? err.status : 500;
      return Response.json({ error: String(err) }, { status });
    }
  };
}`,
  },
  {
    id: "item_8",
    typeId: "type_image",
    contentType: "FILE",
    title: "Dashboard layout reference",
    description: "Sidebar + grid layout screenshot for the settings redesign.",
    isPinned: false,
    isFavorite: false,
    tags: ["ui", "layout"],
    collectionId: "col_6",
    updatedAt: "2d ago",
    createdAt: "Sep 25, 2026",
    lastUsedAt: "2 days ago",
    fileName: "dashboard-ref.png",
    fileSize: "412 KB",
  },
  {
    id: "item_9",
    typeId: "type_prompt",
    contentType: "TEXT",
    title: "Explain like a senior engineer",
    description: "Turns any code block into a plain-English walkthrough with trade-offs.",
    isPinned: false,
    isFavorite: false,
    tags: ["learning", "gpt"],
    collectionId: "col_2",
    updatedAt: "4d ago",
    createdAt: "Mar 11, 2026",
    lastUsedAt: "4 days ago",
    content: `Explain the following code to a mid-level developer.
Cover what it does, why it is written this way,
and one alternative approach with its trade-offs.

{{code}}`,
  },
  {
    id: "item_10",
    typeId: "type_link",
    contentType: "URL",
    title: "Next.js App Router docs",
    description: "Layouts, server components, route handlers and caching.",
    isPinned: false,
    isFavorite: false,
    tags: ["nextjs", "docs"],
    collectionId: "col_1",
    updatedAt: "5d ago",
    createdAt: "Feb 2, 2026",
    lastUsedAt: "5 days ago",
    url: "https://nextjs.org/docs/app",
  },
  {
    id: "item_11",
    typeId: "type_snippet",
    contentType: "TEXT",
    title: "Frozen dataclass with defaults",
    description: "Immutable config object with slots and a factory default.",
    language: "python",
    isPinned: false,
    isFavorite: false,
    tags: ["python"],
    collectionId: "col_3",
    updatedAt: "1w ago",
    createdAt: "Jan 14, 2026",
    lastUsedAt: "last week",
    content: `from dataclasses import dataclass, field

@dataclass(frozen=True, slots=True)
class Config:
    name: str
    retries: int = 3
    tags: list[str] = field(default_factory=list)`,
  },
  {
    id: "item_12",
    typeId: "type_file",
    contentType: "FILE",
    title: "CLAUDE.md starter",
    description: "Project context template for AI coding assistants.",
    isPinned: false,
    isFavorite: false,
    tags: ["ai", "template"],
    collectionId: "col_2",
    updatedAt: "1w ago",
    createdAt: "Jan 9, 2026",
    lastUsedAt: "last week",
    fileName: "CLAUDE.md",
    fileSize: "6.2 KB",
  },
];
