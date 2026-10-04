/**
 * @module @vanaware/buildit/watch
 * @description Continuous development module (Watch) for Deno and Preact.
 *
 * @example
 * ```typescript
 * import { watchEngine } from "jsr:@vanaware/buildit";
 *
 * const handles = await watchEngine({
 *   config: {
 *     ui: {
 *       entryPoints: ["main.tsx"],
 *       distdir: "dist",
 *     },
 *   },
 *   target: "ui",
 * });
 * ```
 */

export { watchEngine, } from "./engine.ts";

export { 
  WATCH_CONFIG_EXAMPLE as watchExample, 
  loadWatchConfig
} from "./config.ts";

export type {
  WatchHandle,
  WatchLockData,
  WatchOptions,
  WatchTargetConfig,
} from "../tools/interfaces.ts";
