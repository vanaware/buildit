/**
 * @module @vanaware/buildit/version/sanitize/engine
 * @description Semantic version sanitization engine for deno.json and deno.jsonc files.
 */

import {
  findDenoFile,
  readProjectVersion,
  replaceVersionInContent,
  sanitizeVersion,
} from "../../tools/version.ts";
import type {
  SanitizeVersionOptions,
  SanitizeVersionResult,
} from "../../tools/interfaces.ts";

/**
 * Normalizes the "version" field of a deno.json[c] file to strict semver format (MAJOR.MINOR.PATCH).
 * If the "version" field does not exist, injects `"version": "0.0.0"` at the beginning of the file.
 *
 * @param options Sanitization execution options
 * @returns Object with the sanitization result
 *
 * @example
 * ```typescript
 * const result = await sanitizeVersionFile({ filePath: "deno.jsonc" });
 * console.log(result.sanitizedVersion); // "0.3.14"
 * ```
 */
export async function sanitizeVersionFile(
  options: SanitizeVersionOptions = {},
): Promise<SanitizeVersionResult> {
  const baseDir = options.baseDir ?? ".";
  let targetPath = options.filePath;

  if (targetPath) {
    try {
      const stat = await Deno.stat(targetPath,);
      if (!stat.isFile) {
        throw new Error(`❌ Error: File '${targetPath}' not found.`,);
      }
    } catch {
      throw new Error(`❌ Error: File '${targetPath}' not found.`,);
    }
  } else {
    const found = findDenoFile(baseDir,);
    if (!found) {
      throw new Error(
        `❌ Error: No deno.json[c] found starting from ${baseDir}`,
      );
    }
    targetPath = found;
  }

  if (!options.silent) {
    console.log(`🔍 Searching version in: ${targetPath}`,);
  }

  let rawVersion: string | null = null;
  try {
    rawVersion = await readProjectVersion(targetPath, baseDir,);
  } catch {
    rawVersion = null;
  }
  let content = await Deno.readTextFile(targetPath,);

  if (rawVersion === null) {
    if (!options.silent) {
      console.log(
        `⚠️  No 'version' field found. Inserting "0.0.0"...`,
      );
    }
    const braceIndex = content.indexOf("{",);
    if (braceIndex === -1) {
      throw new Error(
        `❌ File ${targetPath} does not contain valid JSON/JSONC.`,
      );
    }
    content = content.slice(0, braceIndex + 1,) + '\n  "version": "0.0.0",' +
      content.slice(braceIndex + 1,);
    rawVersion = "0.0.0";
    await Deno.writeTextFile(targetPath, content,);
  }

  if (!options.silent) {
    console.log(`📌 Original version: ${rawVersion}`,);
  }

  const sanitizedVersion = sanitizeVersion(rawVersion,);
  if (!options.silent) {
    console.log(`✅ Sanitized version: ${sanitizedVersion}`,);
  }

  let updated = false;
  if (rawVersion !== sanitizedVersion) {
    const updatedContent = replaceVersionInContent(content, sanitizedVersion,);
    await Deno.writeTextFile(targetPath, updatedContent,);
    updated = true;
    if (!options.silent) {
      console.log(
        `📝 File updated: ${rawVersion} → ${sanitizedVersion}`,
      );
    }
  } else {
    if (!options.silent) {
      console.log(`✨ Already in correct semver format.`,);
    }
  }

  return {
    filePath: targetPath,
    rawVersion,
    sanitizedVersion,
    updated,
  };
}
