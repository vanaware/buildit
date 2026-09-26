/// <reference lib="deno.ns" />

import { assertRejects, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, } from "@std/assert";
import {
  carregarConfigWatch,
} from "../../src/watch/config.ts";

describe("watch/config", () => {
  it("lança erro caso o arquivo de config não exista", async () => {
    await assertRejects(
      () => carregarConfigWatch("inexistente.jsonc",),
      Error,
      'Arquivo de configuração "watch.jsonc" não encontrado',
    );
  });

  it("carrega configurações a partir do watch.jsonc real do projeto", async () => {
    const config = await carregarConfigWatch("watch.jsonc", ".",);
    const ui = config.targets["ui"];
    assert(ui !== undefined,);
    assertEquals(ui.format, "esm",);
    assertEquals(ui.entryPoints, ["main.tsx",],);
  });
});
