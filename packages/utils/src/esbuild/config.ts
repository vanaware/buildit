/**
 * @module @vanaware/buildit/esbuild/config
 * @description Loading external configurations from `esbuild.jsonc`.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type {
  EsbuildConfigFile,
  EsbuildConfigResult,
  GlobalTargetConfig,
} from "../tools/interfaces.ts";

/**
 * Example configuration for the esbuild engine in the BuildIt project.
 */
export const ESBUILD_CONFIG_EXAMPLE: GlobalTargetConfig = {
  ui: {
    default: true,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    copyFiles: [
      { basedir: "packages/ui/public", },
      { basedir: "packages/ui/src", includes: ["index.html",], },
    ],
    clean: {
      includes: ["*",],
    },
    entryPoints: ["main.tsx",],
    platform: "browser",
    format: "esm",
    bundle: true,
    minify: false,
    sourcemap: "linked",
    conditions: ["browser",],
    jsx: "automatic",
    jsxImportSource: "preact",
    metafile: true,
    write: true,
    legalComments: "eof",
    keepNames: true,
    splitting: false,
  },
};

/**
 * Loads target configurations for the esbuild engine from an external JSONC file
 * (e.g., `esbuild.jsonc` or `esbuild.json`).
 *
 * If the file is not found, execution is interrupted with an example message.
 *
 * @param configPath Optional path to the configuration file
 * @param baseDir Base directory for relative file resolution
 * @returns Loaded configuration with targets and global options
 */
export async function loadEsbuildConfig(
  configPath?: string,
  baseDir: string = ".",
): Promise<EsbuildConfigResult> {
  const parsed = await loadConfig<EsbuildConfigFile>(
    "esbuild",
    configPath,
    baseDir,
  );

  if (!parsed) {
    throw new Error(`❌ Configuration file "esbuild.jsonc" not found in the project root.
BuildIt now requires an explicit target declaration.

Minimum "esbuild.jsonc" file example:
{
  "targets": {
    "app": {
      "srcdir": "src",
      "distdir": "dist",
      "entryPoints": ["main.tsx"]
    }
  }
}`);
  }

  const result: EsbuildConfigResult = {
    targets: {},
  };

  result.versionPaths = parsed.versionPaths;
  result.forcepackagesversion = parsed.forcepackagesversion;
  result.defineVersionString = parsed.defineVersionString;

  if (parsed.targets && typeof parsed.targets === "object") {
    result.targets = parsed.targets;
  } else {
    throw new Error(`❌ Key "targets" not found in the esbuild configuration file.`);
  }

  return result;
}
