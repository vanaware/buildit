/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

/**
 * @file build.ts
 * @description CLI do orquestrador de build baseado em Deno.bundle (denobuild).
 * Delega a execução para a biblioteca @vanaware/buildit/denobuild
 * e carrega as configurações declarativas de denobuild.jsonc.
 */

import { runDenoBuildCli, } from "@vanaware/buildit/denobuild";

if (import.meta.main) {
  await runDenoBuildCli(Deno.args, "denobuild.jsonc",);
}
