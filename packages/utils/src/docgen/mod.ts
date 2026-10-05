/**
 * @module @vanaware/buildit/docgen
 * @description Documentation Engine for Deno Workspaces.
 * Extracts JSDoc, generates Markdown, and optionally creates a Docsify site.
 */

export * from "./types.ts";
export { runDocgen, } from "./engine.ts";
