/// <reference lib="deno.ns" />

import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { parseArgs } from "../../src/tools/cli-flags.ts";
import type { GlobalTargetConfig } from "../../src/tools/interfaces.ts";

// Helper para criar config mínima
function makeTarget(overrides: Record<string, unknown> = {}) {
  return {
    srcdir: "src",
    distdir: "dist",
    entryPoints: ["a.ts"],
    ...overrides,
  };
}

describe("parseArgs", () => {
  const CONFIG_DEFAULT: GlobalTargetConfig = {
    ui: makeTarget({ default: true }),
    worker: makeTarget({ default: true }),
    sw: makeTarget({ default: true }),
    admin: makeTarget({ default: false }),
  };

  it("deve usar alvos padrão se nenhum for especificado", () => {
    const result = parseArgs([], CONFIG_DEFAULT);
    assertEquals(result.targets, ["ui", "worker", "sw"]);
    assertEquals(result.globalNoVersion, false);
  });

  it("inclui alvo com default: false quando solicitado explicitamente", () => {
    const result = parseArgs(["admin"], CONFIG_DEFAULT);
    assertEquals(result.targets, ["admin"]);
    assertEquals(result.globalNoVersion, false);
  });

  it("deve detectar flag noversion isolada", () => {
    const result = parseArgs(["noversion"], CONFIG_DEFAULT);
    assertEquals(result.targets, ["ui", "worker", "sw"]);
    assertEquals(result.globalNoVersion, true);
  });

  it("deve combinar alvos específicos e flag noversion", () => {
    const result = parseArgs(["ui", "noversion"], CONFIG_DEFAULT);
    assertEquals(result.targets, ["ui"]);
    assertEquals(result.globalNoVersion, true);
  });

  it("deve ser case-insensitive para os argumentos", () => {
    const result = parseArgs(["UI", "NOVERSION"], CONFIG_DEFAULT);
    assertEquals(result.targets, ["ui"]);
    assertEquals(result.globalNoVersion, true);
  });

  it("CONFIG vazio retorna tudo vazio", () => {
    const result = parseArgs([], {});
    assertEquals(result.targets, []);
    assertEquals(result.globalNoVersion, false);
  });
});
