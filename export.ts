/// <reference lib="deno.ns" />

/**
 * @file export.ts
 * @description CLI de consolidação de contexto para IAs no projeto BuildIt.
 * Delega a execução e regras para a biblioteca @vanaware/buildit
 * e carrega as configurações declarativas de export.jsonc.
 */

import { exportCli, } from "./packages/utils/src/export/cli.ts";

if (import.meta.main) {
  const cli = exportCli();
  await cli.parse(Deno.args,);
}
