/**
 * @module @vanaware/buildit/denobuild
 * @description Orquestrador e biblioteca de compilação utilizando a API nativa `Deno.bundle` (--unstable-bundle).
 *
 * Suporta configuração declarativa externa via `denobuild.jsonc`, pré e pós-processamento,
 * injeção de defines em memória, cópia de ativos e geração de bundles ESM de alta performance.
 *
 * @example
 * ```typescript
 * import { executarDenoBuild } from "@vanaware/buildit/denobuild";
 *
 * const resultados = await executarDenoBuild({
 *   caminhoConfig: "denobuild.jsonc",
 *   targets: ["ui"],
 *   noversion: true,
 * });
 * ```
 */

export * from "./types.ts";
export * from "./config.ts";
export * from "./bundle.ts";
export * from "./engine.ts";
export * from "./cli.ts";
