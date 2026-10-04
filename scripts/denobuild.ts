/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

/**
 * @file denobuild.ts
 * @description CLI runner for the build orchestrator based on native Deno.bundle (denobuild).
 * Delegates execution to the @vanaware/buildit library
 * and loads declarative configurations from denobuild.jsonc.
 */

import { denoBuildCli, } from "../packages/utils/src/denobuild/cli.ts";

if (import.meta.main) {
  const cli = denoBuildCli();
  await cli.parse(Deno.args,);
}
