/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { resolverOrdemTargets, } from "../../src/tools/targets.ts";

describe("resolverOrdemTargets", () => {
  const config = {
    server: { default: true, },
    ui: { default: true, },
    sw: { default: true, },
    admin: { default: false, },
    docs: { default: false, },
  };

  it("retorna alvos padrão na ordem exata de definição do config quando nenhum solicitado", () => {
    const targets = resolverOrdemTargets(config,);
    assertEquals(targets, ["server", "ui", "sw",],);
  });

  it("garante a ordem do config mesmo se o chamador passar alvos invertidos ou desordenados", () => {
    // Passado ["docs", "ui", "server"] -> deve resolver para ["server", "ui", "docs"]
    const targets = resolverOrdemTargets(config, ["docs", "ui", "server",],);
    assertEquals(targets, ["server", "ui", "docs",],);
  });

  it("lida de forma case-insensitive preservando as chaves originais do config", () => {
    const targets = resolverOrdemTargets(config, ["SW", "SERVER",],);
    assertEquals(targets, ["server", "sw",],);
  });

  it("permite incluir alvos com default: false quando solicitados explicitamente", () => {
    const targets = resolverOrdemTargets(config, ["admin",],);
    assertEquals(targets, ["admin",],);
  });

  it("retorna vazio se os alvos solicitados não existirem no config", () => {
    const targets = resolverOrdemTargets(config, ["inexistente", "fantasma",],);
    assertEquals(targets, [],);
  });

  it("retorna array vazio quando config está vazio", () => {
    const targets = resolverOrdemTargets({}, ["ui",],);
    assertEquals(targets, [],);
  });
});
