/**
 * @module @vanaware/buildit/export
 * @description Tool and library for structured consolidation of source code
 * and project documentation into Markdown snapshots optimized for AI consumption.
 *
 * Supports external declarative configuration via `export.jsonc`, extension filters,
 * anti-loop protection, and execution via CLI or programmatically.
 *
 * @example
 * ```typescript
 * import { exportEngine } from "jsr:@vanaware/buildit";
 *
 * const results = await exportEngine({
 *   config: {
 *     ui: {
 *       outputFile: "snapshots/ui.md",
 *       includes: ["src/**\/*"],
 *     },
 *   },
 *   modes: ["ui", "docs"],
 * });
 * ```
 */

export { exportEngine, } from "./engine.ts";

export { 
  EXPORT_CONFIG_EXAMPLE as exportExample,
  loadExportConfig
 } from "./config.ts";

export type {
  ExportConfig,
  ExportOptions,
  ExportResult,
} from "../tools/interfaces.ts";
