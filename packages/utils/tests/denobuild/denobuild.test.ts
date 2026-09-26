/**
 * @file denobuild.test.ts
 * @description Testes unitários BDD para a lógica de configuração e utilitários do denobuild.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import {
  applyDefines,
  buildBundleOptions,
} from "../../src/denobuild/bundle.ts";
import { CONFIGURACOES_PADRAO, } from "../../src/denobuild/config.ts";
import { withFileStructure, } from "../helpers/fixtures.ts";

describe("denobuild - applyDefines", () => {
  it("deve substituir identificadores simples", () => {
    const code = "const version = __APP_VERSION__;";
    const defines = { "__APP_VERSION__": '"1.2.3"', };
    const result = applyDefines(code, defines,);
    assertEquals(result, 'const version = "1.2.3";',);
  });

  it("deve substituir múltiplos identificadores", () => {
    const code = "if (__DEBUG__) console.log(__MSG__);";
    const defines = { "__DEBUG__": "true", "__MSG__": '"hello"', };
    const result = applyDefines(code, defines,);
    assertEquals(result, 'if (true) console.log("hello");',);
  });

  it("deve lidar com caracteres especiais em chaves", () => {
    const code = "process.env.NODE_ENV";
    const defines = { "process.env.NODE_ENV": '"production"', };
    const result = applyDefines(code, defines,);
    assertEquals(result, '"production"',);
  });
});

describe("denobuild - buildBundleOptions", () => {
  it("deve gerar opções básicas a partir da configuração", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "src/main.tsx": "export const test = 1;",
    },);
    try {
      const config = {
        ...CONFIGURACOES_PADRAO.ui!,
        srcdir: join(dir, "src",),
      };
      const options = buildBundleOptions(config,);

      assertEquals(options.minify, false,);
      assertEquals(options.platform, "browser",);
      assertEquals(options.format, "esm",);
      assertEquals(options.write, false,);
    } finally {
      await cleanup();
    }
  });
});
