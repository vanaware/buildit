/**
 * @module @vanaware/buildit/export/config
 * @description Loading external configurations from `export.jsonc`.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type { ExportConfig, ExportConfigFile, ExportConfigResult, } from "../tools/interfaces.ts";

/**
 * Example with BuildIt export mode configurations.
 */
export const EXPORT_CONFIG_EXAMPLE: Record<string, ExportConfig> = {
  ui: {
    outputFile: "snapshots/ui.md",
    includes: [
      "packages/ui/{src,public,tests,docs}/**/*.{tsx,jsx,js,ts,css,html,manifest,json,jsonc,md}",
      "packages/ui/{build.ts,deno.json,deno.jsonc,readme.md}",
    ],
    excludes: [
      "**/node_modules/**",
      "**/.git/**",
    ],
    includeVersion: true,
    customInstruction:
      "The text below contains the main SOURCE CODE files for the example application (UI).",
    default: true,
  },
  docs: {
    outputFile: "snapshots/docs.md",
    includes: [
      "docs/**/*.{md,txt}",
      "{readme.md,readme,license,license.md,license.txt,.tool-versions}",
    ],
    excludes: [],
    includeVersion: false,
    customInstruction:
      "The text below contains the DOCUMENTATION and architectural guidelines of the project.",
    default: false,
  },
};

/**
 * Loads the export configuration from an external JSONC file
 * (e.g., `export.jsonc` or `export.json`).
 *
 * If the file is not found, execution is interrupted with an example message.
 *
 * @param configPath Optional path to the configuration file
 * @param baseDir Base directory for relative file resolution
 * @returns Loaded export configurations with modes and global options
 */
export async function loadExportConfig(
  configPath?: string,
  baseDir: string = ".",
): Promise<ExportConfigResult> {
  const parsed = await loadConfig<ExportConfigFile>(
    "export",
    configPath,
    baseDir,
  );

  if (!parsed) {
    throw new Error(`❌ Configuration file "export.jsonc" not found in the project root.
BuildIt now requires an explicit declaration of export modes.

Minimum "export.jsonc" file example:
{
  "modes": {
    "src": {
      "outputFile": "snapshots/src.md",
      "includes": ["src/**/*.ts"]
    }
  }
}`);
  }

  if (
    "modes" in parsed &&
    typeof (parsed as ExportConfigFile).modes === "object"
  ) {
    const rootProject = (parsed as ExportConfigFile).project;
    const rootHeader = (parsed as ExportConfigFile).header;
    const rootDefineVersionString = (parsed as ExportConfigFile).defineVersionString;
    const modes = (parsed as ExportConfigFile).modes;

    if (rootProject !== undefined || rootHeader !== undefined) {
      for (const [modeKey, modeConfig,] of Object.entries(modes,)) {
        modes[modeKey] = {
          ...(rootProject !== undefined && modeConfig.project === undefined
            ? { project: rootProject, }
            : {}),
          ...(rootHeader !== undefined &&
              modeConfig.header === undefined
            ? { header: rootHeader, }
            : {}),
          ...modeConfig,
        };
      }
    }

    return {
      modes: modes,
      project: rootProject,
      header: rootHeader,
      defineVersionString: rootDefineVersionString,
    };
  }

  throw new Error(`❌ Key "modes" not found in the export configuration file.`);
}
