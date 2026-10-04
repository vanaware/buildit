/// <reference lib="deno.ns" />

/**
 * @file export.ts
 * @description CLI runner for AI context consolidation in the BuildIt project.
 * Delegates execution and rules to the @vanaware/buildit library
 * and loads declarative configurations from export.jsonc.
 */

import { exportCli, } from "../packages/utils/src/export/cli.ts";

if (import.meta.main) {
  const cli = exportCli();
  await cli.parse(Deno.args,);
}
