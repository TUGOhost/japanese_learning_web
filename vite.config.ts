import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const readProcessEnv = (key: string): string | undefined =>
  (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.[key];

const getGithubPagesBase = (): string => {
  const repositoryName = readProcessEnv("GITHUB_REPOSITORY")?.split("/")[1];

  if (!repositoryName || /\.github\.io$/.test(repositoryName)) {
    return "/";
  }

  return `/${repositoryName}/`;
};

export default defineConfig({
  base:
    readProcessEnv("VITE_BASE_PATH") ??
    (readProcessEnv("GITHUB_PAGES") === "true" ? getGithubPagesBase() : "/"),
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts"
  }
});
