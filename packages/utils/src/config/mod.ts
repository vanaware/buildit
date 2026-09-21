export { APP_VERSION } from "../version.ts";
export { loadConfig } from "./jsonc.ts";

/**
 * Extensões de arquivo padrão que são comumente incluídas em snapshots.
 * Reutilizável em qualquer projeto de software.
 */
export const EXTENSOES_PADRAO = [
  ".tsx",
  ".jsx",
  ".js",
  ".ts",
  ".css",
  ".html",
  ".manifest",
  ".map",
  ".sh",
  ".py",
  ".json",
  ".jsonc",
  ".yaml",
  ".yml",
  ".toml",
  ".env.example",
  ".md",
];
