/// <reference lib="deno.ns" />

/**
 * @file esbuild.ts
 * @description CLI runner for the native esbuild build orchestrator.
 * Delegates execution to the @vanaware/buildit library
 * and loads declarative configurations from esbuild.jsonc.
 */

import { esBuildCli, } from "../packages/utils/src/esbuild/cli.ts";

if (import.meta.main) {
  const cli = esBuildCli();
  await cli.parse(Deno.args,);
}
