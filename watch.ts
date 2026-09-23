/**
 * BuildIt Watch CLI Entry Point.
 * Delegado para o utilitário @vanaware/buildit/watch.
 */
import { watchCli } from "./packages/utils/src/watch/cli.ts";

if (import.meta.main) {
  await watchCli().parse(Deno.args);
}
