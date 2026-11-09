import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.test.tsx"],
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      include: ["src/actions/**", "src/lib/**"],
      exclude: ["src/lib/db.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
