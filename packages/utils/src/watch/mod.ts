/**
 * @module @vanaware/buildit/watch
 * @description Módulo de desenvolvimento contínuo (Watch) para Deno e Preact.
 *
 * @example
 * ```typescript
 * import { watchEngine } from "jsr:@vanaware/buildit";
 *
 * const handles = await watchEngine({
 *   configPath: "watch.jsonc",
 *   targets: ["ui"],
 * });
 * ```
 */

export { watchEngine, } from "./engine.ts";

export { WATCH_CONFIG_EXAMPLE as watchExample, } from "./config.ts";

export type {
  WatchHandle,
  WatchLockData,
  WatchOptions,
  WatchTargetConfig,
} from "../tools/interfaces.ts";
