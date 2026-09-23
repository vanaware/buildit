#!/usr/bin/env -S deno run -A
import { watchCli, } from "./packages/utils/src/watch/cli.ts";

if (import.meta.main) {
  const cli = watchCli();
  await cli.parse(Deno.args,);
}
