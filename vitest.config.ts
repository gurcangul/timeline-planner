import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": "/src" },
  },
  test: {
    environment: "node", // saf mantık testleri — DOM gerekmiyor
    include: ["src/**/*.test.ts"],
  },
});
