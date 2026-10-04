/**
 * @module @vanaware/buildit/version/tag/changelog
 * @description Utilities for automated changelog generation based on git commits.
 */

import { join, } from "@std/path";
import { runGit, } from "../../tools/git.ts";

/**
 * Gets the last available git tag, optionally cleaning the 'v' prefix.
 */
export async function getLastTag(baseDir?: string,): Promise<string | null> {
  // Try fetching tags first (ignore failures if no remote)
  await runGit(["fetch", "--tags", "--quiet",], baseDir,);

  // Try getting tags sorted by creation date
  let result = await runGit([
    "tag",
    "--sort=-creatordate",
  ], baseDir,);

  // Fallback to simple listing if sorting fails (old git)
  if (!result.success || !result.stdout) {
    result = await runGit(["tag",], baseDir,);
  }

  if (!result.success || !result.stdout) {
    return null;
  }

  const tags = result.stdout.split("\n",).filter(Boolean,);
  // In case of fallback, take the last alphabetical tag (usually v0.2 > v0.1)
  return tags[0] || null;
}

/**
 * Generates the changelog content for the new version based on commits since the last tag.
 *
 * @param tagName Name of the new tag (e.g., "v0.4")
 * @param baseDir Repository base directory
 * @returns Markdown block with changes
 */
export async function generateChangelogContent(
  tagName: string,
  baseDir?: string,
): Promise<string> {
  const lastTag = await getLastTag(baseDir,);
  const range = lastTag ? `${lastTag}..HEAD` : "HEAD";

  const logResult = await runGit([
    "log",
    "--pretty=format:%h %s",
    range,
  ], baseDir,);

  if (!logResult.success) {
    throw new Error(`❌ Failed to get git log: ${logResult.stderr}`,);
  }

  const date = new Date().toISOString().slice(0, 10,);
  const logs = logResult.stdout.trim();
  
  const formattedLogs = logs
    ? logs.split("\n",).map((line,) => `- ${line}`).join("\n",)
    : "- No relevant changes";

  return `## ${tagName} (${date})\n\n${formattedLogs}\n`;
}

/**
 * Updates the CHANGELOG.md file by prepending the new changes.
 */
export async function updateChangelogFile(
  content: string,
  baseDir: string = ".",
): Promise<void> {
  const filePath = join(baseDir, "CHANGELOG.md",);
  let existing = "";
  try {
    existing = await Deno.readTextFile(filePath,);
  } catch {
    // File does not exist, it will be created
  }

  await Deno.writeTextFile(filePath, `${content}\n${existing}`,);
}

/**
 * Updates the latest updates section in README.md.
 */
export async function updateReadmeChangelog(
  content: string,
  baseDir: string = ".",
): Promise<void> {
  const filePath = join(baseDir, "README.md",);
  let readme = "";
  try {
    readme = await Deno.readTextFile(filePath,);
  } catch {
    return; // No README, nothing to do
  }

  const summary = content
    .split("\n",)
    .slice(0, 6,)
    .join("\n",)
    .replace(/^## v\d+\.\d+.*$/m, "### 📦 Latest updates",);

  const markerStart = "<!-- START:changelog -->";
  const markerEnd = "<!-- END:changelog -->";
  const changelogSection = `${markerStart}\n${summary}\n${markerEnd}`;

  if (readme.includes(markerStart,) && readme.includes(markerEnd,)) {
    const regex = new RegExp(`${markerStart}[\\s\\S]*${markerEnd}`, "m",);
    readme = readme.replace(regex, changelogSection,);
  } else {
    readme += `\n\n## 📦 Latest Updates\n\n${changelogSection}\n`;
  }

  await Deno.writeTextFile(filePath, readme,);
}
