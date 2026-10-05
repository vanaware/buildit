/**
 * @module scripts/docgen
 * @description Orchestrator for the Documentation Generator.
 */

import { docgenCli, } from "../packages/utils/src/docgen/cli.ts";

if (import.meta.main) {
  const cli = docgenCli();
  await cli.parse(Deno.args,);
}
