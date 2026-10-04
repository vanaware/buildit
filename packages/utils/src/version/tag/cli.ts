/**
 * @module @vanaware/buildit/version/tag/cli
 * @description CLI entry point for git tag publication via Cliffy.
 */

import { Command, } from "@cliffy/command";
import { APP_VERSION, } from "../../version.ts";
import { tagVersionEngine, } from "./engine.ts";

/**
 * Creates the CLI command for git tag bump and publication.
 *
 * @returns Configured Cliffy command instance
 */
export function tagVersionCli(): Command<any> {
  return new Command()
    .name("tag-version",)
    .description(
      "Creates and publishes a git tag based on the deno.json[c] version (vMAJOR.MINOR)",
    )
    .version(APP_VERSION,)
    .option("-m, --message <msg:string>", "Custom commit message",)
    .option(
      "-s, --sanitize",
      "Sanitizes the deno.json[c] file on disk before committing",
      {
        default: false,
      },
    )
    .option("-f, --file <file:string>", "Specific path to deno.json[c]",)
    .option("-b, --base-dir <dir:string>", "Base directory for search", {
      default: ".",
    },)
    .option(
      "--dry-run",
      "Simulates git operations without performing commits or pushes",
      {
        default: false,
      },
    )
    .option(
      "-c, --changelog",
      "Generates or updates the CHANGELOG.md file with changes since the last tag",
      {
        default: false,
      },
    )
    .option(
      "--update-readme",
      "Updates the latest updates section in README.md (requires --changelog)",
      {
        default: false,
      },
    )
    .action(async function (options,): Promise<void> {
      try {
        await tagVersionEngine({
          file: options.file,
          message: options.message,
          sanitize: options.sanitize,
          baseDir: options.baseDir,
          dryRun: options.dryRun,
          changelog: options.changelog,
          updateReadme: options.updateReadme,
        },);
      } catch (error) {
        console.error(error instanceof Error ? error.message : error,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  const cli = tagVersionCli();
  await cli.parse(Deno.args,);
}
