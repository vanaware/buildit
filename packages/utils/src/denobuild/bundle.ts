/**
 * @module @vanaware/buildit/denobuild/bundle
 * @description Utility functions and option generators for the native Deno.bundle API.
 */

import {
  applyDefines,
  resolveEntryPoints,
  resolveOutputPaths,
} from "../tools/paths.ts";
import type { DenoBundleTargetConfig, } from "../tools/interfaces.ts";


/**
 * Builds the options object accepted by the `Deno.bundle` API.
 *
 * @param config Compilation target configuration
 * @returns `Deno.bundle.Options` object ready for execution
 *
 * @example
 * ```typescript
 * const options = buildBundleOptions(config);
 * ```
 */
export function buildBundleOptions(
  config: DenoBundleTargetConfig,
): Deno.bundle.Options {
  const resolvedEntryPoints = resolveEntryPoints(
    config.srcdir,
    config.entryPoints,
  );

  const { outfile, outdir, } = resolveOutputPaths(config,);

  const options: Deno.bundle.Options = {
    entrypoints: resolvedEntryPoints,
    write: config.write ?? false,
  };

  if (outfile) {
    options.outputPath = outfile;
  } else if (outdir) {
    options.outputDir = outdir;
  }

  if (config.platform !== undefined) options.platform = config.platform;
  if (config.format !== undefined) options.format = config.format;
  if (config.minify !== undefined) options.minify = config.minify;
  if (config.keepNames !== undefined) options.keepNames = config.keepNames;
  if (config.sourcemap !== undefined) options.sourcemap = config.sourcemap;
  if (config.codeSplitting !== undefined) {
    options.codeSplitting = config.codeSplitting;
  }
  if (config.inlineImports !== undefined) {
    options.inlineImports = config.inlineImports;
  }
  if (config.packages !== undefined) options.packages = config.packages;
  if (config.external !== undefined) options.external = config.external;

  // Extended options that might be supported by future Deno.bundle versions
  const extendedOptions = options as any;
  if (config.jsx !== undefined) extendedOptions.jsx = config.jsx;
  if (config.jsxFactory !== undefined) extendedOptions.jsxFactory = config.jsxFactory;
  if (config.jsxFragment !== undefined) extendedOptions.jsxFragment = config.jsxFragment;
  if (config.jsxImportSource !== undefined) {
    extendedOptions.jsxImportSource = config.jsxImportSource;
  }

  return options;
}
