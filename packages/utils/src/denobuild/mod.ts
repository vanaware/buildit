/**
 * @module @vanaware/buildit/denobuild
 * @description Orquestrador e biblioteca de compilação utilizando a API nativa `Deno.bundle` (--unstable-bundle).
 *
 * Suporta configuração declarativa externa via `denobuild.jsonc`, pré e pós-processamento,
 * injeção de defines em memória, cópia de ativos e geração de bundles ESM de alta performance.
 *
 * @example
 * ```typescript
 * import { denoBuild } from "@vanaware/buildit/denobuild";
 *
 * const resultados = await denoBuild({
 *   caminhoConfig: "denobuild.jsonc",
 *   targets: ["ui"],
 *   noversion: true,
 * });
 * ```
 */

export { denoBuild, } from "./engine.ts";

export { DENOBUILD_CONFIG_EXAMPLE as denobuildExample, } from "./config.ts";

export type {
  DenoBuildOptions,
  DenoBuildResult,
  DenoBundleGlobalConfig,
  DenoBundleTargetConfig,
} from "../tools/interfaces.ts";
