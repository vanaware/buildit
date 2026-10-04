/**
 * @module @vanaware/buildit/denobuild/config
 * @description Loading external configurations from `denobuild.jsonc`.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type {
  DenoBuildConfigFile,
  DenoBuildConfigResult,
  DenoBundleGlobalConfig,
} from "../tools/interfaces.ts";

/**
 * Example configuration for the Deno.bundle engine in the BuildIt project.
 */
export const DENOBUILD_CONFIG_EXAMPLE: DenoBundleGlobalConfig = {
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
    minify: false,
    sourcemap: "linked",
    keepNames: true,
    codeSplitting: false,
    packages: "bundle",
    inlineImports: true,
  },
};

/**
 * Loads target configurations for the Deno.bundle engine from an external JSONC file
 * (e.g., `denobuild.jsonc` or `denobuild.json`).
 *
 * If the file is not found, execution is interrupted with an example message.
 *
 * @param configPath Optional path to the configuration file
 * @param baseDir Base directory for relative file resolution
 * @returns Loaded configuration with targets and global options
 */
export async function loadDenoBuildConfig(
  configPath?: string,
  baseDir: string = ".",
): Promise<DenoBuildConfigResult> {
  const parsed = await loadConfig<DenoBuildConfigFile>(
    "denobuild",
    configPath,
    baseDir,
  );

  if (!parsed) {
    throw new Error(`❌ Configuration file "denobuild.jsonc" not found in the project root.
BuildIt now requires an explicit target declaration.

Minimum "denobuild.jsonc" file example:
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

  const result: DenoBuildConfigResult = {
    targets: {},
  };

  result.versionPaths = parsed.versionPaths;
  result.forcepackagesversion = parsed.forcepackagesversion;
  result.defineVersionString = parsed.defineVersionString;

  if (parsed.targets && typeof parsed.targets === "object") {
    result.targets = parsed.targets;
  } else {
    throw new Error(`❌ Key "targets" not found in the denobuild configuration file.`);
  }

  return result;
}
