import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { resolverOrdemTargets } from "../../src/tools/targets.ts";

describe("resolverOrdemTargets", () => {
  const config = {
    first: { default: true },
    second: { default: true },
    third: { default: false },
    fourth: { default: true },
  };

  it("deve retornar todos os alvos com default !== false na ordem exata da configuração", () => {
    const ordenados = resolverOrdemTargets(config);
    assertEquals(ordenados, ["first", "second", "fourth"]);
  });

  it("deve preservar a ordem da configuração mesmo se os alvos forem passados fora de ordem", () => {
    const ordenados = resolverOrdemTargets(config, ["fourth", "first", "third"]);
    assertEquals(ordenados, ["first", "third", "fourth"]);
  });

  it("deve suportar alvos solicitados em maiúsculas ou minúsculas", () => {
    const ordenados = resolverOrdemTargets(config, ["FOURTH", "First"]);
    assertEquals(ordenados, ["first", "fourth"]);
  });

  it("deve ignorar alvos solicitados inexistentes mantendo os válidos ordenados", () => {
    const ordenados = resolverOrdemTargets(config, ["inexistente", "second", "first"]);
    assertEquals(ordenados, ["first", "second"]);
  });
});
