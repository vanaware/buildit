/**
 * @module @vanaware/buildit/esbuild
 * @description Orquestrador de compilação e empacotamento com esbuild nativo e `@deno/esbuild-plugin`.
 *
 * @example
 * ```typescript
 * import { esBuild } from "jsr:@vanaware/buildit";
 *
 * await esBuild({
 *   noversion: true,
 * });
 * ```
 */

// ============================================================================
// 📦 RE-EXPORTS DE MÓDULOS ESPECÍFICOS
// ============================================================================
export { esBuild, } from "./engine.ts";

export { ESBUILD_CONFIG_EXAMPLE as esbuildExample, } from "./config.ts";

export type {
  EsbuildGlobalConfig,
  EsbuildOptions,
  EsbuildResult,
  EsbuildTargetConfig,
} from "../tools/interfaces.ts";
