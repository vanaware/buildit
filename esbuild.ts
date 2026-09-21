/// <reference lib="deno.ns" />

/**
 * @file esbuild.ts
 * @description CLI do orquestrador de build baseado em esbuild nativo.
 * Delega a execução para a biblioteca @vanaware/buildit/build
 * e carrega as configurações declarativas de esbuild.jsonc.
 */

import { runEsbuildCli, } from "@vanaware/buildit/build";

if (import.meta.main) {
  await runEsbuildCli(Deno.args, "esbuild.jsonc",);
}
