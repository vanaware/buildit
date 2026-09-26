/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

/**
 * @file build.ts
 * @description CLI do orquestrador de build baseado em Deno.bundle (denobuild).
 * Delega a execução para a biblioteca @vanaware/buildit
 * e carrega as configurações declarativas de denobuild.jsonc.
 */

import { denoBuildCli, } from "./packages/utils/src/denobuild/cli.ts";

if (import.meta.main) {
  const cli = denoBuildCli();
  await cli.parse(Deno.args,);
}
