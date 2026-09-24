/// <reference lib="deno.ns" />

/**
 * @file tag-version.ts
 * @description CLI para criação e publicação de tag git baseada na versão do deno.json[c].
 * Gera tags no formato vMAJOR.MINOR e publica no repositório remoto.
 */

import { tagVersionCli } from "./packages/utils/src/version/tag/cli.ts";

if (import.meta.main) {
  const cli = tagVersionCli();
  await cli.parse(Deno.args);
}
