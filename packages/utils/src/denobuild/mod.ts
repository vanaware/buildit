/**
 * @module @vanaware/buildit/denobuild
 * @description Orchestrator and compilation library using the native `Deno.bundle` API (--unstable-bundle).
 *
 * Supports external declarative configuration via `denobuild.jsonc`, pre and post-processing,
 * in-memory define injection, asset copying, and high-performance ESM bundle generation.
 *
 * @example
 * ```typescript
 * import { denoBuild } from "jsr:@vanaware/buildit";
 *
 * const results = await denoBuild({
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
  loadDenoBuildConfig
} from "./config.ts";

export type {
  DenoBuildOptions,
  DenoBuildResult,
  DenoBundleGlobalConfig,
  DenoBundleTargetConfig,
} from "../tools/interfaces.ts";
