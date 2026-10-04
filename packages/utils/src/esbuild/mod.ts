/**
 * @module @vanaware/buildit/esbuild
 * @description Build and bundle orchestrator with native esbuild and `@deno/esbuild-plugin`.
 *
 * @example
 * ```typescript
 * import { esBuild } from "jsr:@vanaware/buildit";
 *
 * await esBuild({
 *   config: {
 *     app: {
 *       entryPoints: ["main.ts"],
 *       distdir: "dist",
 *     },
 *   },
 *   noversion: true,
 * });
 * ```
 */

// ============================================================================
// 📦 SPECIFIC MODULE RE-EXPORTS
// ============================================================================
export { esBuild, } from "./engine.ts";

export { 
  ESBUILD_CONFIG_EXAMPLE as esbuildExample,
  loadEsbuildConfig
 } from "./config.ts";

export type {
  EsbuildGlobalConfig,
  EsbuildOptions,
  EsbuildResult,
  EsbuildTargetConfig,
} from "../tools/interfaces.ts";
