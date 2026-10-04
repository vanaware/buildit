/// <reference lib="deno.ns" />

/**
 * @file sanitize-version.ts
 * @description CLI runner for semantic version sanitization in deno.json[c].
 * Normalizes the "version" field to strict semver format (MAJOR.MINOR.PATCH).
 */

import { sanitizeVersionCli, } from "../packages/utils/src/version/sanitize/cli.ts";

if (import.meta.main) {
  const cli = sanitizeVersionCli();
  await cli.parse(Deno.args,);
}
