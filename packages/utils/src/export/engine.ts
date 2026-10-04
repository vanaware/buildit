/**
 * @module @vanaware/buildit/export/engine
 * @description Optimized directory scanning mechanism (expandGlob), filtering, and streaming of Markdown snapshots.
 */

import { expandGlob, } from "@std/fs";
import { join, relative, } from "@std/path";
import { readProjectVersion, } from "../tools/version.ts";
import {
  matchesGlobs,
  formatMarkdownFile,
  generateHeader,
  normalizePath,
} from "./formatter.ts";
import { ensureDirForFile, } from "../tools/paths.ts";
import { resolveTargetOrder, } from "../tools/targets.ts";
import type {
  ExportConfig,
  ExportOptions,
  ExportResult,
} from "../tools/interfaces.ts";

/**
 * Collects an ordered and deduplicated list of files to be included in the snapshot.
 * Uses `expandGlob` for direct optimized scanning.
 *
 * @param config Export mode configuration
 * @param baseDir Project base directory
 * @returns Array of alphabetically sorted relative paths
 */
export async function collectFilesForExport(
  config: ExportConfig,
  baseDir: string = ".",
): Promise<string[]> {
  const foundFiles = new Set<string>();

  // 🌟 MODERN MODE: Direct use of expandGlob with native brace expansion support
  if (config.includes && config.includes.length > 0) {
    for (const pattern of config.includes) {
      try {
        for await (
          const entry of expandGlob(pattern, {
            root: baseDir,
            exclude: config.excludes,
            includeDirs: false,
          },)
        ) {
          const relativePath = relative(baseDir, entry.path,).replace(
            /\\/g,
            "/",
          );
          const normalizedPath = normalizePath(relativePath,);

          // Anti-loop protection
          if (
            normalizedPath.startsWith("exports/",) ||
            normalizedPath.startsWith("snapshots/",)
          ) {
            continue;
          }

          // Extra verification of excludes
          if (config.excludes && config.excludes.length > 0) {
            if (matchesGlobs(relativePath, config.excludes,)) {
              continue;
            }
          }

          foundFiles.add(relativePath,);
        }
      } catch {
        // Ignore patterns that find no paths or have invalid syntax
      }
    }
  }

  return Array.from(foundFiles,).sort();
}

/**
 * Executes the export process for a single configured mode using disk writing streaming.
 *
 * @param mode Mode identifier name (e.g., "ui")
 * @param config Mode configuration object
 * @param options Additional execution options (version, base directory, logs)
 * @returns Detailed result containing file count and bytes written
 *
 * @example
 * ```typescript
 * const result = await exportMode("ui", config, { appVersion: "0.3.1" });
 * console.log(`Exported ${result.files} files to ${result.outputFile}`);
 * ```
 */
export async function exportMode(
  mode: string,
  config: ExportConfig,
  options?: {
    appVersion?: string;
    baseDir?: string;
    silent?: boolean;
    denoJsoncPath?: string;
    defineVersionString?: string;
  },
): Promise<ExportResult> {
  const baseDir = options?.baseDir ?? ".";
  const appVersion = options?.appVersion ??
    await readProjectVersion(options?.denoJsoncPath, baseDir,);
  const silent = options?.silent ?? false;
  const defineVersionString = options?.defineVersionString ?? "__APP_VERSION__";
  const versionDisplay = config.includeVersion ? `[v${appVersion}] ` : "";

  if (!silent) {
    console.log(`\n${"=".repeat(60,)}`,);
    console.log(`📦 EXPORTING MODE: ${mode.toUpperCase()} ${versionDisplay}`,);
    console.log(`${"=".repeat(60,)}`,);
    console.log(`📄 Output file: ${config.outputFile}`,);
    if (config.includes) {
      console.log(`🎯 Inclusion patterns: ${config.includes.join(", ",)}`,);
    }
  }

  // 1. Collect files in an optimized way via expandGlob
  const filesToProcess = await collectFilesForExport(
    config,
    baseDir,
  );

  // 2. Ensure destination directory exists before writing
  const outputPath = join(baseDir, config.outputFile,);
  await ensureDirForFile(outputPath,);

  // 3. Initialize disk writing stream (O(1) memory usage)
  const file = await Deno.open(outputPath, {
    write: true,
    create: true,
    truncate: true,
  },);
  const writer = file.writable.getWriter();
  const encoder = new TextEncoder();

  let bytesWritten = 0;
  let includedFiles = 0;

  try {
    // Write header
    const header = generateHeader(config, mode, appVersion, defineVersionString,);
    const headerChunk = encoder.encode(header,);
    await writer.write(headerChunk,);
    bytesWritten += headerChunk.byteLength;

    // Process and write each file individually in the stream
    for (const relativePath of filesToProcess) {
      try {
        const fullPath = join(baseDir, relativePath,);
        const fileContent = await Deno.readTextFile(fullPath,);
        const markdownBlock = formatMarkdownFile(
          relativePath,
          fileContent,
        );
        const blockChunk = encoder.encode(markdownBlock,);

        await writer.write(blockChunk,);
        bytesWritten += blockChunk.byteLength;
        includedFiles++;

        if (!silent) {
          console.log(`   ✅ Included: ${relativePath}`,);
        }
      } catch (error) {
        if (!silent && error instanceof Error) {
          console.error(`   ❌ Error reading ${relativePath}:`, error.message,);
        }
      }
    }
  } finally {
    await writer.close();
  }

  if (!silent) {
    console.log(
      `\n✨ Mode ${mode.toUpperCase()} completed: ${includedFiles} files exported to ${config.outputFile} (${bytesWritten} bytes)`,
    );
  }

  return {
    mode,
    files: includedFiles,
    outputFile: config.outputFile,
    bytes: bytesWritten,
  };
}

/**
 * Programmatically executes the full export flow with support for multiple modes.
 * Accepts a mode configuration object directly in memory or an ExportOptions object.
 *
 * @param options Full execution options
 * @returns List of results obtained for each processed mode
 *
 * @example
 * ```typescript
 * // Passing configuration directly in memory:
 * const results = await exportEngine({
 *   config: {
 *     ui: { outputFile: "snapshots/ui.md", includes: ["packages/ui/src/*.ts"] }
 *   }
 * });
 * ```
 */
export async function exportEngine(
  options: ExportOptions,
): Promise<ExportResult[]> {
  const configs = options.config;
  const baseDir = options.baseDir ?? ".";
  const modesToExecute = resolveTargetOrder(configs, options.modes,);

  const appVersion = options.appVersion ??
    await readProjectVersion(options.denoJsoncPath, baseDir,);

  const results: ExportResult[] = [];

  for (const mode of modesToExecute) {
    const config = configs[mode];
    if (config) {
      const res = await exportMode(mode, config, {
        baseDir,
        appVersion: appVersion,
        silent: options.silent,
        denoJsoncPath: options.denoJsoncPath,
        defineVersionString: options.defineVersionString,
      },);
      results.push(res,);
    }
  }

  return results;
}
