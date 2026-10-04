/**
 * @module @vanaware/buildit/version/tag/engine
 * @description Engine for automated git tag creation and publication based on deno.json[c] version.
 */

import {
  findDenoFile,
  readProjectVersion,
  sanitizeVersion,
} from "../../tools/version.ts";
import { sanitizeVersionFile, } from "../sanitize/engine.ts";
import { runGit, } from "../../tools/git.ts";
import {
  generateChangelogContent,
  updateChangelogFile,
  updateReadmeChangelog,
} from "./changelog.ts";
import type {
  TagVersionOptions,
  TagVersionResult,
} from "../../tools/interfaces.ts";

/**
 * Creates and publishes a git tag based on the deno.json[c] version (vMAJOR.MINOR).
 *
 * @param options Tag configuration options
 * @returns Result of the operation
 *
 * @example
 * ```typescript
 * const res = await tagVersionEngine({ sanitize: true });
 * console.log(res.tagName); // "v0.3"
 * ```
 */
export async function tagVersionEngine(
  options: TagVersionOptions = {},
): Promise<TagVersionResult> {
  const baseDir = options.baseDir ?? ".";
  const dryRun = options.dryRun ?? false;
  const silent = options.silent ?? false;

  let targetFile = options.file;
  if (!targetFile) {
    const found = findDenoFile(baseDir,);
    if (!found) {
      throw new Error(`❌ deno.json[c] not found starting from ${baseDir}`,);
    }
    targetFile = found;
  }

  // Sanitize on disk if requested
  if (options.sanitize) {
    if (!silent) {
      console.log(`🧼 Sanitizing ${targetFile} before commit...`,);
    }
    await sanitizeVersionFile({
      filePath: targetFile,
      baseDir,
      silent,
    },);
  }

  // Extract and sanitize version in memory
  const rawVersion = await readProjectVersion(targetFile, baseDir,);
  if (!rawVersion) {
    throw new Error(`❌ "version" field missing in ${targetFile}`,);
  }

  const sanitizedVersion = sanitizeVersion(rawVersion,);
  const [major = "0", minor = "0",] = sanitizedVersion.split(".",);
  const tagName = `v${major}.${minor}`;
  const message = options.message || `Version ${tagName}`;

  // Changelog generation if requested
  let changelogContent = "";
  if (options.changelog && !dryRun) {
    if (!silent) {
      console.log(`📝 Generating changelog for ${tagName}...`,);
    }
    changelogContent = await generateChangelogContent(tagName, baseDir,);
    await updateChangelogFile(changelogContent, baseDir,);
    if (options.updateReadme) {
      await updateReadmeChangelog(changelogContent, baseDir,);
    }
  }

  if (!silent) {
    console.log(
      "============================================================",
    );
    console.log("🚀 STARTING TAG VERSION BUMP",);
    console.log(
      "============================================================",
    );
    console.log(`📌 Original version:   ${rawVersion}`,);
    console.log(`🧼 Sanitized version:  ${sanitizedVersion}`,);
    console.log(`🏷️  Target tag:         ${tagName}`,);
    console.log(`📝 Commit message:     ${message}`,);
    if (dryRun) {
      console.log("🔍 DRY-RUN MODE: No git changes will be persisted.",);
    }
    console.log(
      "============================================================",
    );
  }

  // Sanity check: git repository?
  const isGit = await runGit(["rev-parse", "--is-inside-work-tree",], baseDir,);
  if (!isGit.success) {
    if (dryRun) {
      if (!silent) {
        console.warn(
          "⚠️ Warning: Directory is not an active git repository (dry-run proceeds).",
        );
      }
      return {
        tagName,
        rawVersion,
        sanitizedVersion,
        message,
        committed: false,
        tagged: false,
      };
    }
    throw new Error("❌ Not inside a git repository.",);
  }

  if (dryRun) {
    if (!silent) {
      console.log(`\n📦 [Dry-Run] 1/3 - Would simulate git add -A, commit and push`,);
      console.log(
        `🧹 [Dry-Run] 2/3 - Would simulate cleaning old tag (${tagName})`,
      );
      console.log(
        `🏷️  [Dry-Run] 3/3 - Would simulate creation and push of ${tagName}`,
      );
      console.log("\n✅ [Dry-Run] Successfully completed.",);
      console.log(
        "============================================================",
      );
    }
    return {
      tagName,
      rawVersion,
      sanitizedVersion,
      message,
      committed: false,
      tagged: false,
    };
  }

  // 1/3 - Bundling and sending source code
  if (!silent) {
    console.log("\n📦 1/3 - Bundling and sending source code...",);
  }
  await runGit(["add", "-A",], baseDir,);

  const diffCached = await runGit(["diff", "--cached", "--quiet",], baseDir,);
  let committed = false;
  if (diffCached.code !== 0) {
    const commitResult = await runGit(["commit", "-m", message,], baseDir,);
    if (!commitResult.success) {
      throw new Error(`❌ Git commit failed: ${commitResult.stderr}`,);
    }
    committed = true;
  } else {
    if (!silent) {
      console.log("ℹ️  Nothing to commit.",);
    }
  }

  const pushResult = await runGit(["push",], baseDir,);
  if (!pushResult.success && !silent) {
    console.warn(
      `⚠️ Warning on code push (remote might not be configured): ${pushResult.stderr}`,
    );
  }

  // 2/3 - Cleaning old tag
  if (!silent) {
    console.log(`\n🧹 2/3 - Cleaning old tag (${tagName})...`,);
  }
  await runGit(["push", "origin", "--delete", tagName,], baseDir,);
  await runGit(["tag", "-d", tagName,], baseDir,);

  // 3/3 - Publishing new tag
  if (!silent) {
    console.log("\n🏷️  3/3 - Publishing new tag...",);
  }
  const tagCreate = await runGit([
    "tag",
    "-a",
    "-m",
    `Version ${tagName}`,
    tagName,
  ], baseDir,);
  if (!tagCreate.success) {
    throw new Error(`❌ Failed to create git tag: ${tagCreate.stderr}`,);
  }

  const tagPush = await runGit(
    ["push", "--force", "origin", tagName,],
    baseDir,
  );
  if (!tagPush.success && !silent) {
    console.warn(
      `⚠️ Warning on tag origin push ${tagName}: ${tagPush.stderr}`,
    );
  }

  if (!silent) {
    console.log("\n✅ NEW TAG ADDED SUCCESSFULLY!",);
    console.log("Track progress in the Actions tab of your repository.",);
    console.log(
      "============================================================",
    );
  }

  return {
    tagName,
    rawVersion,
    sanitizedVersion,
    message,
    committed,
    tagged: true,
  };
}
