/// <reference lib="deno.ns" />

/**
 * @file tag-version.ts
 * @description CLI runner for creating and publishing git tags based on deno.json[c] version.
 * Generates tags in vMAJOR.MINOR format and pushes to remote repository.
 */

import { tagVersionCli, } from "../packages/utils/src/version/tag/cli.ts";

if (import.meta.main) {
  const cli = tagVersionCli();
  await cli.parse(Deno.args,);
}
