/**
 * @module @vanaware/buildit/config/version
 * @description Centralized semantic version management and workspace synchronization
 * for Deno projects and snapshots.
 */

import { dirname, isAbsolute, join, } from "@std/path";
import { parse as parseJsonc, } from "@std/jsonc";

import type {
  IncrementVersionOptions,
  ParsedVersion,
  SyncWorkspacesOptions,
  VersionUpdateOptions,
} from "./interfaces.ts";

import { loadConfig, } from "./jsonc.ts";
import { findDenoConfig, } from "./paths.ts";

/**
 * Reads the project semantic version from the root deno.jsonc or deno.json file.
 *
 * @param denoJsonPath Optional path to the configuration file
 * @param baseDir Base directory if denoJsonPath is not absolute
 * @returns Read project version
 */
export async function readProjectVersion(
  denoJsonPath?: string,
  baseDir: string = ".",
): Promise<string> {
  const parsed = await loadConfig<{ version?: string }>(
    "deno",
    denoJsonPath,
    baseDir,
  );

  if (parsed?.version) {
    return parsed.version;
  }

  throw new Error(`❌ Required "version" field not found in deno.jsonc.
Necessary configuration example:
{
  "name": "@buildit/app",
  "version": "1.0.0"
}`);
}

/**
 * Synchronizes the version in a workspace directory (deno.jsonc or deno.json).
 */
export async function syncWorkspaceDir(
  wsPath: string,
  newVersion: string,
  wsRelPath: string,
): Promise<void> {
  for (const fileName of ["deno.jsonc", "deno.json",]) {
    const configPath = join(wsPath, fileName,);
    try {
      const content = await Deno.readTextFile(configPath,);
      const updated = replaceVersionInContent(content, newVersion,);
      await Deno.writeTextFile(configPath, updated,);
      console.log(`   ✅ Synchronized: ${join(wsRelPath, fileName,)}`,);
      return; // Success, stop searching in this workspace
    } catch (err) {
      if (!(err instanceof Deno.errors.NotFound)) {
        console.warn(`   ⚠️ Error synchronizing ${configPath}:`, err,);
      }
    }
  }
}

/**
 * Synchronizes the version defined in the root deno.jsonc with all configured workspaces.
 * If no version is provided in options, reads directly from the root deno.jsonc version.
 *
 * @param options Options containing baseDir, denoJsonPath, and optional version
 * @returns Version synchronized in workspaces
 */
export async function syncWorkspaces(
  options: SyncWorkspacesOptions = {},
): Promise<string> {
  const baseDir = options.baseDir ?? ".";
  const denoJsonPath = options.denoJsonPath ??
    join(baseDir, "deno.jsonc",);

  const version = options.currentVersion ?? options.version ??
    await readProjectVersion(denoJsonPath, baseDir,);

  try {
    let rootContent = "";
    let actualDenoJsonPath = denoJsonPath;
    try {
      rootContent = await Deno.readTextFile(denoJsonPath,);
    } catch {
      if (denoJsonPath.endsWith(".jsonc",)) {
        const alt = denoJsonPath.slice(0, -1,);
        rootContent = await Deno.readTextFile(alt,);
        actualDenoJsonPath = alt;
      }
    }
    const rootDir = dirname(actualDenoJsonPath,);
    const parsed = parseJsonc(rootContent,) as { workspace?: string[] };

    if (parsed.workspace && Array.isArray(parsed.workspace,)) {
      console.log(`📦 Synchronizing workspaces for v${version}...`,);
      for (const ws of parsed.workspace) {
        const wsPath = isAbsolute(ws,) ? ws : join(rootDir, ws,);
        await syncWorkspaceDir(wsPath, version, ws,);
      }
    }
  } catch (err) {
    console.warn(`⚠️ Failed to synchronize workspaces in ${denoJsonPath}:`, err,);
  }

  return version;
}

/**
 * Example paths where the version.ts file can be synchronized.
 */
export const VERSION_PATHS_EXAMPLE: string[] = [
  "packages/utils/src/version.ts",
];

/**
 * Parses a version string in major.minor.patch[#hash] format.
 *
 * @param version Version string
 * @returns ParsedVersion object with numeric major, minor, and patch
 */
export function parseVersion(version: string,): ParsedVersion {
  const trimmed = version.trim();
  if (trimmed !== version) {
    throw new Error(`❌ Version cannot have spaces: ${version}`,);
  }
  const versionWithoutHash = version.split("#",)[0] ?? "";
  if (version.includes("#",) && version.endsWith("#",)) {
    throw new Error(`❌ Invalid version format (# without hash): ${version}`,);
  }
  const parts = versionWithoutHash.split(".",);
  if (parts.length !== 3) {
    throw new Error(`❌ Invalid version format: ${version}`,);
  }
  const majorStr = parts[0];
  const minorStr = parts[1];
  const patchStr = parts[2];
  if (
    majorStr === undefined || minorStr === undefined || patchStr === undefined
  ) {
    throw new Error(`❌ Invalid version format: ${version}`,);
  }
  const major = parseInt(majorStr, 10,);
  const minor = parseInt(minorStr, 10,);
  const patch = parseInt(patchStr, 10,);
  if (isNaN(major,) || isNaN(minor,) || isNaN(patch,)) {
    throw new Error(`❌ Version contains non-numeric values: ${version}`,);
  }
  return { major, minor, patch, };
}

/**
 * Formats version components into a standardized string.
 */
export function formatVersion(
  major: number,
  minor: number,
  patch: number,
  buildHash?: string,
): string {
  const hash = buildHash ?? Date.now().toString(36,);
  return `${major}.${minor}.${patch}#${hash}`;
}

/**
 * Replaces the version in the provided text content.
 */
export function replaceVersionInContent(
  content: string,
  newVersion: string,
): string {
  return content.replace(
    /"version"\s*:\s*"[^"]*"/,
    `"version": "${newVersion}"`,
  );
}

/**
 * Generates the default template for version.ts/.js files with the custom constant.
 *
 * @param defineVersionString Constant identifier
 * @param isTypeScript Whether to generate TypeScript version (default: true)
 */
export function getVersionFileTemplate(
  defineVersionString: string = "__APP_VERSION__",
  isTypeScript: boolean = true,
): string {
  if (isTypeScript) {
    return `// Automatically generated file during build

/**
 * Current library/application version.
 * @type {string}
 */
// @ts-ignore: Identifier '${defineVersionString}' is replaced by a string literal at build time
export const APP_VERSION: string = typeof ${defineVersionString} !== "undefined"
  ? ${defineVersionString}
  : "";
`;
  } else {
    return `// Automatically generated file during build

/**
 * Current library/application version.
 * @type {string}
 */
export const APP_VERSION = typeof ${defineVersionString} !== "undefined"
  ? ${defineVersionString}
  : "";
`;
  }
}

/**
 * Ensures the existence of the version.ts file at the specified path or directory.
 * If the file already exists, it is NOT overwritten on every execution.
 * If the file does not exist, it creates the file with the template using defineVersionString.
 *
 * @param targetPathOrDir File or directory path
 * @param baseDir Optional base directory (default: ".")
 * @param defineVersionString Custom constant identifier (default: "__APP_VERSION__")
 * @returns true if the file was created, false if it already existed
 */
export async function ensureVersionFile(
  targetPathOrDir: string,
  baseDir: string = ".",
  defineVersionString: string = "__APP_VERSION__",
): Promise<boolean> {
  const resolvedPath = isAbsolute(targetPathOrDir,)
    ? targetPathOrDir
    : join(baseDir, targetPathOrDir,);

  let filePath = resolvedPath;
  if (
    !resolvedPath.endsWith(".ts",) && !resolvedPath.endsWith(".js",) &&
    !resolvedPath.endsWith(".mjs",)
  ) {
    filePath = join(resolvedPath, "version.ts",);
  }

  const isTypeScript = !filePath.endsWith(".js",) && !filePath.endsWith(".mjs",);

  try {
    const stat = await Deno.stat(filePath,);
    if (stat.isFile) {
      return false;
    }
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }

  const dir = dirname(filePath,);
  if (dir && dir !== ".") {
    try {
      await Deno.mkdir(dir, { recursive: true, },);
    } catch {
      // directory already exists or no permission
    }
  }

  await Deno.writeTextFile(
    filePath,
    getVersionFileTemplate(defineVersionString, isTypeScript,),
  );
  return true;
}

/**
 * Ensures the existence of files declared in versionPaths before build/bundle.
 * Previously checks for file existence and does not overwrite if it already exists.
 *
 * @param versionPaths List of version.ts file paths
 * @param baseDir Optional base directory (default: ".")
 * @param defineVersionString Custom constant identifier (default: "__APP_VERSION__")
 * @returns List of processed paths
 */
export async function ensureVersionFiles(
  versionPaths: string[] = [],
  baseDir: string = ".",
  defineVersionString: string = "__APP_VERSION__",
): Promise<string[]> {
  const processed: string[] = []; 

  for (const vPath of versionPaths) {
    try {
      const created = await ensureVersionFile(
        vPath,
        baseDir,
        defineVersionString,
      );
      if (created) {
        console.log(
          `📝 Version file created with template ${defineVersionString} at: ${vPath}`,
        );
      } else {
        console.log(`ℹ️ Existing version file kept: ${vPath}`,);
      }
      processed.push(vPath,);
    } catch (err) {
      console.warn(`⚠️ Warning checking/creating version at ${vPath}:`, err,);
    }
  }

  return processed;
}

/**
 * Writes or ensures the existence of the version.ts file at the specified path or directory.
 * Kept for compatibility.
 */
export async function writeVersionFile(
  targetPathOrDir: string,
  _version?: string,
): Promise<void> {
  await ensureVersionFile(targetPathOrDir,);
}

/**
 * Synchronizes project version in configuration files and code without incrementing.
 * Useful to ensure all packages and version files are aligned.
 *
 * @param options Synchronization options
 * @returns Synchronized version
 *
 * @example
 * ```typescript
 * await syncVersion({
 *   versionPaths: ["src/version.ts"],
 *   forcepackagesversion: true
 * });
 * ```
 */
export async function syncVersion(
  options: VersionUpdateOptions = {},
): Promise<string> {
  const baseDir = options.baseDir ?? ".";
  const denoJsonPath = options.denoJsonPath ??
    join(baseDir, "deno.jsonc",);
  const forcePackages = options.forcepackagesversion ?? false;
  const versionPaths = options.versionPaths ?? [];
  const defineVersionString = options.defineVersionString ?? "__APP_VERSION__";

  let finalVersion = options.currentVersion;
  if (!finalVersion) {
    finalVersion = await readProjectVersion(denoJsonPath, baseDir,);
  }

  // Synchronize workspaces if requested
  if (forcePackages) {
    await syncWorkspaces({
      baseDir,
      denoJsonPath,
      currentVersion: finalVersion,
    },);
  }

  // Ensure existence of version.ts files without overwriting if they already exist
  if (versionPaths.length > 0) {
    await ensureVersionFiles(versionPaths, baseDir, defineVersionString,);
  } else if (!forcePackages) {
    console.warn(
      `⚠️ No version paths (versionPaths) specified for synchronization.`,
    );
    console.log(`Usage example: syncVersion({ versionPaths: ["src/version.ts"] })`,);
  }

  return finalVersion;
}

/**
 * Reads the current project version (if not provided), increments the patch version (+1),
 * formats with buildHash, and writes the new version back to the root deno.jsonc.
 *
 * @param options Options containing baseDir, denoJsonPath, currentVersion, and buildHash
 * @returns New incremented version applied to the file
 *
 * @example
 * ```typescript
 * const newVersion = await incrementProjectVersion({
 *   baseDir: ".",
 *   buildHash: "abc1234",
 * });
 * ```
 */
export async function incrementProjectVersion(
  options: IncrementVersionOptions = {},
): Promise<string> {
  const baseDir = options.baseDir ?? ".";
  const denoJsonPath = options.denoJsonPath ??
    join(baseDir, "deno.jsonc",);

  let currentVer = options.currentVersion;
  if (!currentVer) {
    currentVer = await readProjectVersion(denoJsonPath, baseDir,);
  }

  const { major, minor, patch, } = parseVersion(currentVer,);
  const finalVersion = formatVersion(major, minor, patch + 1, options.buildHash,);

  // Update root deno.jsonc
  try {
    let actualDenoJsonPath = denoJsonPath;
    let rootContent = "";
    try {
      rootContent = await Deno.readTextFile(denoJsonPath,);
    } catch {
      if (denoJsonPath.endsWith(".jsonc",)) {
        const alt = denoJsonPath.slice(0, -1,);
        rootContent = await Deno.readTextFile(alt,);
        actualDenoJsonPath = alt;
      } else {
        throw new Deno.errors.NotFound(`File ${denoJsonPath} not found`);
      }
    }

    const updatedRootContent = replaceVersionInContent(
      rootContent,
      finalVersion,
    );
    await Deno.writeTextFile(actualDenoJsonPath, updatedRootContent,);
    console.log(`📈 Version incremented to: v${finalVersion}`,);
  } catch (err) {
    console.warn(`⚠️ Error updating version in ${denoJsonPath}:`, err,);
  }

  return finalVersion;
}

/**
 * Increments the patch version and synchronizes the project.
 *
 * @param options Update options
 * @returns Final applied version
 *
 * @example
 * ```typescript
 * const newVersion = await updateProjectVersion({
 *   noversion: false,
 *   buildHash: "abc1234"
 * });
 * ```
 */
export async function updateProjectVersion(
  options: VersionUpdateOptions = {},
): Promise<string> {
  const baseDir = options.baseDir ?? ".";
  const denoJsonPath = options.denoJsonPath ??
    join(baseDir, "deno.jsonc",);
  const noversion = options.noversion ?? false;

  let finalVersion = options.currentVersion;

  if (!noversion) {
    finalVersion = await incrementProjectVersion({
      baseDir,
      denoJsonPath,
      currentVersion: options.currentVersion,
      buildHash: options.buildHash,
    },);
  } else {
    if (!finalVersion) {
      finalVersion = await readProjectVersion(denoJsonPath, baseDir,);
    }
    console.log(`📌 Version kept (noversion): v${finalVersion}`,);
  }

  // Synchronize files and sub-packages
  return await syncVersion({
    ...options,
    currentVersion: finalVersion,
  },);
}

/**
 * Searches for deno.jsonc (preferred) or deno.json climbing the directory tree from startDir.
 * Unified utility delegated to paths.ts.
 *
 * @param startDir Initial directory for search (default: ".")
 * @returns Path of the found file or null if not found
 */
export function findDenoFile(startDir: string = ".",): string | null {
  return findDenoConfig(startDir,);
}

/**
 * Normalizes any version string to canonical strict semver "MAJOR.MINOR.PATCH" format.
 * Removes prefixes like "v", build metadata (+build), pre-release identifiers (-alpha),
 * and commit hash suffixes (#hash), ensuring exactly 3 numeric components.
 *
 * @param raw Original raw version string (e.g., "v1.2.3-beta+exp.sha.5114f85", "0.3.14#muesu7z0")
 * @returns Sanitized semver version (e.g., "1.2.3", "0.3.14")
 */
export function sanitizeVersion(raw: string,): string {
  if (!raw) return "0.0.0";
  // Remove non-numeric characters at the beginning (e.g., "v")
  let clean = raw.replace(/^[^0-9]+/, "",);
  // Remove suffixes starting with '-', '+', or '#'
  clean = clean.replace(/[-+#].*$/, "",);
  // Remove everything except digits and dots
  clean = clean.replace(/[^0-9.]/g, "",);
  // Remove multiple dots and dots at the ends
  clean = clean.replace(/\.+/g, ".",).replace(/^\./, "",).replace(/\.$/, "",);

  const parts = clean.split(".",);
  const ma = parts[0] && /^\d+$/.test(parts[0],) ? parts[0] : "0";
  const mi = parts[1] && /^\d+$/.test(parts[1],) ? parts[1] : "0";
  const pa = parts[2] && /^\d+$/.test(parts[2],) ? parts[2] : "0";

  return `${ma}.${mi}.${pa}`;
}
