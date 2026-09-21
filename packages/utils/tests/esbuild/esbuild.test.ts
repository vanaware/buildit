/**
 * @file esbuild.test.ts
 * @description Testes unitários BDD para a lógica de configuração e utilitários do esbuild.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assert, } from "@std/assert";
import {
  parseVersion,
  formatVersion,
  isSafePath,
  resolveOutputPaths,
  CONFIGURACOES_PADRAO,
} from "../../src/esbuild/mod.ts";

describe("esbuild - versioning", () => {
  it("deve parsear versão semântica com hash", () => {
    const v = parseVersion("1.2.3#hash");
    assertEquals(v.major, 1);
    assertEquals(v.minor, 2);
    assertEquals(v.patch, 3);
  });

  it("deve formatar versão corretamente", () => {
    const v = formatVersion(0, 3, 8, "test");
    assertEquals(v, "0.3.8#test");
  });
});

describe("esbuild - paths", () => {
  it("deve validar caminhos seguros", () => {
    assert(isSafePath("dist/output.js"));
    assert(!isSafePath("../secret.js"));
    assert(!isSafePath("/etc/passwd"));
  });

  it("deve resolver caminhos de saída corretamente", () => {
    const config = {
      outfile: "bundle.js",
      distdir: "dist",
      entryPoints: ["main.ts"]
    };
    const resolved = resolveOutputPaths(config);
    assertEquals(resolved.outfile, "dist/bundle.js");
  });
});

describe("esbuild - config", () => {
  it("deve ter configurações padrão válidas", () => {
    assert(CONFIGURACOES_PADRAO.ui !== undefined);
    assertEquals(CONFIGURACOES_PADRAO.ui!.mode, "build");
  });
});
