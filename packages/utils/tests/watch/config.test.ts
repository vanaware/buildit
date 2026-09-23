/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, } from "@std/assert";
import {
  carregarConfigWatch,
  CONFIGURACOES_WATCH_PADRAO,
} from "../../src/watch/config.ts";

describe("watch/config", () => {
  it("carrega configurações padrão caso o arquivo de config não exista", async () => {
    const config = await carregarConfigWatch("inexistente.jsonc",);
    assertEquals(config.targets, CONFIGURACOES_WATCH_PADRAO,);
    assert(config.targets.ui !== undefined,);
  });

  it("carrega configurações a partir do watch.jsonc real do projeto", async () => {
    const config = await carregarConfigWatch("watch.jsonc", ".",);
    assert(config.targets.ui !== undefined,);
    assertEquals(config.targets.ui.format, "esm",);
    assertEquals(config.targets.ui.entryPoints, ["main.tsx"],);
  });
});
