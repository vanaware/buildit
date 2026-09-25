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
    const ui = config.targets["ui"];
    assert(ui !== undefined,);
  });

  it("carrega configurações a partir do watch.jsonc real do projeto", async () => {
    const config = await carregarConfigWatch("watch.jsonc", ".",);
    const ui = config.targets["ui"];
    assert(ui !== undefined,);
    assertEquals(ui.format, "esm",);
    assertEquals(ui.entryPoints, ["main.tsx",],);
  });
});
