/**
 * @file esbuild.test.ts
 * @description Testes unitários BDD para a lógica de configuração e utilitários do esbuild.
 */

import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, } from "@std/assert";
import { formatVersion, parseVersion, } from "../../src/tools/version.ts";
import { isSafePath, resolveOutputPaths, } from "../../src/tools/paths.ts";
import { ESBUILD_CONFIG_EXAMPLE, } from "../../src/esbuild/config.ts";

describe("esbuild - versioning", () => {
  it("deve parsear versão semântica com hash", () => {
    const v = parseVersion("1.2.3#hash",);
    assertEquals(v.major, 1,);
    assertEquals(v.minor, 2,);
    assertEquals(v.patch, 3,);
  });

  it("deve formatar versão corretamente", () => {
    const v = formatVersion(0, 3, 8, "test",);
    assertEquals(v, "0.3.8#test",);
  });
});

describe("esbuild - paths", () => {
  it("deve validar caminhos seguros", () => {
    assert(isSafePath("dist/output.js",),);
    assert(!isSafePath("../secret.js",),);
    assert(!isSafePath("/etc/passwd",),);
  });

  it("deve resolver caminhos de saída corretamente", () => {
    const config = {
      outfile: "bundle.js",
      distdir: "dist",
      entryPoints: ["main.ts",],
    };
    const resolved = resolveOutputPaths(config,);
    assertEquals(resolved.outfile, "dist/bundle.js",);
  });
});

describe("esbuild - config", () => {
  it("deve ter exemplo de configuração válido", () => {
    assert(ESBUILD_CONFIG_EXAMPLE.ui !== undefined,);
    assertEquals(ESBUILD_CONFIG_EXAMPLE.ui!.default, true,);
  });
});
