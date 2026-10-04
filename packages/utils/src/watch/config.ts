/**
 * @module @vanaware/buildit/watch/config
 * @description Loading and validation of configurations for the continuous development mode (Watch).
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type {
  WatchConfigFile,
  WatchConfigResult,
  WatchGlobalConfig,
} from "../tools/interfaces.ts";

/** Example configurations for watch mode */
export const WATCH_CONFIG_EXAMPLE: WatchGlobalConfig = {
  ui: {
    default: true,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    copyFiles: [
      { basedir: "packages/ui/public", },
      { basedir: "packages/ui/src", includes: ["index.html",], },
    ],
    entryPoints: ["main.tsx",],
    platform: "browser",
    format: "esm",
    bundle: true,
    minify: false,
    sourcemap: "inline",
    conditions: ["browser",],
    jsx: "automatic",
    jsxImportSource: "preact",
    write: true,
    legalComments: "eof",
    outfile: "app.js",
  },
};

/**
 * Loads and validates the watch configuration file (watch.jsonc or watch.json).
 *
 * @param configPath Optional explicit path to the file
 * @param baseDir Project base directory (default: ".")
 * @returns Resolved watch target configuration
 */
export async function loadWatchConfig(
  configPath?: string,
  baseDir: string = ".",
): Promise<WatchConfigResult> {
  const parsed = await loadConfig<WatchConfigFile | WatchGlobalConfig>(
    "watch",
    configPath,
    baseDir,
  );

  if (!parsed) {
    throw new Error(`❌ Configuration file "watch.jsonc" not found in the project root.
BuildIt now requires an explicit target declaration for watch mode.

Minimum "watch.jsonc" file example:
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

  let targets: WatchGlobalConfig = {};

  let defineVersionString: string | undefined;
  let versionPaths: string[] | undefined;
  let forcepackagesversion: boolean | undefined;

  if (
    "targets" in parsed && parsed.targets && typeof parsed.targets === "object"
  ) {
    targets = parsed.targets as WatchGlobalConfig;
    defineVersionString = (parsed as WatchConfigFile).defineVersionString;
    versionPaths = (parsed as WatchConfigFile).versionPaths;
    forcepackagesversion = (parsed as WatchConfigFile).forcepackagesversion;
  } else if (!("targets" in parsed) && Object.keys(parsed,).length > 0) {
    // Tries to treat the root object as the targets
    targets = parsed as WatchGlobalConfig;
  }

  if (Object.keys(targets,).length === 0) {
    throw new Error(`❌ No target configuration found in the watch configuration file.`);
  }

  return {
    targets,
    defineVersionString,
    versionPaths,
    forcepackagesversion,
  };
}
