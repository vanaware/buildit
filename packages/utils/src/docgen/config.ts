/**
 * @module @vanaware/buildit/docgen/config
 * @description Loading external configurations from `docgen.jsonc`.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type { DocgenOptions, } from "./types.ts";

/**
 * Loads the docgen configuration from an external JSONC file.
 *
 * @param configPath Optional path to the configuration file
 * @param baseDir Base directory for relative file resolution
 * @returns Loaded docgen options
 */
export async function loadDocgenConfig(
  configPath?: string,
  baseDir: string = ".",
): Promise<Partial<DocgenOptions>> {
  const parsed = await loadConfig<Partial<DocgenOptions>>(
    "docgen",
    configPath,
    baseDir,
  );

  if (!parsed) {
    return {};
  }

  return parsed;
}
