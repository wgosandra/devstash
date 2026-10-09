import "dotenv/config";
import { PrismaClient, ContentType } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hash } from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const SYSTEM_TYPES = [
  { name: "Snippet", slug: "snippets", icon: "Code", color: "#3b82f6" },
  { name: "Prompt", slug: "prompts", icon: "Sparkles", color: "#8b5cf6" },
  { name: "Command", slug: "commands", icon: "Terminal", color: "#f97316" },
  { name: "Note", slug: "notes", icon: "StickyNote", color: "#fde047" },
  { name: "File", slug: "files", icon: "File", color: "#6b7280" },
  { name: "Image", slug: "images", icon: "Image", color: "#ec4899" },
  { name: "Link", slug: "links", icon: "Link", color: "#10b981" },
] as const;

async function main() {
  console.log("Seeding database...\n");

  // --- Clean up existing demo data ---
  const existing = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
  });
  if (existing) {
    await prisma.item.deleteMany({ where: { userId: existing.id } });
    await prisma.collection.deleteMany({ where: { userId: existing.id } });
    await prisma.tag.deleteMany({ where: { userId: existing.id } });
    await prisma.itemType.deleteMany({ where: { userId: existing.id } });
  }

  // --- User ---
  const hashedPassword = await hash("12345678", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: {},
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      password: hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
  });
  console.log("User:", user.email);

  // --- System Item Types ---
  const types: Record<string, string> = {};
  for (const t of SYSTEM_TYPES) {
    const itemType = await prisma.itemType.upsert({
      where: { userId_slug: { userId: user.id, slug: t.slug } },
      update: {},
      create: {
        name: t.name,
        slug: t.slug,
        icon: t.icon,
        color: t.color,
        isSystem: true,
        userId: user.id,
      },
    });
    types[t.slug] = itemType.id;
  }
  console.log("Item types:", Object.keys(types).length);

  // --- Tags ---
  const tagNames = [
    "react",
    "hooks",
    "typescript",
    "patterns",
    "ai",
    "prompts",
    "docker",
    "git",
    "devops",
    "ci-cd",
    "css",
    "tailwind",
    "design",
    "terminal",
    "npm",
    "workflow",
  ];
  const tags: Record<string, string> = {};
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { userId_name: { userId: user.id, name } },
      update: {},
      create: { name, userId: user.id },
    });
    tags[name] = tag.id;
  }
  console.log("Tags:", Object.keys(tags).length);

  // --- Collections ---
  const collections = await Promise.all([
    prisma.collection.create({
      data: {
        name: "React Patterns",
        description: "Reusable React patterns and hooks",
        userId: user.id,
      },
    }),
    prisma.collection.create({
      data: {
        name: "AI Workflows",
        description: "AI prompts and workflow automations",
        userId: user.id,
      },
    }),
    prisma.collection.create({
      data: {
        name: "DevOps",
        description: "Infrastructure and deployment resources",
        userId: user.id,
      },
    }),
    prisma.collection.create({
      data: {
        name: "Terminal Commands",
        description: "Useful shell commands for everyday development",
        userId: user.id,
      },
    }),
    prisma.collection.create({
      data: {
        name: "Design Resources",
        description: "UI/UX resources and references",
        userId: user.id,
      },
    }),
  ]);
  const [reactPatterns, aiWorkflows, devops, terminalCommands, designResources] =
    collections;
  console.log("Collections:", collections.length);

  // --- Helper ---
  async function createItem(
    data: {
      title: string;
      description?: string;
      contentType: ContentType;
      content?: string;
      language?: string;
      url?: string;
      isFavorite?: boolean;
      isPinned?: boolean;
      typeSlug: string;
      collectionId: string;
      tagNames: string[];
    },
  ) {
    const item = await prisma.item.create({
      data: {
        title: data.title,
        description: data.description,
        contentType: data.contentType,
        content: data.content,
        language: data.language,
        url: data.url,
        isFavorite: data.isFavorite ?? false,
        isPinned: data.isPinned ?? false,
        userId: user.id,
        typeId: types[data.typeSlug],
        collections: {
          create: { collectionId: data.collectionId },
        },
        tags: {
          create: data.tagNames.map((name) => ({ tagId: tags[name] })),
        },
      },
    });
    return item;
  }

  // ── React Patterns (3 snippets) ──

  await createItem({
    title: "useDebounce Hook",
    description: "A custom hook that debounces a value for a specified delay",
    contentType: ContentType.TEXT,
    language: "typescript",
    content: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
    isFavorite: true,
    isPinned: true,
    typeSlug: "snippets",
    collectionId: reactPatterns.id,
    tagNames: ["react", "hooks", "typescript"],
  });

  await createItem({
    title: "Context Provider Pattern",
    description: "Type-safe context with a custom hook for consuming it",
    contentType: ContentType.TEXT,
    language: "typescript",
    content: `import { createContext, useContext, useState, ReactNode } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return (
    <ThemeContext value={{ theme, toggle }}>
      {children}
    </ThemeContext>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}`,
    isPinned: true,
    typeSlug: "snippets",
    collectionId: reactPatterns.id,
    tagNames: ["react", "patterns", "typescript"],
  });

  await createItem({
    title: "cn() Utility",
    description: "Merge Tailwind classes with clsx and tailwind-merge",
    contentType: ContentType.TEXT,
    language: "typescript",
    content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,
    typeSlug: "snippets",
    collectionId: reactPatterns.id,
    tagNames: ["react", "typescript", "tailwind"],
  });

  // ── AI Workflows (3 prompts) ──

  await createItem({
    title: "Code Review Prompt",
    description: "Thorough code review with structured feedback",
    contentType: ContentType.TEXT,
    content: `Review the following code for:
1. **Bugs** — logic errors, off-by-one, null safety
2. **Security** — injection, XSS, auth gaps
3. **Performance** — unnecessary re-renders, N+1 queries, memory leaks
4. **Readability** — naming, structure, comments

For each issue found, provide:
- Severity (critical / warning / suggestion)
- Line number or location
- What's wrong and why
- A concrete fix

If the code looks good, say so and suggest one improvement.`,
    isFavorite: true,
    typeSlug: "prompts",
    collectionId: aiWorkflows.id,
    tagNames: ["ai", "prompts", "workflow"],
  });

  await createItem({
    title: "Documentation Generator",
    description: "Generate comprehensive docs from source code",
    contentType: ContentType.TEXT,
    content: `Analyze the following code and generate documentation that includes:

1. **Overview** — What this module/component does in one paragraph
2. **API Reference** — Each exported function/component with:
   - Parameters and their types
   - Return type
   - Example usage
3. **Dependencies** — External libraries used and why
4. **Edge Cases** — Known limitations or gotchas

Write in a clear, developer-friendly style. Use TypeScript type annotations in examples.`,
    typeSlug: "prompts",
    collectionId: aiWorkflows.id,
    tagNames: ["ai", "prompts"],
  });

  await createItem({
    title: "Refactoring Assistant",
    description: "Guide refactoring with best practices",
    contentType: ContentType.TEXT,
    content: `Refactor the following code with these goals:
- Reduce complexity (aim for single-responsibility functions)
- Improve type safety (eliminate any, add proper generics)
- Extract reusable utilities
- Improve naming for clarity

Rules:
- Don't change public API or behavior
- Keep changes minimal and focused
- Explain each change in a comment above it
- Show before/after for each refactored section`,
    typeSlug: "prompts",
    collectionId: aiWorkflows.id,
    tagNames: ["ai", "prompts", "workflow"],
  });

  // ── DevOps (1 snippet, 1 command, 2 links) ──

  await createItem({
    title: "Multi-stage Dockerfile",
    description: "Production Node.js Dockerfile with multi-stage build",
    contentType: ContentType.TEXT,
    language: "dockerfile",
    content: `FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]`,
    isPinned: true,
    typeSlug: "snippets",
    collectionId: devops.id,
    tagNames: ["docker", "devops"],
  });

  await createItem({
    title: "Deploy to Production",
    description: "Build, tag and push Docker image then deploy",
    contentType: ContentType.TEXT,
    language: "bash",
    content: `# Build and deploy to production
docker build -t myapp:latest .
docker tag myapp:latest registry.example.com/myapp:latest
docker push registry.example.com/myapp:latest
ssh deploy@prod "docker pull registry.example.com/myapp:latest && docker compose up -d"`,
    typeSlug: "commands",
    collectionId: devops.id,
    tagNames: ["docker", "devops", "ci-cd"],
  });

  await createItem({
    title: "Vercel Deployment Docs",
    description: "Official Vercel deployment documentation",
    contentType: ContentType.URL,
    url: "https://vercel.com/docs/deployments/overview",
    typeSlug: "links",
    collectionId: devops.id,
    tagNames: ["devops"],
  });

  await createItem({
    title: "GitHub Actions Documentation",
    description: "CI/CD workflow reference for GitHub Actions",
    contentType: ContentType.URL,
    url: "https://docs.github.com/en/actions",
    typeSlug: "links",
    collectionId: devops.id,
    tagNames: ["devops", "ci-cd"],
  });

  // ── Terminal Commands (4 commands) ──

  await createItem({
    title: "Git Interactive Rebase",
    description: "Squash, reorder, and edit recent commits",
    contentType: ContentType.TEXT,
    language: "bash",
    content: `# Interactive rebase last 5 commits
git rebase -i HEAD~5

# Squash all commits on branch into one
git reset --soft main && git commit

# Amend last commit message
git commit --amend -m "new message"

# Undo last commit (keep changes)
git reset --soft HEAD~1`,
    isFavorite: true,
    isPinned: true,
    typeSlug: "commands",
    collectionId: terminalCommands.id,
    tagNames: ["git", "terminal"],
  });

  await createItem({
    title: "Docker Essentials",
    description: "Commonly used Docker commands",
    contentType: ContentType.TEXT,
    language: "bash",
    content: `# List running containers
docker ps

# Stop all running containers
docker stop $(docker ps -q)

# Remove all stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# View container logs (follow)
docker logs -f <container_id>

# Shell into running container
docker exec -it <container_id> sh`,
    typeSlug: "commands",
    collectionId: terminalCommands.id,
    tagNames: ["docker", "terminal"],
  });

  await createItem({
    title: "Process Management",
    description: "Find and manage system processes",
    contentType: ContentType.TEXT,
    language: "bash",
    content: `# Find process using a port
lsof -i :3000
# or on Linux
ss -tlnp | grep 3000

# Kill process on port
kill -9 $(lsof -t -i :3000)

# Watch resource usage
top -o %MEM

# Monitor file system events
fswatch -r ./src`,
    typeSlug: "commands",
    collectionId: terminalCommands.id,
    tagNames: ["terminal"],
  });

  await createItem({
    title: "npm / pnpm Shortcuts",
    description: "Package manager tips and tricks",
    contentType: ContentType.TEXT,
    language: "bash",
    content: `# Check outdated packages
npm outdated

# Update all to latest (careful!)
npx npm-check-updates -u && npm install

# List globally installed packages
npm ls -g --depth=0

# Clean npm cache
npm cache clean --force

# Why is a package installed?
npm why <package>

# Run a script from a sub-package
npm -w packages/ui run build`,
    typeSlug: "commands",
    collectionId: terminalCommands.id,
    tagNames: ["npm", "terminal"],
  });

  // ── Design Resources (4 links) ──

  await createItem({
    title: "Tailwind CSS Documentation",
    description: "Official Tailwind CSS v4 docs and utility reference",
    contentType: ContentType.URL,
    url: "https://tailwindcss.com/docs",
    isFavorite: true,
    typeSlug: "links",
    collectionId: designResources.id,
    tagNames: ["tailwind", "css", "design"],
  });

  await createItem({
    title: "shadcn/ui Components",
    description: "Beautifully designed components built with Radix and Tailwind",
    contentType: ContentType.URL,
    url: "https://ui.shadcn.com",
    isPinned: true,
    typeSlug: "links",
    collectionId: designResources.id,
    tagNames: ["design", "react"],
  });

  await createItem({
    title: "Radix UI Primitives",
    description: "Unstyled, accessible UI primitives for React",
    contentType: ContentType.URL,
    url: "https://www.radix-ui.com/primitives",
    typeSlug: "links",
    collectionId: designResources.id,
    tagNames: ["design", "react"],
  });

  await createItem({
    title: "Lucide Icons",
    description: "Beautiful & consistent open-source icons",
    contentType: ContentType.URL,
    url: "https://lucide.dev/icons",
    typeSlug: "links",
    collectionId: designResources.id,
    tagNames: ["design", "css"],
  });

  // --- Summary ---
  const itemCount = await prisma.item.count({ where: { userId: user.id } });
  const tagCount = await prisma.tag.count({ where: { userId: user.id } });
  console.log(`\nSeeding complete!`);
  console.log(`  User: ${user.email}`);
  console.log(`  Item types: ${Object.keys(types).length}`);
  console.log(`  Collections: ${collections.length}`);
  console.log(`  Items: ${itemCount}`);
  console.log(`  Tags: ${tagCount}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
