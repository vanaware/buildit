/**
 * @module @vanaware/buildit/denobuild
 * @description Orquestrador e biblioteca de compilação utilizando a API nativa `Deno.bundle` (--unstable-bundle).
 *
 * Suporta configuração declarativa externa via `denobuild.jsonc`, pré e pós-processamento,
 * injeção de defines em memória, cópia de ativos e geração de bundles ESM de alta performance.
 *
 * @example
 * ```typescript
 * import { denoBuild } from "jsr:@vanaware/buildit";
 *
 * const resultados = await denoBuild({
 *   config: {
 *     ui: {
 *       entryPoints: ["main.tsx"],
 *       distdir: "dist",
 *     },
 *   },
 *   targets: ["ui"],
 *   noversion: true,
 * });
 * ```
 */

export { denoBuild, } from "./engine.ts";

export { 
  DENOBUILD_CONFIG_EXAMPLE as denobuildExample, 
  carregarConfigDenoBuild
} from "./config.ts";

export type {
  DenoBuildOptions,
  DenoBuildResult,
  DenoBundleGlobalConfig,
  DenoBundleTargetConfig,
} from "../tools/interfaces.ts";
