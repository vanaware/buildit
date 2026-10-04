import { copy, emptyDir, ensureDir, expandGlob, walk, } from "@std/fs";
import {
  basename,
  dirname,
  globToRegExp,
  isAbsolute,
  join,
  relative,
} from "@std/path";

import type {
  CleanConfig,
  CopyFileConfig,
  DenoBundleTargetConfig,
  TargetConfig,
  WatchTargetConfig,
} from "./interfaces.ts";

// ============================================================================
// 🛡️ PATH AND GLOB VALIDATION (pure, testable)
// ============================================================================
/**
 * Checks if a path is safe (prevents path traversal and absolute paths).
 * @param cleanPath Path to be checked
 * @returns True if safe
 */
export function isSafePath(cleanPath: string,): boolean {
  if (cleanPath.includes("..",)) return false;
  if (isAbsolute(cleanPath,)) return false;
  return true;
}

/**
 * Resolves a relative path by adding baseDir if provided and not an absolute path.
 *
 * @param pathStr Path to be resolved
 * @param baseDir General base directory
 * @returns Resolved path with baseDir
 */
export function resolveWithBase(
  pathStr: string | undefined,
  baseDir: string = ".",
): string | undefined {
  if (!pathStr) return undefined;
  if (isAbsolute(pathStr,) || baseDir === "." || !baseDir) return pathStr;
  return join(baseDir, pathStr,);
}

/**
 * Tests if a relative path matches any of the provided glob patterns.
 *
 * @param path Relative path to be tested
 * @param patterns List of glob patterns (supports brace expansion and globstar)
 * @returns True if the path matches at least one pattern
 */
export function matchesGlobs(path: string, patterns: string[],): boolean {
  const normalizedPath = path.replace(/\\/g, "/",);
  for (const pattern of patterns) {
    try {
      const reg = globToRegExp(pattern, {
        globstar: true,
        caseInsensitive: true,
      },);
      if (reg.test(normalizedPath,) || reg.test(path,)) {
        return true;
      }
    } catch {
      // Ignore invalid pattern
    }
  }
  return false;
}

// ============================================================================
// 📍 OUTPUT PATHS RESOLUTION (outfile relative to distdir)
// ============================================================================
/**
 * Resolves output paths (outfile/outdir) based on configuration.
 *
 * Rules:
 * 1. If 'outfile' and 'distdir' exist: outfile is RELATIVE to distdir → join(distdir, outfile)
 * 2. If only 'outfile' exists (no distdir): outfile is ABSOLUTE
 * 3. If only 'distdir' exists (no outfile): distdir is used as outdir
 * 4. If none exists: returns empty object (should not happen if validateTargetConfig was called)
 *
 * @returns Object with resolved 'outfile' or 'outdir' (never both)
 */
export function resolveOutputPaths(
  config: TargetConfig | DenoBundleTargetConfig,
): { outfile?: string; outdir?: string } {
  if (config.outfile) {
    if (config.distdir) {
      // outfile relative to distdir
      return { outfile: join(config.distdir, config.outfile,), };
    }
    // absolute outfile (no distdir)
    return { outfile: config.outfile, };
  }
  // No outfile, use distdir as outdir
  if (config.distdir) {
    return { outdir: config.distdir, };
  }
  // Neither outfile nor distdir (should not get here if validateTargetConfig was called)
  return {};
}

// ============================================================================
// 🎯 ENTRYPOINTS RESOLUTION (relative to srcdir when available)
// ============================================================================
/**
 * Resolves entrypoints relative to srcdir (if available) and validates their existence on disk.
 * Throws a clear and educational error if any file is not found.
 *
 * If srcdir is not configured, treats all entrypoints as absolute.
 */
export function resolveEntryPoints(
  srcdir: string | undefined,
  entryPoints: string[],
): string[] {
  return entryPoints.map((entry,) => {
    let resolvedPath: string;

    if (srcdir && !isAbsolute(entry,)) {
      // srcdir exists and entry is relative → perform join
      resolvedPath = join(srcdir, entry,);
    } else {
      // srcdir doesn't exist OR entry is already absolute → use as is
      resolvedPath = entry;
    }

    try {
      Deno.statSync(resolvedPath,);
    } catch {
      throw new Error(
        `❌ Entrypoint not found at: "${resolvedPath}"\n` +
          `   Configured source: "${entry}"\n` +
          (srcdir
            ? `   Check if the path is correct relative to srcdir: "${srcdir}".`
            : `   Check if the absolute path is correct.`),
      );
    }

    return resolvedPath;
  },);
}

/**
 * Ensures the parent directory of a file exists.
 * @param filePath Path of the file
 */
export async function ensureDirForFile(filePath: string,): Promise<void> {
  const dir = dirname(filePath,);
  if (dir && dir !== ".") {
    await ensureDir(dir,);
  }
}

// ============================================================================
// 📂 FILESYSTEM FUNCTIONS
// ============================================================================
/**
 * Cleans the directories/files configured in the target.
 * Supports globs and brace expansion through { includes, excludes } or path array.
 *
 * Rules:
 * 0. Includes and excludes are always relative to distdir. No file above distdir can be deleted.
 * 1. To empty everything in distdir, use includes: ["*"] (or legacy ["."]).
 *
 * @param distDir Output directory
 * @param cleanConfig Cleanup configuration ({ includes, excludes }) or path list
 */
export async function cleanTarget(
  distDir: string,
  cleanConfig?: CleanConfig | string[],
): Promise<void> {
  if (!cleanConfig || !distDir) return;
  try {
    const stat = await Deno.stat(distDir,);
    if (!stat.isDirectory) return;
  } catch {
    // Output directory does not yet exist on disk
    return;
  }

  // Normalize CleanConfig
  const config: CleanConfig = Array.isArray(cleanConfig,)
    ? { includes: cleanConfig, }
    : cleanConfig;

  if (!config || !config.includes || config.includes.length === 0) return;

  console.log(`🧹 Cleaning at ${distDir}...`,);
  const includes = config.includes;
  const excludes = config.excludes ?? [];

  // Optimization: If includes is ["*"] and excludes empty, empty distDir directly
  if (
    includes.length === 1 &&
    includes[0] === "*" &&
    excludes.length === 0
  ) {
    try {
      await emptyDir(distDir,);
      console.log(`   ✅ Directory emptied: ${distDir}`,);
      return;
    } catch (error) {
      console.warn(`   ⚠️ Failed to empty ${distDir}:`, error,);
      return;
    }
  }

  // Cleanup via globs / brace expansion
  for (const pattern of includes) {
    // Direct protection against paths with traversal or absolute in pattern
    if (!isSafePath(pattern,)) {
      console.warn(
        `   ⚠️ Dangerous path ignored (traversal/absolute): "${pattern}"`,
      );
      continue;
    }

    try {
      for await (
        const entry of expandGlob(pattern, {
          root: distDir,
          exclude: excludes,
          includeDirs: true,
        },)
      ) {
        const rel = relative(distDir, entry.path,).replace(/\\/g, "/",);

        // 🔒 Rule 0: Strict protection against path traversal / level above distdir
        if (
          rel.startsWith("..",) || isAbsolute(rel,) || rel === "" || rel === "."
        ) {
          console.warn(
            `   ⚠️ Dangerous path ignored (outside distdir): "${entry.path}"`,
          );
          continue;
        }

        // Check excludes
        if (excludes.length > 0 && matchesGlobs(rel, excludes,)) {
          continue;
        }

        try {
          await Deno.remove(entry.path, { recursive: true, },);
          console.log(`   ✅ Removed: ${rel}`,);
        } catch {
          // might have been removed recursively by parent folder already
        }
      }
    } catch (err) {
      console.warn(
        `   ⚠️ Error evaluating cleanup with pattern '${pattern}':`,
        err,
      );
    }
  }
}

/**
 * Lists all generated assets in distdir for Service Worker cache.
 * @param distDir Output directory
 * @param excludeFiles List of files to ignore
 * @returns List of relative paths
 */
export async function listAssetsForCache(
  distDir: string,
  excludeFiles: string[] = [],
): Promise<string[]> {
  // 🔥 CORRECTION: Check if distDir was provided before walking
  if (!distDir) {
    console.warn(
      `⚠️ 'listAssetsForCache' called without 'distDir'. Returning empty array.`,
    );
    return [];
  }

  const assets: string[] = [];
  const exclude = new Set([
    ...excludeFiles,
    "service-worker.js",
    "serviceworker.js",
    "serviceWorker.js",
    "sw.js",
  ],);
  for await (const entry of walk(distDir, { includeDirs: false, },)) {
    if (
      !entry.name.endsWith(".map",) &&
      !entry.name.endsWith("metafile.json",) &&
      !exclude.has(entry.name,)
    ) {
      let webPath = entry.path.replace(distDir, "",).replace(/\\/g, "/",);
      webPath = webPath.startsWith("/",) ? "." + webPath : "./" + webPath;
      assets.push(webPath,);
    }
  }
  return assets;
}

/**
 * Copies static files to distdir following copyFiles rules.
 *
 * Rules:
 * 0. item.basedir will be joined with generalBaseDir
 * 1. If basedir provided, includes and excludes are relative to basedir and directory tree is preserved
 * 2. If basedir provided and includes is missing, empty or "*", copies everything from basedir, respecting excludes
 * 3. If basedir missing, includes and excludes are relative to generalBaseDir and tree is NOT preserved (files copied directly to distdir)
 * 4. copyFiles is an array
 * 5. index.html is copied using this configuration
 * 6. if the copied file is manifest.json, continues version injection; if index.html, reports in console.log
 *
 * @param copyFiles Copy configuration list
 * @param distDir Final resolved output directory
 * @param appVersion Application version for manifest.json injection
 * @param generalBaseDir Execution general base directory (default ".")
 */
export async function copyTargetFiles(
  copyFiles: CopyFileConfig[] | undefined,
  distDir: string,
  appVersion: string,
  generalBaseDir: string = ".",
): Promise<void> {
  if (!copyFiles || copyFiles.length === 0) return;
  if (!distDir) {
    console.warn(
      `⚠️ 'copyFiles' configured but 'distdir' missing. Skipping copy.`,
    );
    return;
  }

  await ensureDir(distDir,);

  for (const item of copyFiles) {
    const hasItemBase = typeof item.basedir === "string" &&
      item.basedir.trim().length > 0;
    // 0. Perform join of this basedir with the "general basedir"
    const effectiveBaseDir = hasItemBase
      ? (generalBaseDir && generalBaseDir !== "." && !isAbsolute(item.basedir!,)
        ? join(generalBaseDir, item.basedir!,)
        : item.basedir!)
      : (generalBaseDir ?? ".");

    if (hasItemBase) {
      // 1. if basedir provided, includes and excludes are relative to basedir and tree is preserved
      // 2. if basedir provided and includes is missing, empty or "*", copies everything from basedir respecting excludes
      const isAll = !item.includes ||
        item.includes.length === 0 ||
        (item.includes.length === 1 && item.includes[0] === "*");

      const patterns = isAll ? ["**/*",] : item.includes!;

      try {
        const stat = await Deno.stat(effectiveBaseDir,);
        if (!stat.isDirectory) {
          console.warn(
            `⚠️ '${effectiveBaseDir}' is not a directory, skipping copy.`,
          );
          continue;
        }
      } catch {
        console.warn(
          `⚠️ Folder ${effectiveBaseDir} not found, skipping copy.`,
        );
        continue;
      }

      for (const pattern of patterns) {
        try {
          for await (
            const entry of expandGlob(pattern, {
              root: effectiveBaseDir,
              exclude: item.excludes,
              includeDirs: false,
            },)
          ) {
            if (entry.isFile) {
              const relPath = relative(effectiveBaseDir, entry.path,).replace(
                /\\/g,
                "/",
              );

              if (item.excludes && item.excludes.length > 0) {
                if (matchesGlobs(relPath, item.excludes,)) {
                  continue;
                }
              }

              const destPath = join(distDir, relPath,);
              await ensureDirForFile(destPath,);
              await copy(entry.path, destPath, { overwrite: true, },);

              const fileName = basename(entry.path,).toLowerCase();
              if (fileName === "index.html") {
                console.log(
                  `📄 index.html copied from ${effectiveBaseDir} to ${destPath}`,
                );
              }
              if (fileName === "manifest.json") {
                try {
                  const manifestText = await Deno.readTextFile(destPath,);
                  const manifestObj = JSON.parse(manifestText,);
                  manifestObj.version = appVersion;
                  await Deno.writeTextFile(
                    destPath,
                    JSON.stringify(manifestObj, null, 2,),
                  );
                  console.log(
                    `📱 Version v${appVersion} injected into manifest.json`,
                  );
                } catch {
                  // manifest is not valid JSON
                }
              }
            }
          }
        } catch (err) {
          console.warn(
            `⚠️ Error expanding glob '${pattern}' in '${effectiveBaseDir}':`,
            err,
          );
        }
      }
      console.log(
        `📁 Files from ${effectiveBaseDir} copied to ${distDir}`,
      );
    } else {
      // 3. if basedir missing, includes and excludes are relative to "general basedir"
      // and directory tree is NOT preserved in copy and files are copied directly to distdir
      const patterns = item.includes && item.includes.length > 0
        ? item.includes
        : [];
      for (const pattern of patterns) {
        try {
          for await (
            const entry of expandGlob(pattern, {
              root: effectiveBaseDir,
              exclude: item.excludes,
              includeDirs: false,
            },)
          ) {
            if (entry.isFile) {
              const relPath = relative(effectiveBaseDir, entry.path,).replace(
                /\\/g,
                "/",
              );
              if (item.excludes && item.excludes.length > 0) {
                if (matchesGlobs(relPath, item.excludes,)) {
                  continue;
                }
              }

              const fileName = basename(entry.path,);
              const destPath = join(distDir, fileName,);
              await ensureDirForFile(destPath,);
              await copy(entry.path, destPath, { overwrite: true, },);

              if (fileName.toLowerCase() === "index.html") {
                console.log(`📄 index.html copied to ${destPath}`,);
              }
              if (fileName.toLowerCase() === "manifest.json") {
                try {
                  const manifestText = await Deno.readTextFile(destPath,);
                  const manifestObj = JSON.parse(manifestText,);
                  manifestObj.version = appVersion;
                  await Deno.writeTextFile(
                    destPath,
                    JSON.stringify(manifestObj, null, 2,),
                  );
                  console.log(
                    `📱 Version v${appVersion} injected into manifest.json`,
                  );
                } catch {
                  // manifest is not valid JSON
                }
              }
            }
          }
        } catch (err) {
          console.warn(
            `⚠️ Error expanding glob '${pattern}' in '${effectiveBaseDir}':`,
            err,
          );
        }
      }
    }
  }
}

/**
 * Copies static files to distdir using copyFiles configuration.
 * @param config Target configuration
 * @param appVersion Application version for manifest injection
 * @param generalBaseDir Execution general base directory (default ".")
 * @param distDir Optional already resolved output directory
 *
 * @example
 * ```typescript
 * await copyStaticFiles({
 *   copyFiles: [
 *     { basedir: "public", includes: ["**\/*"] },
 *     { basedir: "src", includes: ["index.html"] }
 *   ]
 * }, "1.0.0", ".", "dist");
 * ```
 */
export async function copyStaticFiles(
  config: TargetConfig | DenoBundleTargetConfig | WatchTargetConfig,
  appVersion: string,
  generalBaseDir: string = ".",
  distDir?: string,
): Promise<void> {
  const effectiveDistDir = distDir ??
    (config.distdir
      ? (generalBaseDir && generalBaseDir !== "." &&
          !isAbsolute(config.distdir,)
        ? join(generalBaseDir, config.distdir,)
        : config.distdir)
      : undefined);

  if (!effectiveDistDir) {
    if (config.copyFiles) {
      console.warn(
        `⚠️ Static files configured but 'distdir' missing. Skipping copy.`,
      );
    }
    return;
  }

  // Use copyFiles system
  if (config.copyFiles && config.copyFiles.length > 0) {
    await copyTargetFiles(
      config.copyFiles,
      effectiveDistDir,
      appVersion,
      generalBaseDir,
    );
  }
}

/**
 * Applies definition substitutions (defines) in a memory code string.
 *
 * @param text Original source code content
 * @param defines Map of identifiers and replacement values
 * @returns Code with applied substitutions
 *
 * @example
 * ```typescript
 * applyDefines("console.log(__APP_VERSION__)", { "__APP_VERSION__": '"1.0.0"' });
 * ```
 */
export function applyDefines(
  text: string,
  defines: Record<string, string>,
): string {
  let result = text;
  for (const [key, value,] of Object.entries(defines,)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&",);
    const regex = new RegExp(escapedKey, "g",);
    result = result.replace(regex, value,);
  }
  return result;
}

/**
 * Processes a list of files applying definition substitutions (defines).
 * Useful for injecting variables into post-copy static files or configuration files.
 *
 * @param filePaths List of file paths to process
 * @param defines Map of identifiers and replacement values
 * @returns List of file paths successfully processed
 *
 * @example
 * ```typescript
 * await processFilesWithDefines(["./dist/config.js"], { "__API_URL__": '"https://api.example.com"' });
 * ```
 */
export async function processFilesWithDefines(
  filePaths: string[],
  defines: Record<string, string>,
): Promise<string[]> {
  const processed: string[] = [];
  if (
    !filePaths || filePaths.length === 0 || !defines ||
    Object.keys(defines,).length === 0
  ) {
    return processed;
  }

  for (const filePath of filePaths) {
    try {
      const content = await Deno.readTextFile(filePath,);
      const updated = applyDefines(content, defines,);
      if (content !== updated) {
        await Deno.writeTextFile(filePath, updated,);
        processed.push(filePath,);
      }
    } catch (err) {
      console.warn(
        `⚠️ Failed to process defines in file '${filePath}':`,
        err,
      );
    }
  }

  return processed;
}

/**
 * Searches for deno.json or deno.jsonc climbing the directory tree.
 * The search stops upon finding the file or reaching a project root marker (e.g., .git).
 *
 * @param startDir Initial directory for search (default: CWD)
 * @returns Absolute path of the first one found, or null.
 */
export function findDenoConfig(startDir?: string,): string | null {
  let currentDir: string;
  try {
    currentDir = startDir
      ? (isAbsolute(startDir,) ? startDir : Deno.realPathSync(startDir,))
      : Deno.cwd();
  } catch {
    return null;
  }

  const candidates = ["deno.json", "deno.jsonc",];

  while (true) {
    // 1. Try to find candidates in the current directory
    for (const name of candidates) {
      const fullPath = join(currentDir, name,);
      try {
        const stat = Deno.statSync(fullPath,);
        if (stat.isFile) return fullPath;
      } catch (err) {
        if (err instanceof Deno.errors.NotFound) continue;
        if (err instanceof Deno.errors.PermissionDenied) continue;
        throw err;
      }
    }

    // 2. Check project root markers to stop climbing
    try {
      const gitDir = join(currentDir, ".git",);
      const stat = Deno.statSync(gitDir,);
      if (stat.isDirectory) break;
    } catch {
      // continue climbing
    }

    // 3. Climb one level
    const parentDir = dirname(currentDir,);
    if (parentDir === currentDir || currentDir === "/") break;
    currentDir = parentDir;
  }

  return null;
}
