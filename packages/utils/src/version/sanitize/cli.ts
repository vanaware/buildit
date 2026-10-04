/**
 * @module @vanaware/buildit/version/sanitize/cli
 * @description CLI entry point for version sanitization via Cliffy.
 */

import { Command, } from "@cliffy/command";
import { APP_VERSION, } from "../../version.ts";
import { sanitizeVersionFile, } from "./engine.ts";

/**
 * Creates the CLI command for deno.json[c] version sanitization.
 *
 * @returns Configured Cliffy command instance
 */
export function sanitizeVersionCli(): Command<any> {
  return new Command()
    .name("sanitize-version",)
    .description(
      "Normalizes the deno.json[c] version to strict semver format (MAJOR.MINOR.PATCH)",
    )
    .version(APP_VERSION,)
    .arguments("[file:string]",)
    .option("-b, --base-dir [dir:string]", "Base directory for search", {
      default: ".",
      env: { prefix: "BUILDIT_", },
    },)
    .action(async function (options, file,): Promise<void> {
      try {
        await sanitizeVersionFile({
          filePath: file as string | undefined,
          baseDir: options.baseDir as string,
        },);
      } catch (error) {
        console.error(error instanceof Error ? error.message : error,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  const cli = sanitizeVersionCli();
  await cli.parse(Deno.args,);
}
