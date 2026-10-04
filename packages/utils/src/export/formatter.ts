/**
 * @module @vanaware/buildit/export/formatter
 * @description Pure utility functions for path normalization, extension mapping,
 * glob pattern evaluation, and Markdown formatting with backtick protection.
 */

import { globToRegExp, } from "@std/path";
import type { ExportConfig, } from "../tools/interfaces.ts";

/**
 * Normalizes a file path for consistent comparison across operating systems.
 * - Converts Windows backslashes (\) to forward slashes (/)
 * - Converts all characters to lowercase
 *
 * @param path Relative or absolute path to be normalized
 * @returns Lowercase normalized path with forward slashes
 *
 * @example
 * ```typescript
 * normalizePath("src\\components\\App.tsx"); // "src/components/app.tsx"
 * ```
 */
export function normalizePath(path: string,): string {
  return path.replace(/\\/g, "/",).toLowerCase();
}

/**
 * Calculates the minimum number of backticks required to wrap text
 * in a markdown code block, avoiding conflicts when the content itself
 * contains consecutive backticks.
 *
 * @param text File text content
 * @returns String containing 3 or more backticks (e.g., "```", "````")
 *
 * @example
 * ```typescript
 * calculateBacktickWrapper("console.log('hi');"); // "```"
 * calculateBacktickWrapper("```markdown```"); // "````"
 * ```
 */
export function calculateBacktickWrapper(text: string,): string {
  const matches = text.match(/`+/g,);
  if (!matches) return "```";
  const largestSequence = Math.max(...matches.map((m,) => m.length),);
  const requiredSize = Math.max(3, largestSequence + 1,);
  return "`".repeat(requiredSize,);
}

/**
 * Maps file extensions to the corresponding Markdown syntax highlight language.
 *
 * @param relativePath Relative file path
 * @returns Language name for Markdown code block (e.g., "json", "bash")
 *
 * @example
 * ```typescript
 * mapExtension("deno.jsonc"); // "json"
 * mapExtension("script.sh"); // "bash"
 * ```
 */
export function mapExtension(relativePath: string,): string {
  const ext = relativePath.split(".",).pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    manifest: "json",
    jsonc: "json",
    yml: "yaml",
    sh: "bash",
    env: "properties",
  };

  if (relativePath.includes(".env",)) return "properties";

  return map[ext] || ext;
}

/**
 * Tests if a path matches any of the provided glob patterns.
 *
 * @param path Normalized relative path to be tested
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

/**
 * Determines if a given file should be included in the snapshot based on mode configuration.
 * Uses `includes` / `excludes` (globs) syntax.
 *
 * Applied Rules:
 * 1. Anti-loop protection: always excludes files inside `exports/` or `snapshots/` folders.
 * 2. If it matches any `excludes` pattern, returns `false`.
 * 3. If it matches any `includes` pattern, returns `true`.
 *
 * @param relativePath Relative file path in the repository
 * @param config Export mode configuration
 * @returns True if the file should be added to the snapshot, false otherwise
 *
 * @example
 * ```typescript
 * shouldIncludeFile("packages/ui/src/main.tsx", config); // true
 * ```
 */
export function shouldIncludeFile(
  relativePath: string,
  config: ExportConfig,
): boolean {
  const normalizedPath = normalizePath(relativePath,);

  // 🔒 Anti-loop protection: never includes generated export files
  if (
    normalizedPath.startsWith("exports/",) ||
    normalizedPath.startsWith("snapshots/",)
  ) {
    return false;
  }

  // 🌟 MODERN MODE: `includes` and `excludes` patterns (globs with brace expansion)
  if (config.excludes && config.excludes.length > 0) {
    if (matchesGlobs(relativePath, config.excludes,)) {
      return false;
    }
  }

  if (config.includes && config.includes.length > 0) {
    return matchesGlobs(relativePath, config.includes,);
  }

  return false;
}

/**
 * Generates the structured header for the Markdown snapshot containing metadata and AI guidelines.
 *
 * @param config Mode configuration
 * @param mode Mode identifier name
 * @param appVersion Current project semantic version
 * @param defineVersionString Constant identifier for version replacement (default: "__APP_VERSION__")
 * @returns Formatted Markdown header
 *
 * @example
 * ```typescript
 * const header = generateHeader(config, "ui", "0.3.1", "__APP_VERSION__");
 * ```
 */
export function generateHeader(
  config: ExportConfig,
  mode: string,
  appVersion: string,
  defineVersionString: string = "__APP_VERSION__",
): string {
  const versionDisplay = config.includeVersion ? `[v${appVersion}] ` : "";
  const targetDefine = defineVersionString || "__APP_VERSION__";

  const instruction = (config.customInstruction ?? "Project context.")
    .replaceAll(targetDefine, appVersion,);

  const project = config.project ?? "BuildIt";

  const defaultHeader =
    `> Each file starts with a title indicating its exact relative path (e.g., \`## File: src/main.ts\`).\n> Whenever suggesting changes, clearly indicate which file should be modified based on these paths and provide the complete new code for the file.`;

  const header = (config.header ?? defaultHeader).trim()
    .replaceAll(targetDefine, appVersion,);

  return `> **AI INSTRUCTION:** 
> ${instruction}
${header}

---

# Exported Context from Project ${project} ${versionDisplay}- Mode: ${mode.toUpperCase()}

Automatically generated at: ${new Date().toISOString()}

---

`;
}

/**
 * Formats an individual file with a relative path and secure Markdown code block.
 *
 * @param relativePath Relative path of the file to display
 * @param content Original file text content
 * @returns Formatted Markdown code block with separator
 *
 * @example
 * ```typescript
 * formatMarkdownFile("src/index.ts", "console.log('hi');");
 * ```
 */
export function formatMarkdownFile(
  relativePath: string,
  content: string,
): string {
  const markdownExtension = mapExtension(relativePath,);
  const backtickWrapper = calculateBacktickWrapper(content,);

  let result = `## File: \`${relativePath}\`\n\n`;
  result += `${backtickWrapper}${markdownExtension}\n`;
  result += content;
  result += `\n${backtickWrapper}\n\n---\n\n`;

  return result;
}
