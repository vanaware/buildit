/**
 * @module @vanaware/buildit
 * @description TypeScript utility suite for build orchestration (esbuild and Deno.bundle),
 * continuous development (watch), AI context export, and SemVer automation.
 *
 * All programmatic engines and utilities are exported directly from this root module:
 *
 * @example
 * ```typescript
 * // @ts-nocheck
 * import { esBuild, watchEngine, denoBuild, exportEngine } from "jsr:@vanaware/buildit";
 *
 * // Run production compilation with esbuild
 * await esBuild({
 *   config: {
 *     ui: {
 *       entryPoints: ["main.tsx"],
 *       distdir: "dist",
 *     },
 *   },
 *   noversion: true,
 * });
 *
 * // Start continuous watch with esbuild.context and concurrency lock
 * const handles = await watchEngine({
 *   config: {
 *     ui: {
 *       entryPoints: ["main.tsx"],
 *       distdir: "dist",
 *     },
 *   },
 *   target: "ui",
 * });
 *
 * // Generate AI context snapshot for LLMs
 * await exportEngine({
 *   config: {
 *     ui: {
 *       outputFile: "snapshots/ui.md",
 *       includes: ["src/main.ts"],
 *     },
 *   },
 * });
 * ```
 */

export * from "./tools/mod.ts";

export { APP_VERSION as version, } from "./version.ts";

export * from "./version/sanitize/mod.ts";
export * from "./denobuild/mod.ts";
export * from "./export/mod.ts";
export * from "./watch/mod.ts";
export * from "./esbuild/mod.ts";
export * from "./version/tag/mod.ts";
