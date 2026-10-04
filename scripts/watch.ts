/**
 * BuildIt Watch CLI Entry Point.
 * Delegates execution to the @vanaware/buildit continuous watch utility.
 */
import { watchCli } from "../packages/utils/src/watch/cli.ts";

if (import.meta.main) {
  await watchCli().parse(Deno.args);
}
