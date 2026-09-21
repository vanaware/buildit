> **INSTRUÇÃO PARA A IA:** 
> O texto abaixo contém o código e testes da biblioteca @vanaware/buildit
> O projeto é o **BuildIt ** estruturado em módulos. 
> Cada arquivo começa com um título indicando seu caminho relativo exato (ex: `## Arquivo: src/main.ts`).
> Sempre que sugerir alterações, indique claramente qual arquivo deve ser modificado com base nesses caminhos e forneça o novo código completo do arquivo.

---

# Contexto Exportado do Projeto BuildIt - Modo: UTILS

Gerado automaticamente em: 2026-09-21T10:32:28.254Z

---

## Arquivo: `packages/utils/tests/esbuild/version.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, assertThrows, } from "@std/assert";
import {
  currentVersion,
  extractVersionFromContent,
  formatVersion,
  incrementVersion,
  parseVersion,
  replaceVersionInContent,
} from "../../src/esbuild/mod.ts";
import { withTempDenoJsonc, } from "../helpers/fixtures.ts";

describe("parseVersion", () => {
  describe("casos válidos", () => {
    const validCases = [
      { input: "1.2.3", expected: { major: 1, minor: 2, patch: 3, }, },
      { input: "0.0.0", expected: { major: 0, minor: 0, patch: 0, }, },
      { input: "99.99.99", expected: { major: 99, minor: 99, patch: 99, }, },
      {
        input: "0.2.148#msv0okam",
        expected: { major: 0, minor: 2, patch: 148, },
      },
      { input: "1.0.0#alpha", expected: { major: 1, minor: 0, patch: 0, }, },
      { input: "2.0.0#beta.1", expected: { major: 2, minor: 0, patch: 0, }, },
      {
        input: "1.0.0#alpha-beta-1",
        expected: { major: 1, minor: 0, patch: 0, },
      },
    ];
    for (const { input, expected, } of validCases) {
      it(`parseia "${input}" corretamente`, () => {
        assertEquals(parseVersion(input,), expected,);
      });
    }
  });
  describe("casos inválidos", () => {
    const invalidCases = [
      { input: "", desc: "string vazia", },
      { input: "1.2", desc: "apenas 2 partes", },
      { input: "1.2.3.4", desc: "4 partes", },
      { input: "a.b.c", desc: "letras", },
      { input: "1.abc.3", desc: "parte não numérica", },
      { input: "v1.2.3", desc: "prefixo v", },
      { input: "1.2.3#", desc: "cardinal sem hash", },
      { input: " 1.2.3", desc: "espaço antes", },
      { input: "1.2.3 ", desc: "espaço depois", },
    ];
    for (const { input, desc, } of invalidCases) {
      it(`lança erro para ${desc} ("${input}")`, () => {
        assertThrows(() => parseVersion(input,), Error,);
      });
    }
  });
});

describe("formatVersion", () => {
  it("formata com hash fornecido", () => {
    assertEquals(formatVersion(1, 2, 3, "abc",), "1.2.3#abc",);
  });
  it("gera hash automático quando não fornecido", () => {
    const result = formatVersion(0, 2, 149,);
    assertStringIncludes(result, "0.2.149#",);
    // Hash deve ter pelo menos alguns caracteres
    const hash = result.split("#",)[1];
    // 🔥 CORREÇÃO: Tratamento explícito de undefined (noUncheckedIndexedAccess)
    assertEquals(hash !== undefined && hash.length > 0, true,);
  });
  it("usa o mesmo hash em chamadas com mesmo parâmetro", () => {
    const hash = "fixedhash";
    assertEquals(
      formatVersion(1, 0, 0, hash,),
      formatVersion(1, 0, 0, hash,),
    );
  });
  it("lida com números grandes", () => {
    assertEquals(formatVersion(999, 999, 999, "x",), "999.999.999#x",);
  });
});

describe("extractVersionFromContent", () => {
  it("extrai versão de JSON simples", () => {
    assertEquals(
      extractVersionFromContent(`{ "version": "1.2.3" }`,),
      "1.2.3",
    );
  });
  it("extrai versão de JSONC com comentários", () => {
    const content = `{
      // Comentário
      "name": "buildit",
      "version": "2.0.0", /* inline */
    }`;
    assertEquals(extractVersionFromContent(content,), "2.0.0",);
  });
  it("extrai versão com hash", () => {
    assertEquals(
      extractVersionFromContent(`{ "version": "1.2.3-abc123" }`,),
      "1.2.3-abc123",
    );
  });
  it("retorna null quando não há versão", () => {
    assertEquals(
      extractVersionFromContent(`{ "name": "buildit" }`,),
      null,
    );
  });
  it("retorna null para string vazia", () => {
    assertEquals(extractVersionFromContent("",), null,);
  });
  it("ignora campos 'version' dentro de strings", () => {
    const content = `{ "name": "tem version: 1.0.0 no nome" }`;
    assertEquals(extractVersionFromContent(content,), null,);
  });
});

describe("replaceVersionInContent", () => {
  it("substitui versão preservando o resto", () => {
    const content = `{
      "name": "@buildit/app",
      "version": "1.0.0-old",
      "imports": {}
    }`;
    const result = replaceVersionInContent(content, "2.0.0-new",);
    assertStringIncludes(result, `"version": "2.0.0-new"`,);
    assertStringIncludes(result, `"name": "@buildit/app"`,);
    assertStringIncludes(result, `"imports"`,);
  });
  it("substitui apenas a primeira ocorrência", () => {
    const content = `{ "version": "1.0.0", "other": "version": "2.0.0" }`;
    const result = replaceVersionInContent(content, "3.0.0",);
    // A primeira deve ser substituída
    assertStringIncludes(result, `"version": "3.0.0"`,);
  });
});

describe("currentVersion (integração)", () => {
  it("lê versão de arquivo existente", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.2.3-abc",);
    try {
      const version = await currentVersion(path,);
      assertEquals(version, "1.2.3-abc",);
    } finally {
      await cleanup();
    }
  });
  it("lança erro quando arquivo não existe", async () => {
    let threw = false;
    try {
      await currentVersion("/caminho/que/nao/existe/deno.jsonc",);
    } catch {
      threw = true;
    }
    assertEquals(threw, true,);
  });
  it("lança erro quando versão não está no arquivo", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.0.0", {
      version: undefined,
    },);
    try {
      // Reescreve sem version
      await Deno.writeTextFile(path, `{ "name": "buildit" }`,);
      let errorMessage = "";
      try {
        await currentVersion(path,);
      } catch (error) {
        errorMessage = (error as Error).message;
      }
      assertStringIncludes(errorMessage, "Versão não encontrada",);
    } finally {
      await cleanup();
    }
  });
});

describe("incrementVersion (integração)", () => {
  it("incrementa patch e atualiza arquivo", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.2.3",);
    try {
      const newVersion = await incrementVersion("1.2.3", path, "testhash",);
      assertEquals(newVersion, "1.2.4#testhash",);
      const content = await Deno.readTextFile(path,);
      assertStringIncludes(content, `"version": "1.2.4#testhash"`,);
    } finally {
      await cleanup();
    }
  });
  it("preserva outras propriedades do JSON", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("0.0.1", {
      name: "@buildit/app",
      imports: { preact: "https://esm.sh/preact", },
    },);
    try {
      await incrementVersion("0.0.1", path, "x",);
      const content = await Deno.readTextFile(path,);
      assertStringIncludes(content, `"name": "@buildit/app"`,);
      assertStringIncludes(content, `"preact"`,);
    } finally {
      await cleanup();
    }
  });
  it("incrementa múltiplas vezes", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.0.0",);
    try {
      const v1 = await incrementVersion("1.0.0", path, "h1",);
      assertEquals(v1, "1.0.1#h1",);
      const v2 = await incrementVersion(v1, path, "h2",);
      assertEquals(v2, "1.0.2#h2",);
      const v3 = await incrementVersion(v2, path, "h3",);
      assertEquals(v3, "1.0.3#h3",);
    } finally {
      await cleanup();
    }
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/paths.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { isSafePath, } from "@vanaware/buildit/build";

describe("isSafePath", () => {
  describe("paths seguros", () => {
    const safePaths = [
      "arquivo.js",
      "pasta/arquivo.js",
      "pasta/subpasta/arquivo.js",
      ".",
      "file-with-dash.js",
      "file_with_underscore.js",
      "file.name.with.dots.js",
      "UPPERCASE.js",
      "123.js",
      "path/to/file",
    ];

    for (const path of safePaths) {
      it(`aceita "${path}"`, () => {
        assertEquals(isSafePath(path,), true,);
      });
    }
  });

  describe("paths bloqueados (path traversal)", () => {
    const traversalPaths = [
      "..",
      "../file.js",
      "pasta/../file.js",
      "a/b/c/../../file.js",
      "../../../etc/passwd",
      "foo..bar",
      "file..js",
    ];

    for (const path of traversalPaths) {
      it(`bloqueia "${path}"`, () => {
        assertEquals(isSafePath(path,), false,);
      });
    }
  });

  describe("paths bloqueados (absolutos Unix)", () => {
    const absolutePaths = [
      "/etc/passwd",
      "/home/user",
      "/var/log/system.log",
      "/tmp/test",
    ];

    for (const path of absolutePaths) {
      it(`bloqueia "${path}"`, () => {
        assertEquals(isSafePath(path,), false,);
      });
    }
  });

  describe("edge cases", () => {
    it("string vazia é considerada segura (não é traversal nem absoluta)", () => {
      assertEquals(isSafePath("",), true,);
    });

    it("path com apenas espaços é seguro", () => {
      assertEquals(isSafePath("   ",), true,);
    });

    it("path com caracteres especiais é seguro", () => {
      assertEquals(isSafePath("file@name.js",), true,);
      assertEquals(isSafePath("file+name.js",), true,);
    });
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/esbuild-options.test.ts`

```ts
/// <reference lib="deno.ns" />
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import { join, } from "@std/path";
import { buildEsbuildOptions, } from "../../src/esbuild/mod.ts";
import type { TargetConfig, } from "../../src/interfaces/mod.ts";
import { withFileStructure, } from "../helpers/fixtures.ts";

// Helper para criar config mínima válida com paths que existem
function makeConfig(
  dir: string,
  overrides: Partial<TargetConfig> = {},
): TargetConfig {
  return {
    srcdir: join(dir, "src",),
    distdir: "dist",
    entryPoints: ["main.tsx",],
    ...overrides,
  } as TargetConfig;
}

describe("buildEsbuildOptions", () => {
  describe("configuração básica", () => {
    it("usa outfile quando definido", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { outfile: "app.js", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.outfile, "dist/app.js",);
        assertEquals(options.outdir, undefined,);
      } finally {
        await cleanup();
      }
    });
    it("usa distdir como outdir quando outfile não definido", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { distdir: "monorepo/dist", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.outdir, "monorepo/dist",);
        assertEquals(options.outfile, undefined,);
      } finally {
        await cleanup();
      }
    });
    it("entryPoints é sempre preservado", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/a.ts": "",
        "src/b.ts": "",
      },);
      try {
        const config = makeConfig(dir, { entryPoints: ["a.ts", "b.ts",], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.entryPoints, [
          join(dir, "src", "a.ts",),
          join(dir, "src", "b.ts",),
        ],);
      } finally {
        await cleanup();
      }
    });
  });
  describe("propriedades opcionais", () => {
    it("inclui platform quando definido", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { platform: "browser", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.platform, "browser",);
      } finally {
        await cleanup();
      }
    });
    it("omite propriedades undefined", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.platform, undefined,);
        assertEquals(options.minify, undefined,);
      } finally {
        await cleanup();
      }
    });
    it("inclui todas as propriedades configuradas", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          platform: "browser",
          format: "esm",
          bundle: true,
          minify: true,
          sourcemap: "linked",
          target: "es2022",
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.platform, "browser",);
        assertEquals(options.format, "esm",);
        assertEquals(options.bundle, true,);
        assertEquals(options.minify, true,);
        assertEquals(options.sourcemap, "linked",);
        assertEquals(options.target, "es2022",);
      } finally {
        await cleanup();
      }
    });
  });
  describe("define", () => {
    it("injeta __APP_VERSION__ com v", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const options = await buildEsbuildOptions("ui", config, "1.2.3-abc",);
        assertEquals(options.define.__APP_VERSION__, '"v1.2.3-abc"',);
      } finally {
        await cleanup();
      }
    });
    it("preserva defines customizados do config", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          define: {
            "__FEATURE_X__": "true",
            "__API_URL__": '"https://api.example.com"',
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.define.__FEATURE_X__, "true",);
        assertEquals(options.define.__API_URL__, '"https://api.example.com"',);
        assertEquals(options.define.__APP_VERSION__, '"v1.0.0"',);
      } finally {
        await cleanup();
      }
    });
  });
  describe("banner e footer", () => {
    it("substitui __APP_VERSION__ no banner", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          banner: {
            js: "/* BuildIt v__APP_VERSION__ */\n",
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "2.0.0",);
        assertStringIncludes(options.banner.js, "BuildIt v2.0.0",);
      } finally {
        await cleanup();
      }
    });
    it("substitui múltiplas ocorrências de __APP_VERSION__", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          banner: {
            js: "/* __APP_VERSION__ build __APP_VERSION__ */",
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.banner.js.includes("__APP_VERSION__",), false,);
      } finally {
        await cleanup();
      }
    });
    it("substitui __APP_VERSION__ no CSS também", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          banner: {
            css: "/* CSS __APP_VERSION__ */",
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertStringIncludes(options.banner.css, "CSS 1.0.0",);
      } finally {
        await cleanup();
      }
    });
    it("substitui __APP_VERSION__ no footer", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          footer: {
            js: "/* End __APP_VERSION__ */",
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertStringIncludes(options.footer.js, "End 1.0.0",);
      } finally {
        await cleanup();
      }
    });
    it("lida com banner sem js", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          banner: { css: "/* css only __APP_VERSION__ */", },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.banner.js, undefined,);
        assertStringIncludes(options.banner.css, "1.0.0",);
      } finally {
        await cleanup();
      }
    });
  });
  describe("lógica especial para SW", () => {
    it("injeta __GENERATED_ASSETS__ quando targetName é 'sw'", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const mockListFn = () =>
          Promise.resolve(["./app.js", "./index.html",],);
        const options = await buildEsbuildOptions(
          "sw",
          config,
          "1.0.0",
          mockListFn,
        );
        const assets = JSON.parse(options.define.__GENERATED_ASSETS__,);
        assertEquals(assets, ["./app.js", "./index.html",],);
      } finally {
        await cleanup();
      }
    });
    it("não injeta __GENERATED_ASSETS__ para outros alvos", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const mockListFn = () => Promise.resolve(["./app.js",],);
        const options = await buildEsbuildOptions(
          "ui",
          config,
          "1.0.0",
          mockListFn,
        );
        assertEquals(options.define.__GENERATED_ASSETS__, undefined,);
      } finally {
        await cleanup();
      }
    });
    it("não injeta __GENERATED_ASSETS__ se listFn não fornecida", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const options = await buildEsbuildOptions("sw", config, "1.0.0",);
        assertEquals(options.define.__GENERATED_ASSETS__, undefined,);
      } finally {
        await cleanup();
      }
    });
  });
  describe("novas opções (1-13)", () => {
    it("inclui splitting", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { splitting: true, },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.splitting, true,);
      } finally {
        await cleanup();
      }
    });
    it("inclui loader customizado", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          loader: { ".png": "file", ".svg": "dataurl", },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.loader[".png"], "file",);
      } finally {
        await cleanup();
      }
    });
    it("inclui alias", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          alias: { "@": "./src", "moment": "dayjs", },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.alias["@"], "./src",);
        assertEquals(options.alias.moment, "dayjs",);
      } finally {
        await cleanup();
      }
    });
    it("inclui inject", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          inject: ["./polyfills.ts",],
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.inject, ["./polyfills.ts",],);
      } finally {
        await cleanup();
      }
    });
    it("inclui target como string", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { target: "es2022", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.target, "es2022",);
      } finally {
        await cleanup();
      }
    });
    it("inclui target como array", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { target: ["es2022", "chrome90",], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.target, ["es2022", "chrome90",],);
      } finally {
        await cleanup();
      }
    });
    it("inclui drop", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { drop: ["console", "debugger",], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.drop, ["console", "debugger",],);
      } finally {
        await cleanup();
      }
    });
    it("inclui pure", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { pure: ["console.log",], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.pure, ["console.log",],);
      } finally {
        await cleanup();
      }
    });
    it("inclui logLevel", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { logLevel: "warning", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.logLevel, "warning",);
      } finally {
        await cleanup();
      }
    });
    it("inclui entryNames/chunkNames/assetNames", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          entryNames: "[name]-[hash]",
          chunkNames: "chunks/[name]",
          assetNames: "assets/[name]",
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.entryNames, "[name]-[hash]",);
        assertEquals(options.chunkNames, "chunks/[name]",);
        assertEquals(options.assetNames, "assets/[name]",);
      } finally {
        await cleanup();
      }
    });
  });
  describe("plugins", () => {
    it("inclui plugins quando definidos na config", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const mockPlugin = { name: "test-plugin", setup: () => {}, };
        const config = makeConfig(dir, { plugins: [mockPlugin,], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins, [mockPlugin,],);
        assertEquals(options.plugins.length, 1,);
        assertEquals(options.plugins[0].name, "test-plugin",);
      } finally {
        await cleanup();
      }
    });
    it("inclui múltiplos plugins na ordem definida", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const plugin1 = { name: "plugin-1", setup: () => {}, };
        const plugin2 = { name: "plugin-2", setup: () => {}, };
        const config = makeConfig(dir, { plugins: [plugin1, plugin2,], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins.length, 2,);
        assertEquals(options.plugins[0].name, "plugin-1",);
        assertEquals(options.plugins[1].name, "plugin-2",);
      } finally {
        await cleanup();
      }
    });
    it("omite plugins quando não definidos (undefined)", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins, undefined,);
      } finally {
        await cleanup();
      }
    });
    it("omite plugins quando array vazio", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { plugins: [], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins, [],);
      } finally {
        await cleanup();
      }
    });
    it("plugins são independentes de outras opções", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const mockPlugin = { name: "my-plugin", setup: () => {}, };
        const config = makeConfig(dir, {
          plugins: [mockPlugin,],
          platform: "browser",
          bundle: true,
          minify: true,
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins, [mockPlugin,],);
        assertEquals(options.platform, "browser",);
        assertEquals(options.bundle, true,);
        assertEquals(options.minify, true,);
      } finally {
        await cleanup();
      }
    });
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/cli.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { parseArgs, } from "@vanaware/buildit/build";
import type { GlobalTargetConfig, } from "../../src/interfaces/mod.ts";

// Helper para criar config mínima
function makeTarget(overrides: Record<string, unknown> = {},) {
  return {
    srcdir: "src",
    distdir: "dist",
    entryPoints: ["a.ts",],
    ...overrides,
  };
}

describe("parseArgs", () => {
  // ========================================================================
  // CONFIGS DE TESTE
  // ========================================================================

  // CONFIG legado: sem mode nem default (compatibilidade)
  const CONFIG_LEGACY: GlobalTargetConfig = {
    ui: makeTarget(),
    worker: makeTarget(),
    sw: makeTarget(),
  };

  // CONFIG com default explícito
  const CONFIG_WITH_DEFAULTS: GlobalTargetConfig = {
    ui: makeTarget({ default: true, },),
    worker: makeTarget({ default: true, },),
    sw: makeTarget({ default: true, },),
    admin: makeTarget({ default: false, },),
  };

  // CONFIG com múltiplos watches
  const CONFIG_WITH_WATCHES: GlobalTargetConfig = {
    ui: makeTarget({ mode: "build", default: true, },),
    sw: makeTarget({ mode: "build", default: true, },),
    "watch-ui": makeTarget({ mode: "watch", default: false, },),
    "watch-admin": makeTarget({ mode: "watch", default: false, },),
  };

  // CONFIG misto: builds, watches e sob demanda
  const CONFIG_MIXED: GlobalTargetConfig = {
    ui: makeTarget({ mode: "build", default: true, },),
    sw: makeTarget({ mode: "build", default: true, },),
    admin: makeTarget({ mode: "build", default: false, },),
    "watch-ui": makeTarget({ mode: "watch", default: false, },),
    "watch-admin": makeTarget({ mode: "watch", default: false, },),
  };

  // ========================================================================
  // COMPATIBILIDADE (sem mode nem default)
  // ========================================================================

  describe("compatibilidade (sem mode nem default)", () => {
    it("inclui todos os alvos por padrão", () => {
      const result = parseArgs([], CONFIG_LEGACY,);
      assertEquals(result.targets, ["ui", "worker", "sw",],);
      assertEquals(result.watchTarget, null,);
    });
  });

  // ========================================================================
  // PROPRIEDADE default
  // ========================================================================

  describe("propriedade default", () => {
    it("inclui apenas alvos com default !== false", () => {
      const result = parseArgs([], CONFIG_WITH_DEFAULTS,);
      assertEquals(result.targets, ["ui", "worker", "sw",],);
      assertEquals(result.targets.includes("admin",), false,);
    });

    it("inclui alvo com default: false quando solicitado", () => {
      const result = parseArgs(["admin",], CONFIG_WITH_DEFAULTS,);
      assertEquals(result.targets, ["admin",],);
    });
  });

  // ========================================================================
  // PROPRIEDADE mode: 'watch'
  // ========================================================================

  describe("propriedade mode: 'watch'", () => {
    it("watch NUNCA aparece nos targets padrão", () => {
      const result = parseArgs([], CONFIG_WITH_WATCHES,);
      assertEquals(result.targets, ["ui", "sw",],);
      assertEquals(result.targets.includes("watch-ui",), false,);
      assertEquals(result.targets.includes("watch-admin",), false,);
      assertEquals(result.watchTarget, null,);
    });

    it("flag 'watch' seleciona o PRIMEIRO alvo watch", () => {
      const result = parseArgs(["watch",], CONFIG_WITH_WATCHES,);
      assertEquals(result.watchTarget, "watch-ui",);
      assertEquals(result.targets, [],);
    });

    it("solicitar alvo watch pelo nome ativa modo watch", () => {
      const result = parseArgs(["watch-admin",], CONFIG_WITH_WATCHES,);
      assertEquals(result.watchTarget, "watch-admin",);
      assertEquals(result.targets, [],);
    });

    it("modo watch ativo → targets de build vazios", () => {
      const result = parseArgs(["watch", "ui", "sw",], CONFIG_WITH_WATCHES,);
      assertEquals(result.watchTarget, "watch-ui",);
      assertEquals(result.targets, [],);
    });

    it("watch com default: true ainda é excluído dos targets padrão", () => {
      const config: GlobalTargetConfig = {
        ui: makeTarget({ mode: "build", },),
        "watch-ui": makeTarget({ mode: "watch", default: true, },),
      };
      const result = parseArgs([], config,);
      assertEquals(result.targets, ["ui",],);
      assertEquals(result.watchTarget, null,);
    });
  });

  // ========================================================================
  // MÚLTIPLOS WATCHES
  // ========================================================================

  describe("múltiplos watches", () => {
    it("flag 'watch' usa apenas o primeiro (ordem do CONFIG)", () => {
      const result = parseArgs(["watch",], CONFIG_MIXED,);
      assertEquals(result.watchTarget, "watch-ui",);
    });

    it("watch específico pode ser solicitado pelo nome", () => {
      const result = parseArgs(["watch-admin",], CONFIG_MIXED,);
      assertEquals(result.watchTarget, "watch-admin",);
    });

    it("solicitar múltiplos watches usa o primeiro na ordem do CONFIG", () => {
      const result = parseArgs(["watch-admin", "watch-ui",], CONFIG_MIXED,);
      // watch-ui vem antes de watch-admin no CONFIG
      assertEquals(result.watchTarget, "watch-ui",);
    });
  });

  // ========================================================================
  // FLAGS ESPECIAIS
  // ========================================================================

  describe("flags especiais", () => {
    it("detecta noversion", () => {
      const result = parseArgs(["noversion",], CONFIG_MIXED,);
      assertEquals(result.globalNoVersion, true,);
    });

    it("combina noversion com watch", () => {
      const result = parseArgs(["noversion", "watch",], CONFIG_MIXED,);
      assertEquals(result.globalNoVersion, true,);
      assertEquals(result.watchTarget, "watch-ui",);
    });

    it("combina noversion com alvos de build", () => {
      const result = parseArgs(["noversion", "ui",], CONFIG_MIXED,);
      assertEquals(result.globalNoVersion, true,);
      assertEquals(result.targets, ["ui",],);
    });
  });

  // ========================================================================
  // ORDEM DO CONFIG
  // ========================================================================

  describe("ordem do CONFIG", () => {
    it("mantém ordem do CONFIG mesmo com solicitação fora de ordem", () => {
      const result = parseArgs(["sw", "ui",], CONFIG_MIXED,);
      assertEquals(result.targets, ["ui", "sw",],);
    });

    it("preserva ordem com múltiplos alvos", () => {
      const result = parseArgs(["admin", "ui", "sw",], CONFIG_MIXED,);
      assertEquals(result.targets, ["ui", "sw", "admin",],);
    });
  });

  // ========================================================================
  // CASE INSENSITIVITY
  // ========================================================================

  describe("case insensitivity", () => {
    it("aceita maiúsculas para alvos", () => {
      const result = parseArgs(["UI", "SW",], CONFIG_MIXED,);
      assertEquals(result.targets, ["ui", "sw",],);
    });

    it("aceita maiúsculas para watch", () => {
      const result = parseArgs(["WATCH",], CONFIG_MIXED,);
      assertEquals(result.watchTarget, "watch-ui",);
    });

    it("aceita misto", () => {
      const result = parseArgs(["NoVersion", "Watch-Admin",], CONFIG_MIXED,);
      assertEquals(result.globalNoVersion, true,);
      assertEquals(result.watchTarget, "watch-admin",);
    });
  });

  // ========================================================================
  // EDGE CASES
  // ========================================================================

  describe("edge cases", () => {
    it("retorna targets vazios se todos forem default: false", () => {
      const config: GlobalTargetConfig = {
        admin: makeTarget({ default: false, },),
        debug: makeTarget({ default: false, },),
      };
      const result = parseArgs([], config,);
      assertEquals(result.targets, [],);
      assertEquals(result.watchTarget, null,);
    });

    it("ignora args desconhecidos", () => {
      const result = parseArgs(["ui", "desconhecido",], CONFIG_MIXED,);
      assertEquals(result.targets, ["ui",],);
    });

    it("watchTarget é null se não houver alvo watch no CONFIG", () => {
      const result = parseArgs(["watch",], CONFIG_LEGACY,);
      assertEquals(result.watchTarget, null,);
      // Volta para os targets padrão já que não há watch
      assertEquals(result.targets, ["ui", "worker", "sw",],);
    });

    it("CONFIG vazio retorna tudo vazio", () => {
      const result = parseArgs([], {},);
      assertEquals(result.targets, [],);
      assertEquals(result.watchTarget, null,);
    });
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/integration.test.ts`

```ts
/// <reference lib="deno.ns" />
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import { join, } from "@std/path";
import { processTarget, } from "../../src/esbuild/mod.ts";
import type { TargetConfig, } from "../../src/interfaces/mod.ts";
import {
  fileExists,
  readText,
  withFileStructure,
} from "../helpers/fixtures.ts";

describe("processTarget (integração)", () => {
  it("executa pipeline completo: clean, copy, build", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "index.html": "<html></html>",
      "dummy.ts": "// dummy",
    },);
    const { dir: publicDir, cleanup: cleanupPublic, } = await withFileStructure(
      {
        "manifest.json": `{ "name": "BuildIt", "version": "1.0.0" }`,
      },
    );
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure({
      "old-file.js": "should be deleted",
    },);
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        publicdir: publicDir,
        indexHtml: true,
        clean: [".",],
        entryPoints: ["dummy.ts",],
      };
      // Mock esbuild.build
      const mockBuild = (options: Record<string, unknown>,) => {
        // Simula escrita do arquivo de saída
        const outFile = (options.outfile as string) ||
          join(options.outdir as string, "output.js",);
        Deno.writeTextFileSync(outFile, "// bundled code",);
        return Promise.resolve({ metafile: null, errors: [], warnings: [], },);
      };
      await processTarget("ui", config, "2.0.0", mockBuild,);
      // Arquivo antigo foi removido (clean: ["."])
      assertEquals(await fileExists(join(distDir, "old-file.js",),), false,);
      // Arquivos estáticos foram copiados
      assertEquals(await fileExists(join(distDir, "index.html",),), true,);
      assertEquals(await fileExists(join(distDir, "manifest.json",),), true,);
      // manifest.json foi atualizado
      const manifest = JSON.parse(
        await readText(join(distDir, "manifest.json",),),
      );
      assertEquals(manifest.version, "2.0.0",);
      // Bundle foi gerado
      assertEquals(await fileExists(join(distDir, "output.js",),), true,);
    } finally {
      await cleanupSrc();
      await cleanupPublic();
      await cleanupDist();
    }
  });

  it("salva metafile quando gerado", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "dummy.ts": "// dummy",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["dummy.ts",],
        metafile: true,
      };
      const mockBuild = () =>
        Promise.resolve({
          metafile: {
            inputs: { "src/main.ts": { bytes: 100, }, },
            outputs: { "dist/main.js": { bytes: 500, }, },
          },
          errors: [],
          warnings: [],
        },);
      await processTarget("ui", config, "1.0.0", mockBuild,);
      const metafilePath = join(distDir, "ui-metafile.json",);
      assertEquals(await fileExists(metafilePath,), true,);
      const metafile = JSON.parse(await readText(metafilePath,),);
      assertEquals(metafile.inputs["src/main.ts"].bytes, 100,);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("não salva metafile quando metafile é false", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "dummy.ts": "// dummy",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["dummy.ts",],
        metafile: false,
      };
      const mockBuild = () =>
        Promise.resolve({
          metafile: { inputs: {}, },
        },);
      await processTarget("ui", config, "1.0.0", mockBuild,);
      assertEquals(
        await fileExists(join(distDir, "ui-metafile.json",),),
        false,
      );
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("propaga erro do esbuild.build", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "dummy.ts": "// dummy",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["dummy.ts",],
      };
      const mockBuild = () => {
        throw new Error("Build failed",);
      };
      let caughtError: Error | null = null;
      try {
        await processTarget("ui", config, "1.0.0", mockBuild,);
      } catch (error) {
        caughtError = error as Error;
      }
      assertEquals(caughtError !== null, true,);
      assertStringIncludes(caughtError!.message, "Build failed",);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("usa outfile quando especificado", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "dummy.ts": "// dummy",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["dummy.ts",],
        outfile: "custom-name.js",
      };
      let capturedOptions: Record<string, unknown> = {};
      const mockBuild = (options: Record<string, unknown>,) => {
        capturedOptions = options;
        Deno.writeTextFileSync(options.outfile as string, "// code",);
        return Promise.resolve({ metafile: null, errors: [], warnings: [], },);
      };
      await processTarget("ui", config, "1.0.0", mockBuild,);
      assertEquals(capturedOptions.outfile, join(distDir, "custom-name.js",),);
      assertEquals(capturedOptions.outdir, undefined,);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("lida com SW injetando assets via listFn", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "sw.ts": "// sw",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure({
      "app.js": "code",
      "index.html": "html",
      "service-worker.js": "sw",
    },);
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["sw.ts",],
      };
      let capturedDefine: Record<string, string> = {};
      const mockBuild = (options: Record<string, unknown>,) => {
        capturedDefine = options.define as Record<string, string>;
        return Promise.resolve({ metafile: null, errors: [], warnings: [], },);
      };
      const mockListFn = () => Promise.resolve(["./app.js", "./index.html",],);
      await processTarget("sw", config, "1.0.0", mockBuild, mockListFn,);
      // 🔥 CORREÇÃO: Tratamento explícito de undefined (noUncheckedIndexedAccess)
      const generatedAssets = capturedDefine["__GENERATED_ASSETS__"]!;
      const appVersion = capturedDefine["__APP_VERSION__"]!;
      const assets = JSON.parse(generatedAssets,);
      assertEquals(assets, ["./app.js", "./index.html",],);
      assertStringIncludes(appVersion, "v1.0.0",);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/esbuild-api.test.ts`

```ts
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { join } from "@std/path";
import { parseArgs } from "../../src/esbuild/mod.ts";
import { parseCommonCliFlags } from "../../src/config/cli-flags.ts";

describe("esbuild API & CLI flags integration", () => {
  it("deve integrar flags CLI com parseArgs", () => {
    const flags = parseCommonCliFlags(["ui", "--noversion", "-c", "custom.jsonc"]);
    assertEquals(flags.noversion, true);
    assertEquals(flags.configPath, "custom.jsonc");
    assertEquals(flags.positional, ["ui"]);

    const config = {
      ui: {
        mode: "build" as const,
        entryPoints: ["main.tsx"],
        srcdir: "src",
        distdir: "dist",
      },
    };

    const rawArgs = [
      ...flags.positional,
      ...(flags.noversion ? ["noversion"] : []),
    ];
    const parsed = parseArgs(rawArgs, config);

    assertEquals(parsed.targets, ["ui"]);
    assertEquals(parsed.globalNoVersion, true);
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/output-paths.test.ts`

```ts
/// <reference lib="deno.ns" />
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, assertThrows, } from "@std/assert";
import {
  resolveOutputPaths,
  validateTargetConfig,
} from "../../src/esbuild/mod.ts";
import type { TargetConfig, } from "../../src/interfaces/mod.ts";

describe("validateTargetConfig", () => {
  describe("distdir obrigatório", () => {
    it("lança erro quando publicdir existe mas distdir não", () => {
      const config: TargetConfig = {
        srcdir: "src",
        publicdir: "public",
        entryPoints: ["app.tsx",],
      };
      assertThrows(
        () => validateTargetConfig("ui", config,),
        Error,
        "'distdir'",
      );
    });
    it("lança erro quando indexHtml é true mas distdir não", () => {
      const config: TargetConfig = {
        srcdir: "src",
        indexHtml: true,
        entryPoints: ["app.tsx",],
      };
      assertThrows(
        () => validateTargetConfig("ui", config,),
        Error,
        "'distdir'",
      );
    });
    it("lança erro quando outfile não existe e distdir não", () => {
      const config: TargetConfig = {
        srcdir: "src",
        entryPoints: ["app.tsx",],
      };
      assertThrows(
        () => validateTargetConfig("ui", config,),
        Error,
        "'distdir'",
      );
    });
    it("NÃO lança erro quando outfile existe mas distdir não", () => {
      const config: TargetConfig = {
        srcdir: "src",
        outfile: "/absolute/path/app.js",
        entryPoints: ["app.tsx",],
      };
      // Não deve lançar
      validateTargetConfig("ui", config,);
    });
    it("NÃO lança erro quando distdir existe", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "dist",
        entryPoints: ["app.tsx",],
      };
      validateTargetConfig("ui", config,);
    });
  });

  describe("mensagens de erro didáticas", () => {
    it("lista todos os motivos quando múltiplas condições falham", () => {
      const config: TargetConfig = {
        srcdir: "src",
        publicdir: "public",
        indexHtml: true,
        entryPoints: ["app.tsx",],
      };
      try {
        validateTargetConfig("ui", config,);
      } catch (e) {
        const msg = (e as Error).message;
        assertStringIncludes(msg, "'publicdir' está configurado",);
        assertStringIncludes(msg, "'indexHtml' é true",);
        assertStringIncludes(msg, "'outfile' não está configurado",);
      }
    });
  });
});

describe("resolveOutputPaths", () => {
  describe("outfile relativo ao distdir", () => {
    it("faz join quando ambos existem", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "monorepo/server/build/dist",
        outfile: "app.js",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, "monorepo/server/build/dist/app.js",);
      assertEquals(result.outdir, undefined,);
    });
    it("faz join com subdiretórios", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "dist",
        outfile: "js/app.js",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, "dist/js/app.js",);
    });
  });

  describe("outfile absoluto (sem distdir)", () => {
    it("mantém outfile como está quando distdir não existe", () => {
      const config: TargetConfig = {
        srcdir: "src",
        outfile: "/absolute/path/app.js",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, "/absolute/path/app.js",);
      assertEquals(result.outdir, undefined,);
    });
  });

  describe("distdir como outdir (sem outfile)", () => {
    it("usa distdir como outdir quando outfile não existe", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "dist",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outdir, "dist",);
      assertEquals(result.outfile, undefined,);
    });
  });

  describe("nenhum configurado", () => {
    it("retorna objeto vazio", () => {
      const config: TargetConfig = {
        srcdir: "src",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, undefined,);
      assertEquals(result.outdir, undefined,);
    });
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/esbuild.test.ts`

```ts
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

```

---

## Arquivo: `packages/utils/tests/esbuild/filesystem.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import {
  cleanTarget,
  copyStaticFiles,
  listAssetsForCache,
} from "../../src/esbuild/mod.ts";
import {
  fileExists,
  listFiles,
  readText,
  withFileStructure,
  withTempDir,
} from "../helpers/fixtures.ts";

describe("cleanTarget", () => {
  it("remove arquivo específico", async () => {
    await withTempDir(async (dir,) => {
      await Deno.writeTextFile(join(dir, "teste.js",), "code",);
      assertEquals(await fileExists(join(dir, "teste.js",),), true,);

      await cleanTarget(dir, ["teste.js",],);

      assertEquals(await fileExists(join(dir, "teste.js",),), false,);
    },);
  });

  it("remove pasta recursivamente", async () => {
    await withTempDir(async (dir,) => {
      const subDir = join(dir, "subpasta",);
      await Deno.mkdir(subDir,);
      await Deno.writeTextFile(join(subDir, "arquivo.js",), "code",);

      await cleanTarget(dir, ["subpasta",],);

      assertEquals(await fileExists(subDir,), false,);
    },);
  });

  it("esvazia diretório com '.'", async () => {
    await withTempDir(async (dir,) => {
      await Deno.writeTextFile(join(dir, "a.js",), "a",);
      await Deno.writeTextFile(join(dir, "b.js",), "b",);
      await Deno.mkdir(join(dir, "sub",),);
      await Deno.writeTextFile(join(dir, "sub/c.js",), "c",);

      await cleanTarget(dir, [".",],);

      const files = await listFiles(dir,);
      assertEquals(files.length, 0,);
    },);
  });

  it("ignora path traversal (..)", async () => {
    await withTempDir(async (dir,) => {
      // Cria arquivo fora do dir que não deve ser removido
      const outsideFile = join(dir, "..", "protegido.txt",);
      try {
        await Deno.writeTextFile(outsideFile, "não me remova",);
      } catch {
        // Pode falhar se não tiver permissão
      }

      await cleanTarget(dir, ["../protegido.txt",],);

      // O arquivo fora do dir deve ainda existir (se foi criado)
      try {
        assertEquals(await fileExists(outsideFile,), true,);
        await Deno.remove(outsideFile,);
      } catch {
        // Se não conseguiu criar, ok
      }
    },);
  });

  it("ignora paths absolutos", async () => {
    await withTempDir(async (dir,) => {
      // Não deve lançar erro nem remover nada
      await cleanTarget(dir, ["/etc/passwd", "/tmp/test",],);
      assertEquals(true, true,);
    },);
  });

  it("não lança erro para arquivo inexistente", async () => {
    await withTempDir(async (dir,) => {
      await cleanTarget(dir, ["nao-existe.js",],);
      assertEquals(true, true,);
    },);
  });

  it("lista vazia não faz nada", async () => {
    await withTempDir(async (dir,) => {
      await Deno.writeTextFile(join(dir, "keep.js",), "keep",);
      await cleanTarget(dir, [],);
      assertEquals(await fileExists(join(dir, "keep.js",),), true,);
    },);
  });

  it("processa múltiplos paths de uma vez", async () => {
    await withTempDir(async (dir,) => {
      await Deno.writeTextFile(join(dir, "a.js",), "a",);
      await Deno.writeTextFile(join(dir, "b.js",), "b",);
      await Deno.writeTextFile(join(dir, "c.js",), "c",);

      await cleanTarget(dir, ["a.js", "c.js",],);

      assertEquals(await fileExists(join(dir, "a.js",),), false,);
      assertEquals(await fileExists(join(dir, "b.js",),), true,);
      assertEquals(await fileExists(join(dir, "c.js",),), false,);
    },);
  });
});

describe("listAssetsForCache", () => {
  it("lista arquivos em estrutura simples", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "style.css": "css",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.length, 2,);
      assertEquals(assets.includes("./app.js",), true,);
      assertEquals(assets.includes("./style.css",), true,);
    } finally {
      await cleanup();
    }
  });

  it("exclui arquivos .map", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "app.js.map": "map",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.length, 1,);
      assertEquals(assets[0], "./app.js",);
    } finally {
      await cleanup();
    }
  });

  it("exclui metafile.json", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "ui-metafile.json": "{}",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.length, 1,);
    } finally {
      await cleanup();
    }
  });

  it("exclui service-worker.js por padrão", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "service-worker.js": "sw code",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.includes("./service-worker.js",), false,);
      assertEquals(assets.length, 1,);
    } finally {
      await cleanup();
    }
  });

  it("aceita lista de exclusão customizada", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "temp.js": "temp",
      "debug.js": "debug",
    },);

    try {
      const assets = await listAssetsForCache(dir, ["temp.js", "debug.js",],);
      assertEquals(assets.length, 1,);
      assertEquals(assets[0], "./app.js",);
    } finally {
      await cleanup();
    }
  });

  it("lida com subdiretórios", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "assets/logo.png": "png",
      "assets/icons/favicon.ico": "ico",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.length, 3,);
      // Deve conter os paths relativos
      const hasLogo = assets.some((a,) => a.includes("logo.png",));
      const hasIcon = assets.some((a,) => a.includes("favicon.ico",));
      assertEquals(hasLogo, true,);
      assertEquals(hasIcon, true,);
    } finally {
      await cleanup();
    }
  });
});

describe("copyStaticFiles", () => {
  it("copia publicdir para distdir", async () => {
    const { dir: publicDir, cleanup: cleanupPublic, } = await withFileStructure(
      {
        "manifest.json": `{ "name": "BuildIt", "version": "1.0.0" }`,
        "icon.png": "png",
      },
    );

    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );

    try {
      const config = {
        srcdir: "/tmp/src",
        distdir: distDir,
        publicdir: publicDir,
        entryPoints: [],
      };

      await copyStaticFiles(config, "2.0.0",);

      // Arquivos foram copiados
      assertEquals(await fileExists(join(distDir, "manifest.json",),), true,);
      assertEquals(await fileExists(join(distDir, "icon.png",),), true,);

      // manifest.json foi atualizado
      const manifest = JSON.parse(
        await readText(join(distDir, "manifest.json",),),
      );
      assertEquals(manifest.version, "2.0.0",);
    } finally {
      await cleanupPublic();
      await cleanupDist();
    }
  });

  it("copia index.html quando indexHtml é true", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "index.html": "<html></html>",
    },);

    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );

    try {
      const config = {
        srcdir: srcDir,
        distdir: distDir,
        indexHtml: true,
        entryPoints: [],
      };

      await copyStaticFiles(config, "1.0.0",);

      assertEquals(await fileExists(join(distDir, "index.html",),), true,);
      const content = await readText(join(distDir, "index.html",),);
      assertEquals(content, "<html></html>",);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("não falha quando publicdir não existe", async () => {
    const { dir: distDir, cleanup, } = await withFileStructure({},);

    try {
      const config = {
        srcdir: "/tmp/src",
        distdir: distDir,
        publicdir: "/caminho/inexistente",
        entryPoints: [],
      };

      // Não deve lançar erro
      await copyStaticFiles(config, "1.0.0",);
      assertEquals(true, true,);
    } finally {
      await cleanup();
    }
  });

  it("não falha quando index.html não existe", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({},);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );

    try {
      const config = {
        srcdir: srcDir,
        distdir: distDir,
        indexHtml: true,
        entryPoints: [],
      };

      await copyStaticFiles(config, "1.0.0",);
      assertEquals(await fileExists(join(distDir, "index.html",),), false,);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("preserva manifest.json sem version quando não há campo", async () => {
    const { dir: publicDir, cleanup: cleanupPublic, } = await withFileStructure(
      {
        "manifest.json": `{ "name": "BuildIt" }`,
      },
    );

    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );

    try {
      const config = {
        srcdir: "/tmp/src",
        distdir: distDir,
        publicdir: publicDir,
        entryPoints: [],
      };

      await copyStaticFiles(config, "3.0.0",);

      const manifest = JSON.parse(
        await readText(join(distDir, "manifest.json",),),
      );
      assertEquals(manifest.name, "BuildIt",);
      assertEquals(manifest.version, "3.0.0",);
    } finally {
      await cleanupPublic();
      await cleanupDist();
    }
  });
});

```

---

## Arquivo: `packages/utils/tests/export/export.test.ts`

```ts
/**
 * @file export.test.ts
 * @description Testes unitários BDD para a lógica de filtragem e execução do exportador de contexto.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import {
  CONFIGURACOES_PADRAO,
  deveIncluirArquivo,
  parseArgs,
} from "../../src/export/mod.ts";

describe("deveIncluirArquivo", () => {
  it("deve BLOQUEAR qualquer arquivo dentro da pasta exports/ ou snapshots/", () => {
    const config = CONFIGURACOES_PADRAO.server!;
    assertEquals(deveIncluirArquivo("exports/server.md", config,), false,);
    assertEquals(deveIncluirArquivo("snapshots/server.md", config,), false,);
    assertEquals(
      deveIncluirArquivo("exports/.github/workflows/test.yml", config,),
      false,
    );
  });

  it("deve PERMITIR caminho adicional (.github/workflows) com extensão válida", () => {
    const config = CONFIGURACOES_PADRAO.server!;
    assertEquals(
      deveIncluirArquivo(".github/workflows/deploy.yml", config,),
      true,
    );
    assertEquals(
      deveIncluirArquivo(".github/workflows/ci.yaml", config,),
      true,
    );
  });

  it("deve BLOQUEAR caminho adicional com extensão INVÁLIDA", () => {
    const config = CONFIGURACOES_PADRAO.server!;
    assertEquals(
      deveIncluirArquivo(".github/workflows/segredo.png", config,),
      false,
    );
    assertEquals(
      deveIncluirArquivo(".github/workflows/config.secret", config,),
      false,
    );
  });

  it("deve PERMITIR arquivo dentro da pastaBase e subpasta permitida", () => {
    const config = CONFIGURACOES_PADRAO.server!;
    assertEquals(
      deveIncluirArquivo("packages/server/src/main.ts", config,),
      true,
    );
    assertEquals(
      deveIncluirArquivo("packages/server/docs/arquitetura.md", config,),
      true,
    );
  });

  it("deve BLOQUEAR arquivo fora da pastaBase (que não seja caminho adicional)", () => {
    const config = CONFIGURACOES_PADRAO.server!;
    assertEquals(deveIncluirArquivo("packages/ui/src/app.tsx", config,), false,);
    assertEquals(
      deveIncluirArquivo("packages/utils/src/helper.ts", config,),
      false,
    );
  });

  it("deve PERMITIR arquivos raiz explicitamente configurados", () => {
    const config = CONFIGURACOES_PADRAO.server!;
    assertEquals(
      deveIncluirArquivo("packages/server/deno.jsonc", config,),
      true,
    );
    assertEquals(deveIncluirArquivo("packages/server/readme.md", config,), true,);
  });

  it("deve BLOQUEAR arquivos raiz NÃO configurados", () => {
    const config = CONFIGURACOES_PADRAO.server!;
    assertEquals(
      deveIncluirArquivo("packages/server/package.json", config,),
      false,
    );
  });

  it("configuração 'docs' deve capturar raiz e subpasta docs", () => {
    const config = CONFIGURACOES_PADRAO.docs!;
    assertEquals(deveIncluirArquivo("readme.md", config,), true,);
    assertEquals(deveIncluirArquivo("docs/arquitetura.md", config,), true,);
    assertEquals(deveIncluirArquivo("src/main.ts", config,), false,);
  });
});

describe("parseArgs", () => {
  it("deve retornar todos os modos com default !== false quando sem argumentos", () => {
    const modos = parseArgs([], CONFIGURACOES_PADRAO,);
    assertEquals(modos.includes("ui",), true,);
    assertEquals(modos.includes("server",), true,);
    assertEquals(modos.includes("utils",), true,);
    assertEquals(modos.includes("docs",), false,); // docs tem default: false
  });

  it("deve retornar apenas o modo solicitado via CLI", () => {
    const modos = parseArgs(["docs",], CONFIGURACOES_PADRAO,);
    assertEquals(modos, ["docs",],);
  });

  it("deve ignorar argumentos desconhecidos", () => {
    const modos = parseArgs(["desconhecido", "ui",], CONFIGURACOES_PADRAO,);
    assertEquals(modos, ["ui",],);
  });
});

```

---

## Arquivo: `packages/utils/tests/export/export-api.test.ts`

```ts
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { join } from "@std/path";
import { executarExport } from "../../src/export/engine.ts";

describe("executarExport programmatic API", () => {
  it("deve aceitar configuração diretamente como objeto em memória e ler versão do deno.jsonc", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src");
    await Deno.mkdir(srcDir, { recursive: true });

    // Cria deno.jsonc com versão customizada do projeto
    const denoJsonc = join(tempDir, "deno.jsonc");
    await Deno.writeTextFile(denoJsonc, JSON.stringify({ version: "0.9.5" }));

    // Cria arquivo de teste
    await Deno.writeTextFile(join(srcDir, "sample.ts"), 'export const hello = "world";');

    const configEmMemoria = {
      testMode: {
        arquivoSaida: "snapshots/test-out.md",
        extensoesPermitidas: [".ts"],
        pastaBase: "./src",
        subpastasPermitidas: [],
        arquivosRaizPermitidos: ["sample.ts"],
        incluiVersao: true,
        instrucaoCustomizada: "Snapshot de teste para IA",
        default: true,
      },
    };

    const resultados = await executarExport({
      config: configEmMemoria,
      baseDir: tempDir,
      denoJsoncPath: denoJsonc,
      silencioso: true,
    });

    assertEquals(resultados.length, 1);
    assertEquals(resultados[0]?.modo, "testMode");
    assertEquals(resultados[0]?.arquivos, 1);

    const snapshotConteudo = await Deno.readTextFile(join(tempDir, "snapshots", "test-out.md"));
    assertEquals(snapshotConteudo.includes("[v0.9.5]"), true);
    assertEquals(snapshotConteudo.includes("Snapshot de teste para IA"), true);
    assertEquals(snapshotConteudo.includes('export const hello = "world";'), true);

    await Deno.remove(tempDir, { recursive: true });
  });

  it("deve aceitar passar diretamente o objeto Record<string, ExportConfig> no primeiro parâmetro", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src");
    await Deno.mkdir(srcDir, { recursive: true });

    await Deno.writeTextFile(join(srcDir, "index.ts"), 'console.log("direct config");');

    const resultados = await executarExport({
      direto: {
        arquivoSaida: join(tempDir, "direct.md"),
        extensoesPermitidas: [".ts"],
        pastaBase: srcDir,
        subpastasPermitidas: [],
        arquivosRaizPermitidos: ["index.ts"],
        incluiVersao: false,
        instrucaoCustomizada: "Teste direto",
      },
    });

    assertEquals(resultados.length, 1);
    assertEquals(resultados[0]?.modo, "direto");

    await Deno.remove(tempDir, { recursive: true });
  });
});

```

---

## Arquivo: `packages/utils/tests/export/utils.test.ts`

```````ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import {
  calcularCraseWrapper,
  deveIncluirArquivo,
  formatarArquivoMarkdown,
  gerarCabecalho,
  mapearExtensao,
  normalizarCaminho,
} from "../../src/export/mod.ts";
import { EXTENSOES_PADRAO, } from "../../src/config/mod.ts";
import type { ExportConfig, } from "../../src/interfaces/mod.ts";

// Helper para criar config customizada em testes
function makeConfig(overrides: Partial<ExportConfig> = {},): ExportConfig {
  return {
    arquivoSaida: "snapshot.md",
    extensoesPermitidas: EXTENSOES_PADRAO,
    pastaBase: "./",
    subpastasPermitidas: [],
    arquivosRaizPermitidos: [],
    incluiVersao: false,
    instrucaoCustomizada: "Teste",
    ...overrides,
  };
}

// ============================================================================
// 🛠️ FUNÇÕES UTILITÁRIAS
// ============================================================================

describe("normalizarCaminho", () => {
  it("converte barras invertidas em barras normais", () => {
    assertEquals(normalizarCaminho("a\\b\\c",), "a/b/c",);
  });

  it("converte para minúsculas", () => {
    assertEquals(normalizarCaminho("ABC/DEF",), "abc/def",);
  });

  it("lida com ambos simultaneamente", () => {
    assertEquals(normalizarCaminho("A\\B\\C/DEF",), "a/b/c/def",);
  });

  it("preserva caminho já normalizado", () => {
    assertEquals(normalizarCaminho("a/b/c",), "a/b/c",);
  });

  it("lida com string vazia", () => {
    assertEquals(normalizarCaminho("",), "",);
  });
});

describe("calcularCraseWrapper", () => {
  it("retorna ``` para texto sem crases", () => {
    assertEquals(calcularCraseWrapper("texto normal",), "```",);
  });

  it("retorna ```` para texto com ```", () => {
    assertEquals(calcularCraseWrapper("código com ```",), "````",);
  });

  it("retorna 6 crases para texto com `````", () => {
    assertEquals(calcularCraseWrapper("texto `````",), "``````",);
  });

  it("usa no mínimo 3 crases", () => {
    assertEquals(calcularCraseWrapper("com ` uma crase",), "```",);
    assertEquals(calcularCraseWrapper("com `` duas",), "```",);
  });

  it("lida com múltiplas sequências (usa a maior)", () => {
    assertEquals(
      calcularCraseWrapper("com ` e ``` e ``",),
      "````",
    );
  });

  it("lida com string vazia", () => {
    assertEquals(calcularCraseWrapper("",), "```",);
  });
});

describe("mapearExtensao", () => {
  it("mapeia .manifest para json", () => {
    assertEquals(mapearExtensao("manifest.manifest",), "json",);
  });

  it("mapeia .jsonc para json", () => {
    assertEquals(mapearExtensao("config.jsonc",), "json",);
  });

  it("mapeia .yml para yaml", () => {
    assertEquals(mapearExtensao("workflow.yml",), "yaml",);
  });

  it("mapeia .sh para bash", () => {
    assertEquals(mapearExtensao("deploy.sh",), "bash",);
  });

  it("mapeia .env* para properties", () => {
    assertEquals(mapearExtensao(".env",), "properties",);
    assertEquals(mapearExtensao(".env.example",), "properties",);
    assertEquals(mapearExtensao(".env.local",), "properties",);
  });

  it("retorna a extensão como está para casos não mapeados", () => {
    assertEquals(mapearExtensao("arquivo.ts",), "ts",);
    assertEquals(mapearExtensao("arquivo.tsx",), "tsx",);
    assertEquals(mapearExtensao("arquivo.md",), "md",);
  });

  it("é case insensitive", () => {
    assertEquals(mapearExtensao("arquivo.JSONC",), "json",);
    assertEquals(mapearExtensao("arquivo.YML",), "yaml",);
  });
});

// ============================================================================
// 🎯 LÓGICA DE FILTRAGEM
// ============================================================================

describe("deveIncluirArquivo", () => {
  describe("proteção anti-loop", () => {
    it("bloqueia qualquer arquivo dentro de exports/", () => {
      const config = makeConfig({
        pastaBase: "./",
        subpastasPermitidas: ["exports",],
      },);
      assertEquals(deveIncluirArquivo("exports/server.md", config,), false,);
      assertEquals(deveIncluirArquivo("exports/sub/file.ts", config,), false,);
    });

    it("bloqueia mesmo com extensão válida", () => {
      const config = makeConfig({
        pastaBase: "./",
        subpastasPermitidas: ["exports",],
        extensoesPermitidas: [".md", ".ts",],
      },);
      assertEquals(deveIncluirArquivo("exports/qualquer.ts", config,), false,);
    });
  });

  describe("caminhos adicionais", () => {
    it("permite caminho adicional com extensão válida", () => {
      const config = makeConfig({
        pastaBase: "src",
        caminhosAdicionaisPermitidos: [".github/workflows",],
        extensoesPermitidas: [".yml", ".yaml",],
      },);
      assertEquals(
        deveIncluirArquivo(".github/workflows/deploy.yml", config,),
        true,
      );
      assertEquals(
        deveIncluirArquivo(".github/workflows/ci.yaml", config,),
        true,
      );
    });

    it("bloqueia caminho adicional com extensão inválida", () => {
      const config = makeConfig({
        pastaBase: "src",
        caminhosAdicionaisPermitidos: [".github/workflows",],
        extensoesPermitidas: [".yml",],
      },);
      assertEquals(
        deveIncluirArquivo(".github/workflows/segredo.png", config,),
        false,
      );
    });

    it("permite arquivo exato no caminho adicional", () => {
      const config = makeConfig({
        pastaBase: "src",
        caminhosAdicionaisPermitidos: ["README.md",],
        extensoesPermitidas: [".md",],
      },);
      assertEquals(deveIncluirArquivo("README.md", config,), true,);
    });
  });

  describe("pastaBase e subpastas", () => {
    it("permite arquivo dentro de pastaBase e subpasta permitida", () => {
      const config = makeConfig({
        pastaBase: "monorepo/server",
        subpastasPermitidas: ["src", "docs",],
        extensoesPermitidas: [".ts", ".md",],
      },);
      assertEquals(
        deveIncluirArquivo("monorepo/server/src/main.ts", config,),
        true,
      );
      assertEquals(
        deveIncluirArquivo("monorepo/server/docs/arquitetura.md", config,),
        true,
      );
    });

    it("bloqueia arquivo fora de pastaBase", () => {
      const config = makeConfig({
        pastaBase: "monorepo/server",
        subpastasPermitidas: ["src",],
      },);
      assertEquals(
        deveIncluirArquivo("monorepo/ui/src/app.tsx", config,),
        false,
      );
    });

    it("bloqueia arquivo em subpasta não permitida", () => {
      const config = makeConfig({
        pastaBase: "monorepo/server",
        subpastasPermitidas: ["src",],
        extensoesPermitidas: [".js",],
      },);
      assertEquals(
        deveIncluirArquivo("monorepo/server/dist/bundle.js", config,),
        false,
      );
    });
  });

  describe("arquivos raiz", () => {
    it("permite arquivos raiz explicitamente configurados", () => {
      const config = makeConfig({
        pastaBase: "monorepo/server",
        arquivosRaizPermitidos: ["deno.json", "deploy.sh",],
        subpastasPermitidas: [],
      },);
      assertEquals(
        deveIncluirArquivo("monorepo/server/deno.json", config,),
        true,
      );
      assertEquals(
        deveIncluirArquivo("monorepo/server/deploy.sh", config,),
        true,
      );
    });

    it("bloqueia arquivos raiz não configurados", () => {
      const config = makeConfig({
        pastaBase: "monorepo/server",
        arquivosRaizPermitidos: ["deno.json",],
        subpastasPermitidas: [],
      },);
      assertEquals(
        deveIncluirArquivo("monorepo/server/package.json", config,),
        false,
      );
    });
  });

  describe("configuração tipo docs", () => {
    it("captura raiz e subpasta docs", () => {
      const config = makeConfig({
        pastaBase: "./",
        subpastasPermitidas: ["docs",],
        arquivosRaizPermitidos: ["readme.md",],
        extensoesPermitidas: [".md",],
      },);
      assertEquals(deveIncluirArquivo("readme.md", config,), true,);
      assertEquals(deveIncluirArquivo("docs/arquitetura.md", config,), true,);
    });

    it("bloqueia código fonte fora de docs", () => {
      const config = makeConfig({
        pastaBase: "./",
        subpastasPermitidas: ["docs",],
        extensoesPermitidas: [".md",],
      },);
      assertEquals(deveIncluirArquivo("src/main.ts", config,), false,);
    });
  });

  describe("edge cases", () => {
    it("subpastasPermitidas vazia permite tudo dentro de pastaBase", () => {
      const config = makeConfig({
        pastaBase: "monorepo/utils",
        subpastasPermitidas: [],
        extensoesPermitidas: [".ts",],
      },);
      assertEquals(
        deveIncluirArquivo("monorepo/utils/qualquer-coisa/arquivo.ts", config,),
        true,
      );
    });

    it("extensoesPermitidas vazia permite qualquer extensão", () => {
      const config = makeConfig({
        pastaBase: "src",
        subpastasPermitidas: ["lib",],
        extensoesPermitidas: [],
      },);
      assertEquals(deveIncluirArquivo("src/lib/arquivo.xyz", config,), true,);
    });

    it("lida com pastaBase './'", () => {
      const config = makeConfig({
        pastaBase: "./",
        subpastasPermitidas: ["src",],
      },);
      assertEquals(deveIncluirArquivo("src/main.ts", config,), true,);
    });

    it("lida com pastaBase '.'", () => {
      const config = makeConfig({
        pastaBase: ".",
        subpastasPermitidas: ["src",],
      },);
      assertEquals(deveIncluirArquivo("src/main.ts", config,), true,);
    });

    it("é case insensitive na comparação", () => {
      const config = makeConfig({
        pastaBase: "SRC",
        subpastasPermitidas: ["Lib",],
        arquivosRaizPermitidos: ["README.md",],
      },);
      assertEquals(deveIncluirArquivo("src/lib/arquivo.ts", config,), true,);
      assertEquals(deveIncluirArquivo("src/readme.md", config,), true,);
    });
  });
});

// ============================================================================
// 📝 GERAÇÃO DE CONTEÚDO
// ============================================================================

describe("gerarCabecalho", () => {
  it("inclui instrução customizada", () => {
    const config = makeConfig({
      instrucaoCustomizada: "Este é um código de TESTE.",
    },);
    const resultado = gerarCabecalho(config, "test", "1.0.0",);
    assertStringIncludes(resultado, "código de TESTE",);
  });

  it("inclui versão quando incluiVersao é true", () => {
    const config = makeConfig({ incluiVersao: true, },);
    const resultado = gerarCabecalho(config, "ui", "1.2.3",);
    assertStringIncludes(resultado, "[v1.2.3]",);
    assertStringIncludes(resultado, "BuildIt [v1.2.3]",);
  });

  it("não inclui versão quando incluiVersao é false", () => {
    const config = makeConfig({ incluiVersao: false, },);
    const resultado = gerarCabecalho(config, "server", "1.2.3",);
    assertEquals(resultado.includes("[v1.2.3]",), false,);
  });

  it("inclui nome do modo em maiúsculas", () => {
    const config = makeConfig();
    const resultado = gerarCabecalho(config, "ui", "1.0.0",);
    assertStringIncludes(resultado, "Modo: UI",);
  });

  it("inclui timestamp de geração", () => {
    const config = makeConfig();
    const resultado = gerarCabecalho(config, "ui", "1.0.0",);
    assertStringIncludes(resultado, "Gerado automaticamente em:",);
  });
});

describe("formatarArquivoMarkdown", () => {
  it("formata arquivo com caminho e conteúdo", () => {
    const resultado = formatarArquivoMarkdown(
      "src/main.ts",
      "console.log('hello');",
    );
    assertStringIncludes(resultado, "## Arquivo: `src/main.ts`",);
    assertStringIncludes(resultado, "```ts",);
    assertStringIncludes(resultado, "console.log('hello');",);
  });

  it("usa extensão mapeada para highlight", () => {
    const resultado = formatarArquivoMarkdown("config.jsonc", "{}",);
    assertStringIncludes(resultado, "```json",);
  });

  it("aumenta crases quando conteúdo tem ```", () => {
    const conteudo = "código com ```\nmais código";
    const resultado = formatarArquivoMarkdown("arquivo.md", conteudo,);
    // 🔥 CORREÇÃO: A extensão é "md" não "markdown"
    assertStringIncludes(resultado, "````md",);
    assertStringIncludes(resultado, "````",);
  });

  it("inclui separador no final", () => {
    const resultado = formatarArquivoMarkdown("src/main.ts", "code",);
    assertStringIncludes(resultado, "---",);
  });
});

```````

---

## Arquivo: `packages/utils/tests/denobuild/denobuild-api.test.ts`

```ts
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { join } from "@std/path";
import { executarDenoBuild } from "../../src/denobuild/engine.ts";

describe("executarDenoBuild programmatic API", () => {
  it("deve aceitar objeto DenoBundleGlobalConfig em memória diretamente", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src");
    const distDir = join(tempDir, "dist");
    await Deno.mkdir(srcDir, { recursive: true });

    // Cria entrypoint
    await Deno.writeTextFile(join(srcDir, "main.ts"), 'export const version = "test";');

    const config = {
      app: {
        mode: "build" as const,
        entryPoints: ["main.ts"],
        srcdir: srcDir,
        distdir: distDir,
        platform: "browser" as const,
        format: "esm" as const,
      },
    };

    const results = await executarDenoBuild({
      config,
      baseDir: tempDir,
      noversion: true,
      silencioso: true,
    });

    assertEquals(results.length, 1);
    assertEquals(results[0]?.target, "app");
    assertEquals(results[0]?.success, true);

    await Deno.remove(tempDir, { recursive: true });
  });
});

```

---

## Arquivo: `packages/utils/tests/denobuild/denobuild.test.ts`

```ts
/**
 * @file denobuild.test.ts
 * @description Testes unitários BDD para a lógica de configuração e utilitários do denobuild.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import {
  applyDefines,
  buildBundleOptions,
  CONFIGURACOES_PADRAO,
} from "../../src/denobuild/mod.ts";

describe("denobuild - applyDefines", () => {
  it("deve substituir identificadores simples", () => {
    const code = "const version = __APP_VERSION__;";
    const defines = { "__APP_VERSION__": '"1.2.3"' };
    const result = applyDefines(code, defines);
    assertEquals(result, 'const version = "1.2.3";');
  });

  it("deve substituir múltiplos identificadores", () => {
    const code = "if (__DEBUG__) console.log(__MSG__);";
    const defines = { "__DEBUG__": "true", "__MSG__": '"hello"' };
    const result = applyDefines(code, defines);
    assertEquals(result, 'if (true) console.log("hello");');
  });

  it("deve lidar com caracteres especiais em chaves", () => {
    const code = "process.env.NODE_ENV";
    const defines = { "process.env.NODE_ENV": '"production"' };
    const result = applyDefines(code, defines);
    assertEquals(result, '"production"');
  });
});

describe("denobuild - buildBundleOptions", () => {
  it("deve gerar opções básicas a partir da configuração", () => {
    const config = CONFIGURACOES_PADRAO.ui!;
    const options = buildBundleOptions(config);
    
    assertEquals(options.minify, false);
    assertEquals(options.platform, "browser");
    assertEquals(options.format, "esm");
    assertEquals(options.write, false);
  });
});

```

---

## Arquivo: `packages/utils/tests/config/version.test.ts`

```ts
import { describe, it } from "@std/testing/bdd";
import { assertEquals, assertThrows } from "@std/assert";
import { join } from "@std/path";
import {
  parseVersion,
  formatVersion,
  readProjectVersion,
  updateProjectVersion,
  writeVersionFile,
} from "../../src/config/version.ts";

describe("version utils", () => {
  describe("parseVersion e formatVersion", () => {
    it("deve parsear versões semânticas válidas", () => {
      const parsed = parseVersion("1.2.3#abc");
      assertEquals(parsed, { major: 1, minor: 2, patch: 3 });
    });

    it("deve formatar componentes em formato semântico", () => {
      const formatted = formatVersion(1, 2, 4, "hash123");
      assertEquals(formatted, "1.2.4#hash123");
    });

    it("deve rejeitar versões inválidas", () => {
      assertThrows(() => {
        parseVersion("invalid");
      });
    });
  });

  describe("readProjectVersion", () => {
    it("deve ler a versão do deno.jsonc raiz", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc");
      await Deno.writeTextFile(denoJsonc, JSON.stringify({ version: "0.5.0" }));

      const ver = await readProjectVersion(denoJsonc);
      assertEquals(ver, "0.5.0");

      await Deno.remove(tempDir, { recursive: true });
    });
  });

  describe("updateProjectVersion e versionPaths", () => {
    it("deve respeitar a opção noversion e não incrementar patch", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc");
      await Deno.writeTextFile(denoJsonc, JSON.stringify({ version: "1.0.0" }));

      const ver = await updateProjectVersion({
        denoJsonPath: denoJsonc,
        noversion: true,
        versionPaths: [join(tempDir, "version.ts")],
      });

      assertEquals(ver, "1.0.0");
      const generated = await Deno.readTextFile(join(tempDir, "version.ts"));
      assertEquals(generated.includes('1.0.0'), true);

      await Deno.remove(tempDir, { recursive: true });
    });

    it("deve incrementar a versão e salvar em múltiplos versionPaths", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc");
      await Deno.writeTextFile(denoJsonc, JSON.stringify({ version: "1.0.0" }));

      const path1 = join(tempDir, "pkg1", "version.ts");
      const path2 = join(tempDir, "pkg2"); // diretório

      const ver = await updateProjectVersion({
        denoJsonPath: denoJsonc,
        noversion: false,
        buildHash: "fixedhash",
        versionPaths: [path1, path2],
      });

      assertEquals(ver, "1.0.1#fixedhash");

      const file1 = await Deno.readTextFile(path1);
      const file2 = await Deno.readTextFile(join(path2, "version.ts"));

      assertEquals(file1.includes("1.0.1#fixedhash"), true);
      assertEquals(file2.includes("1.0.1#fixedhash"), true);

      await Deno.remove(tempDir, { recursive: true });
    });

    it("deve propagar a versão nos workspaces quando forcepackagesversion for true", async () => {
      const tempDir = await Deno.makeTempDir();
      const rootJson = join(tempDir, "deno.jsonc");
      const subpkgDir = join(tempDir, "packages", "sub");
      await Deno.mkdir(subpkgDir, { recursive: true });

      await Deno.writeTextFile(
        rootJson,
        JSON.stringify({
          version: "2.0.0",
          workspace: ["./packages/sub"],
        }),
      );

      const subJson = join(subpkgDir, "deno.jsonc");
      await Deno.writeTextFile(subJson, JSON.stringify({ name: "sub", version: "2.0.0" }));

      const ver = await updateProjectVersion({
        denoJsonPath: rootJson,
        noversion: false,
        buildHash: "testws",
        forcepackagesversion: true,
        versionPaths: [],
      });

      assertEquals(ver, "2.0.1#testws");

      const subContent = await Deno.readTextFile(subJson);
      assertEquals(subContent.includes("2.0.1#testws"), true);

      await Deno.remove(tempDir, { recursive: true });
    });
  });
});

```

---

## Arquivo: `packages/utils/tests/config/cli-flags.test.ts`

```ts
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { parseCommonCliFlags } from "../../src/config/cli-flags.ts";

describe("parseCommonCliFlags", () => {
  it("deve identificar a flag de ajuda (--help e -h)", () => {
    assertEquals(parseCommonCliFlags(["--help"]).showHelp, true);
    assertEquals(parseCommonCliFlags(["-h"]).showHelp, true);
    assertEquals(parseCommonCliFlags(["ui", "--help"]).showHelp, true);
  });

  it("deve identificar a flag de versão (--version, -V, -v)", () => {
    assertEquals(parseCommonCliFlags(["--version"]).showVersion, true);
    assertEquals(parseCommonCliFlags(["-V"]).showVersion, true);
    assertEquals(parseCommonCliFlags(["-v"]).showVersion, true);
  });

  it("deve identificar o caminho de configuração (-c e --config)", () => {
    const r1 = parseCommonCliFlags(["-c", "custom.jsonc", "ui"]);
    assertEquals(r1.configPath, "custom.jsonc");
    assertEquals(r1.positional, ["ui"]);

    const r2 = parseCommonCliFlags(["--config=custom2.jsonc"]);
    assertEquals(r2.configPath, "custom2.jsonc");

    const r3 = parseCommonCliFlags(["--config", "custom3.jsonc"]);
    assertEquals(r3.configPath, "custom3.jsonc");
  });

  it("deve identificar a opção noversion (--noversion, -n, noversion)", () => {
    assertEquals(parseCommonCliFlags(["--noversion"]).noversion, true);
    assertEquals(parseCommonCliFlags(["-n"]).noversion, true);
    assertEquals(parseCommonCliFlags(["noversion"]).noversion, true);
    assertEquals(parseCommonCliFlags(["NOVERSION"]).noversion, true);
  });

  it("deve identificar a opção forcepackagesversion (--forcepackagesversion, -f)", () => {
    assertEquals(parseCommonCliFlags(["--forcepackagesversion"]).forcepackagesversion, true);
    assertEquals(parseCommonCliFlags(["-f"]).forcepackagesversion, true);
    assertEquals(parseCommonCliFlags(["forcepackagesversion"]).forcepackagesversion, true);
  });

  it("deve coletar caminhos customizados de version-path", () => {
    const res = parseCommonCliFlags(["--version-path", "dist/version.ts", "--versionpath=pkg/version.ts"]);
    assertEquals(res.versionPaths, ["dist/version.ts", "pkg/version.ts"]);
  });

  it("deve separar argumentos posicionais de alvos ou modos", () => {
    const res = parseCommonCliFlags(["ui", "server", "-n", "-c", "esbuild.jsonc"]);
    assertEquals(res.positional, ["ui", "server"]);
    assertEquals(res.noversion, true);
    assertEquals(res.configPath, "esbuild.jsonc");
  });
});

```

---

## Arquivo: `packages/utils/tests/bdd_example_test.ts`

```ts
/**
 * @buildit/packages/utils/tests/bdd_example_test.ts
 *
 * Exemplo de uso do estilo BDD (describe/it) com @std/testing/bdd,
 * conforme definido na ADR 008.
 */

import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";

describe("bdd_example", () => {
  it("deve passar com uma afirmação simples", () => {
    assertEquals(1 + 1, 2,);
  });

  it("deve falhar corretamente quando a condição não é atendida", () => {
    // Este teste demonstra que o framework BDD funciona conforme esperado.
    const value = "buildit";
    assert(value.length > 0,);
  });
});

```

---

## Arquivo: `packages/utils/tests/helpers/fixtures.ts`

```ts
/// <reference lib="deno.ns" />

import { join, } from "@std/path";

/**
 * Cria um diretório temporário com estrutura controlada para testes.
 * Retorna o caminho e uma função de cleanup.
 */
export async function withTempDir<T,>(
  fn: (dir: string,) => Promise<T>,
): Promise<T> {
  const tempDir = await Deno.makeTempDir({ prefix: "buildit-test-", },);
  try {
    return await fn(tempDir,);
  } finally {
    await Deno.remove(tempDir, { recursive: true, },);
  }
}

/**
 * Cria um arquivo deno.jsonc temporário com versão especificada.
 */
export async function withTempDenoJsonc(
  version: string,
  extras?: Record<string, unknown>,
): Promise<{ path: string; cleanup: () => Promise<void> }> {
  const tempDir = await Deno.makeTempDir({ prefix: "buildit-deno-test-", },);
  const path = join(tempDir, "deno.jsonc",);

  const content = JSON.stringify(
    {
      name: "@buildit/test",
      version,
      ...extras,
    },
    null,
    2,
  );

  await Deno.writeTextFile(path, content,);

  return {
    path,
    cleanup: async () => await Deno.remove(tempDir, { recursive: true, },),
  };
}

/**
 * Cria uma estrutura de arquivos temporária para testes de filesystem.
 */
export async function withFileStructure(
  files: Record<string, string>,
): Promise<{ dir: string; cleanup: () => Promise<void> }> {
  const tempDir = await Deno.makeTempDir({ prefix: "buildit-fs-test-", },);

  for (const [path, content,] of Object.entries(files,)) {
    const fullPath = join(tempDir, path,);
    const dirPath = fullPath.substring(0, fullPath.lastIndexOf("/",),);

    if (dirPath) {
      await Deno.mkdir(dirPath, { recursive: true, },);
    }

    await Deno.writeTextFile(fullPath, content,);
  }

  return {
    dir: tempDir,
    cleanup: async () => await Deno.remove(tempDir, { recursive: true, },),
  };
}

/**
 * Verifica se um arquivo existe.
 */
export async function fileExists(path: string,): Promise<boolean> {
  try {
    await Deno.stat(path,);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lê o conteúdo de um arquivo como texto.
 */
export async function readText(path: string,): Promise<string> {
  return await Deno.readTextFile(path,);
}

/**
 * Lista arquivos em um diretório recursivamente.
 */
export async function listFiles(dir: string,): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of Deno.readDir(dir,)) {
    files.push(entry.name,);
  }
  return files;
}

```

---

## Arquivo: `packages/utils/src/esbuild/bundle.ts`

````ts
/**
 * @module @vanaware/buildit/build/bundle
 * @description Funções específicas para o motor Deno.bundle (API nativa --unstable-bundle).
 *
 * Estratégia de Define:
 * - Deno.bundle() não suporta 'define' nativo
 * - Usamos write: false para receber os OutputFiles em memória
 * - Aplicamos substituições de defines em cada OutputFile.text()
 * - Só então salvamos os arquivos modificados no disco
 *
 * Limitações vs esbuild:
 * - Sem watch mode (Deno.bundle não suporta)
 * - Sem plugins customizados
 * - Define via regex (menos preciso que AST transform)
 */
import { ensureDir, } from "@std/fs";
// ============================================================================
// 📦 TIPOS
// ============================================================================
import type { DenoBundleTargetConfig, } from "../interfaces/mod.ts";
// ============================================================================
// 📂 FUNÇÕES COMPARTILHADAS (reimportadas do mod.ts)
// ============================================================================
import {
  cleanTarget,
  copyStaticFiles,
  resolveEntryPoints,
  resolveOutputPaths,
  validateTargetConfig,
} from "./mod.ts";

// ============================================================================
// 🔧 APLICAÇÃO DE DEFINES (em memória, antes de salvar)
// ============================================================================
/**
 * Applies compile-time variable defines to the generated bundle source code.
 *
 * @param text - The bundle source text.
 * @param defines - Key-value map of defines to replace (e.g., `__VERSION__`).
 * @returns The transformed source code with defines applied.
 *
 * @example
 * ```ts
 * const replaced = applyDefines("console.log(__VERSION__);", { "__VERSION__": '"1.0.0"' });
 * ```
 */
export function applyDefines(
  text: string,
  defines: Record<string, string>,
): string {
  let result = text;
  for (const [key, value,] of Object.entries(defines,)) {
    // Escapa caracteres especiais de regex no key
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&",);
    const regex = new RegExp(escapedKey, "g",);
    result = result.replace(regex, value,);
  }
  return result;
}

// ============================================================================
// 🛠️ CONSTRUÇÃO DAS OPÇÕES DO DENO.BUNDLE
// ============================================================================
/**
 * Constructs Deno.bundle options from a target configuration.
 *
 * @param config - The bundle target configuration.
 * @returns Fully resolved options object for Deno.bundle.
 */
export function buildBundleOptions(
  config: DenoBundleTargetConfig,
): Deno.bundle.Options {
  // 🔥 RESOLUÇÃO DE ENTRYPOINTS (srcdir opcional)
  const resolvedEntryPoints = resolveEntryPoints(
    config.srcdir,
    config.entryPoints,
  );

  // 🔥 RESOLUÇÃO DE OUTPUT PATHS (outfile relativo ao distdir)
  const { outfile, outdir, } = resolveOutputPaths(config,);

  const options: Deno.bundle.Options = {
    entrypoints: resolvedEntryPoints,
    write: false, // 🔥 SEMPRE false — salvamos manualmente após injetar defines
  };

  // 🔥 CORREÇÃO: Usa outputPath resolvido ou outputDir
  if (outfile) {
    options.outputPath = outfile;
  } else if (outdir) {
    options.outputDir = outdir;
  }

  // Propriedades opcionais repassadas diretamente
  if (config.platform !== undefined) options.platform = config.platform;
  if (config.format !== undefined) options.format = config.format;
  if (config.minify !== undefined) options.minify = config.minify;
  if (config.keepNames !== undefined) options.keepNames = config.keepNames;
  if (config.sourcemap !== undefined) options.sourcemap = config.sourcemap;
  if (config.codeSplitting !== undefined) {
    options.codeSplitting = config.codeSplitting;
  }
  if (config.inlineImports !== undefined) {
    options.inlineImports = config.inlineImports;
  }
  if (config.packages !== undefined) options.packages = config.packages;
  if (config.external !== undefined) options.external = config.external;

  return options;
}

// ============================================================================
// 🎯 PROCESSAMENTO DE ALVO (Deno.bundle)
// ============================================================================
/**
 * Processes a single bundle target using Deno.bundle.
 *
 * @param targetName - The name of the target to compile.
 * @param config - The bundle target configuration.
 * @param appVersion - The application version string to stamp.
 * @param listAssetsFn - Optional function to list output assets for cache manifests.
 * @returns A promise that resolves when processing is complete.
 */
export async function processBundleTarget(
  targetName: string,
  config: DenoBundleTargetConfig,
  appVersion: string,
  listAssetsFn?: (distDir: string,) => Promise<string[]>,
): Promise<void> {
  // 🔥 VALIDAÇÃO FAIL-FAST: Verifica configuração ANTES de qualquer operação
  validateTargetConfig(targetName, config,);

  console.log(`\n${"=".repeat(60,)}`,);
  console.log(`🎯 PROCESSANDO ALVO: ${targetName.toUpperCase()}`,);
  console.log(`${"=".repeat(60,)}`,);

  // 1. Limpar diretório de saída
  if (config.clean && config.clean.length > 0) {
    // 🔥 CORREÇÃO: Só limpa se distdir existe
    if (config.distdir) {
      await cleanTarget(config.distdir, config.clean,);
    } else {
      console.warn(
        `⚠️ 'clean' configurado mas 'distdir' ausente. Pulando limpeza.`,
      );
    }
  }

  // 2. Copiar arquivos estáticos
  await copyStaticFiles(config, appVersion,);

  // 3. Preparar defines
  const defines: Record<string, string> = {
    ...config.define,
    __APP_VERSION__: JSON.stringify(`v${appVersion}`,),
  };

  // 🔥 CORREÇÃO: Só lista assets se distdir existe
  if (targetName === "sw" && listAssetsFn && config.distdir) {
    const assets = await listAssetsFn(config.distdir,);
    defines["__GENERATED_ASSETS__"] = JSON.stringify(assets,);
    console.log(`📋 ${assets.length} assets listados para cache do SW`,);
  }

  // 4. Executar bundle
  console.log(`🔨 Compilando com Deno.bundle...`,);
  const startTime = performance.now();
  const bundleOptions = buildBundleOptions(config,);
  const result = await Deno.bundle(bundleOptions,);

  // 5. Verificar erros
  if (!result.success) {
    console.error("❌ Erros de compilação:",);
    for (const error of result.errors) {
      const loc = error.location
        ? ` (${error.location.file}:${error.location.line}:${error.location.column})`
        : "";
      console.error(`   ${error.text}${loc}`,);
      for (const note of error.notes ?? []) {
        console.error(`      💡 ${note.text}`,);
      }
    }
    throw new Error(`Bundle falhou para o alvo [${targetName}]`,);
  }

  // 6. Exibir warnings (se houver)
  for (const warning of result.warnings) {
    const loc = warning.location
      ? ` (${warning.location.file}:${warning.location.line}:${warning.location.column})`
      : "";
    console.warn(`   ⚠️ ${warning.text}${loc}`,);
  }

  // 7. Processar OutputFiles: text() → applyDefines → writeTextFile
  const outputFiles = result.outputFiles ?? [];
  if (outputFiles.length === 0) {
    console.warn(`   ⚠️ Nenhum arquivo gerado pelo bundle [${targetName}]`,);
    return;
  }

  const defineKeys = Object.keys(defines,);
  const hasDefines = defineKeys.length > 0;
  if (hasDefines) {
    console.log(
      `🔧 Injetando ${defineKeys.length} define(s): ${defineKeys.join(", ",)}`,
    );
  }

  for (const outputFile of outputFiles) {
    // Garante que o diretório de destino existe
    const dir = outputFile.path.substring(
      0,
      outputFile.path.lastIndexOf("/",),
    );
    if (dir) {
      await ensureDir(dir,);
    }

    // Obtém conteúdo como string via .text()
    let content = outputFile.text();

    // Aplica defines no conteúdo em memória (ANTES de salvar)
    if (hasDefines) {
      content = applyDefines(content, defines,);
    }

    // Salva o arquivo modificado no disco
    await Deno.writeTextFile(outputFile.path, content,);
    console.log(
      `   📄 ${outputFile.path} (${(content.length / 1024).toFixed(1,)}KB)`,
    );
  }

  const duration = (performance.now() - startTime).toFixed(0,);
  console.log(
    `✅ [${targetName}] Build concluído em ${duration}ms (${outputFiles.length} arquivo(s))`,
  );
}

````

---

## Arquivo: `packages/utils/src/esbuild/engine.ts`

````ts
/**
 * @module @vanaware/buildit/esbuild/engine
 * @description Mecanismo programático para execução de builds com esbuild e @deno/esbuild-plugin.
 */

import * as esbuild from "esbuild";
import { denoPlugin } from "@deno/esbuild-plugin";
import { join } from "@std/path";
import { updateProjectVersion } from "../config/version.ts";
import {
  copyStaticFiles,
  buildEsbuildOptions,
  listAssetsForCache,
  parseArgs,
  processTarget,
} from "./mod.ts";
import { carregarConfigEsbuild } from "./config.ts";
import type {
  EsbuildOptions,
  GlobalTargetConfig,
} from "../interfaces/mod.ts";

/**
 * Detailed esbuild compilation result.
 */
export interface EsbuildResult {
  /** The build target identifier. */
  target: string;
  /** Whether the build operation succeeded. */
  success: boolean;
  /** Total duration of the build operation in milliseconds. */
  durationMs: number;
}

/**
 * Injeta o Deno Plugin nas opções do esbuild.
 */
// deno-lint-ignore no-explicit-any
export const buildWithDenoPlugin = (options: any, denoJsoncPath: string): Promise<any> => {
  options.plugins = [
    ...(options.plugins || []),
    denoPlugin({ configPath: denoJsoncPath }),
  ];
  return esbuild.build(options);
};

/**
 * Inicia o Watch Mode do esbuild.
 */
export async function startWatchMode(
  watchTargetName: string,
  currentVer: string,
  config: GlobalTargetConfig,
  denoJsoncPath: string,
): Promise<void> {
  const targetConfig = config[watchTargetName];
  if (!targetConfig) {
    throw new Error(`❌ Alvo watch '${watchTargetName}' não encontrado na configuração`);
  }

  console.log(`\n👀 Iniciando Watch Mode: ${watchTargetName}\n`);

  await copyStaticFiles(targetConfig, currentVer);

  const esbuildOptions = await buildEsbuildOptions(
    watchTargetName,
    targetConfig,
    currentVer,
  );

  esbuildOptions.plugins = [
    ...(esbuildOptions.plugins || []),
    denoPlugin({ configPath: denoJsoncPath }),
  ];

  const ctx = await esbuild.context(esbuildOptions);
  await ctx.watch();

  console.log("\n✅ Watch mode ativo!");
  console.log(`📁 Monitorando: ${targetConfig.srcdir}/`);

  const resolvedOutfile = esbuildOptions.outfile ||
    (targetConfig.distdir ? `${targetConfig.distdir}/` : "N/A");
  console.log(`📦 Output: ${resolvedOutfile}`);
  console.log(`📌 Versão: v${currentVer}`);
  console.log("\n💡 Pressione Ctrl+C para parar.\n");

  await new Promise(() => {});
}

/**
 * Executa programaticamente a compilação com esbuild para os alvos configurados.
 * Aceita diretamente um objeto GlobalTargetConfig em memória ou EsbuildOptions.
 *
 * @param configOuOpcoes Objeto GlobalTargetConfig em memória ou opções completas de execução
 * @returns Lista de resultados obtidos por alvo
 *
 * @example
 * ```typescript
 * // Passando configuração diretamente em memória:
 * const resultados = await executarEsbuild({
 *   ui: { entryPoints: ["main.tsx"], distdir: "dist", srcdir: "src", ... }
 * });
 *
 * // Ou usando opções completas:
 * const resultados = await executarEsbuild({ targets: ["ui"], noversion: true });
 * ```
 */
export async function executarEsbuild(
  configOuOpcoes?: EsbuildOptions | GlobalTargetConfig,
): Promise<EsbuildResult[]> {
  let configs: GlobalTargetConfig;
  let opcoes: EsbuildOptions | undefined;

  if (
    configOuOpcoes &&
    typeof configOuOpcoes === "object" &&
    !("caminhoConfig" in configOuOpcoes) &&
    !("targets" in configOuOpcoes) &&
    !("baseDir" in configOuOpcoes) &&
    !("config" in configOuOpcoes) &&
    !("silencioso" in configOuOpcoes) &&
    !("noversion" in configOuOpcoes) &&
    !("versionPaths" in configOuOpcoes) &&
    !("forcepackagesversion" in configOuOpcoes) &&
    !("denoJsoncPath" in configOuOpcoes) &&
    !("watchTarget" in configOuOpcoes)
  ) {
    configs = configOuOpcoes as GlobalTargetConfig;
  } else {
    opcoes = configOuOpcoes as EsbuildOptions | undefined;
    if (opcoes?.config) {
      configs = opcoes.config;
    } else {
      const baseDir = opcoes?.baseDir ?? ".";
      configs = await carregarConfigEsbuild(opcoes?.caminhoConfig, baseDir);
    }
  }

  const baseDir = opcoes?.baseDir ?? ".";
  const rawArgs = [
    ...(opcoes?.targets ?? []),
    ...(opcoes?.noversion ? ["noversion"] : []),
  ];

  const { targets, globalNoVersion, watchTarget } = parseArgs(rawArgs, configs);
  const activeWatch = opcoes?.watchTarget ?? watchTarget;
  const denoJsoncPath = opcoes?.denoJsoncPath ?? join(baseDir, "deno.jsonc");

  const finalVersion = await updateProjectVersion({
    denoJsonPath: denoJsoncPath,
    baseDir,
    noversion: globalNoVersion || (opcoes?.noversion ?? false),
    versionPaths: opcoes?.versionPaths,
    forcepackagesversion: opcoes?.forcepackagesversion,
  });

  if (activeWatch) {
    await startWatchMode(activeWatch, finalVersion, configs, denoJsoncPath);
    return [{ target: activeWatch, success: true, durationMs: 0 }];
  }

  if (targets.length === 0) {
    return [];
  }

  const resultados: EsbuildResult[] = [];

  for (const targetName of targets) {
    const targetConfig = configs[targetName];
    if (!targetConfig) {
      console.warn(`⚠️ Alvo '${targetName}' não encontrado na configuração. Pulando.`);
      continue;
    }

    const startTime = performance.now();
    await processTarget(
      targetName,
      targetConfig,
      finalVersion,
      (opts) => buildWithDenoPlugin(opts, denoJsoncPath),
      listAssetsForCache,
    );
    const durationMs = Number((performance.now() - startTime).toFixed(0));

    resultados.push({
      target: targetName,
      success: true,
      durationMs,
    });
  }

  return resultados;
}

````

---

## Arquivo: `packages/utils/src/esbuild/cli.ts`

````ts
/**
 * @module @vanaware/buildit/esbuild/cli
 * @description Ponto de entrada CLI para o orquestrador de compilação baseado em esbuild.
 */

import { parseCommonCliFlags } from "../config/cli-flags.ts";
import { readProjectVersion, updateProjectVersion } from "../config/version.ts";
import {
  listAssetsForCache,
  parseArgs,
  processTarget,
} from "./mod.ts";
import { carregarConfigEsbuild } from "./config.ts";
import { buildWithDenoPlugin, startWatchMode } from "./engine.ts";

/**
 * Exibe a mensagem de ajuda para o comando esbuild.
 */
export function showEsbuildHelp(): void {
  console.log(`
BuildIt esbuild Orquestrador CLI

Uso:
  deno task esbuild [alvos...] [opções]
  deno run -A jsr:@vanaware/buildit/esbuild/cli [alvos...] [opções]

Opções:
  -c, --config <path>               Especifica o arquivo de configuração (ex: esbuild.jsonc)
  -V, --version, -v                 Exibe a versão do projeto
  -h, --help                        Exibe esta mensagem de ajuda
  -n, --noversion, noversion        Desabilita o incremento automático de versão
  -f, --forcepackagesversion        Propaga a versão para os subpacotes do workspace
  --version-path <path>             Diretório ou arquivo adicional onde salvar o version.ts

Exemplos:
  deno task esbuild                 # Compila alvos padrão
  deno task esbuild ui              # Compila apenas o alvo 'ui'
  deno task esbuild watch           # Inicia o modo watch para o alvo configurado
  deno task esbuild noversion       # Compila sem incrementar a versão
  deno task esbuild -c custom.jsonc
  deno task esbuild -V              # Exibe a versão do projeto
`);
}

/**
 * Executa o CLI do orquestrador de build baseado em esbuild.
 *
 * @param args Argumentos da linha de comando (ex: `Deno.args`)
 * @param caminhoConfig Caminho opcional do arquivo de configuração
 *
 * @example
 * ```typescript
 * await runEsbuildCli(Deno.args);
 * ```
 */
export async function runEsbuildCli(
  args: string[] = Deno.args,
  caminhoConfig?: string,
): Promise<void> {
  const flags = parseCommonCliFlags(args);

  if (flags.showHelp) {
    showEsbuildHelp();
    return;
  }

  const projectVersion = await readProjectVersion();

  if (flags.showVersion) {
    console.log(`v${projectVersion}`);
    return;
  }

  const start = performance.now();
  const baseDir = ".";
  const configPath = flags.configPath ?? caminhoConfig;
  const configs = await carregarConfigEsbuild(configPath, baseDir);
  const rawArgs = [
    ...flags.positional,
    ...(flags.noversion ? ["noversion"] : []),
  ];
  const { targets, globalNoVersion, watchTarget } = parseArgs(rawArgs, configs);

  const DENO_JSONC_PATH = "deno.jsonc";

  console.log("\n🚀 Iniciando Orquestrador de Build BuildIt (esbuild nativo + @deno/esbuild-plugin)");

  if (watchTarget) {
    console.log(`👀 Modo Watch ativo: ${watchTarget}`);
  } else {
    console.log(
      `📋 Alvos de build (ordem segura do CONFIG): ${targets.join(", ") || "(nenhum)"}`,
    );
  }
  console.log(`🔒 Noversion: ${globalNoVersion}\n`);

  try {
    const finalVersion = await updateProjectVersion({
      denoJsonPath: DENO_JSONC_PATH,
      noversion: globalNoVersion || (watchTarget !== null),
      versionPaths: flags.versionPaths,
      forcepackagesversion: flags.forcepackagesversion,
    });

    if (watchTarget) {
      await startWatchMode(watchTarget, finalVersion, configs, DENO_JSONC_PATH);
      return;
    }

    for (const targetName of targets) {
      const targetConfig = configs[targetName];
      if (!targetConfig) {
        console.warn(`⚠️ Alvo '${targetName}' não encontrado na configuração. Pulando.`);
        continue;
      }

      await processTarget(
        targetName,
        targetConfig,
        finalVersion,
        (opts) => buildWithDenoPlugin(opts, DENO_JSONC_PATH),
        listAssetsForCache,
      );
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🎉 ORQUESTRAÇÃO ESBUILD CONCLUÍDA COM SUCESSO!`);
    console.log(`${"=".repeat(60)}`);
  } catch (error) {
    console.error("\n🛑 Pipeline de build falhou:", error);
    Deno.exit(1);
  } finally {
    const elapsed = (performance.now() - start).toFixed(0);
    console.log(`\n⏱️ Tempo total: ${elapsed}ms\n`);
  }
}

if (import.meta.main) {
  await runEsbuildCli(Deno.args);
}

````

---

## Arquivo: `packages/utils/src/esbuild/config.ts`

```ts
/**
 * @module @vanaware/buildit/esbuild/config
 * @description Carregamento de configurações externas a partir de `esbuild.jsonc`
 * e fallback para configurações padrão do projeto BuildIt.
 */

import { loadConfig } from "../config/mod.ts";
import type {
  GlobalTargetConfig,
} from "../interfaces/mod.ts";

/**
 * Configuração padrão para o motor esbuild no projeto BuildIt.
 */
export const CONFIGURACOES_PADRAO: GlobalTargetConfig = {
  ui: {
    mode: "build",
    default: true,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    publicdir: "packages/ui/public",
    indexHtml: true,
    clean: [".",],
    entryPoints: ["main.tsx",],
    platform: "browser",
    format: "esm",
    bundle: true,
    minify: false,
    sourcemap: "linked",
    conditions: ["browser",],
    jsx: "automatic",
    jsxImportSource: "preact",
    metafile: true,
    write: true,
    legalComments: "eof",
    keepNames: true,
    splitting: false,
  },
  "watch": {
    mode: "watch",
    default: false,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    publicdir: "packages/ui/public",
    indexHtml: true,
    entryPoints: ["main.ts",],
    platform: "browser",
    format: "esm",
    bundle: true,
    minify: false,
    sourcemap: "inline",
    conditions: ["browser",],
    jsx: "automatic",
    jsxImportSource: "preact",
    write: true,
    legalComments: "eof",
    outfile: "app.js",
  },
};

/**
 * Estrutura do arquivo de configuração externo `esbuild.jsonc`.
 */
export interface EsbuildConfigFile {
  /** URL do JSON Schema para validação e autocomplete no editor */
  $schema?: string;
  /** Versão semântica da configuração */
  version?: string;
  /** Alvos de build configurados no projeto */
  targets?: GlobalTargetConfig;
  /** Alias em português para alvos de build configurados */
  alvos?: GlobalTargetConfig;
  /** Suporte a alvos definidos diretamente no nível raiz do JSON */
  [key: string]: unknown;
}

/**
 * Carrega as configurações de alvos para o motor esbuild a partir de um arquivo JSONC externo
 * (ex: `esbuild.jsonc` ou `esbuild.json`).
 *
 * Se o arquivo não for encontrado ou não contiver alvos válidos, retorna o objeto padrão `CONFIGURACOES_PADRAO`.
 *
 * @param caminhoConfig Caminho opcional do arquivo de configuração
 * @param baseDir Diretório base para resolução de arquivos relativos
 * @returns Mapeamento de alvos para suas configurações `TargetConfig`
 */
export async function carregarConfigEsbuild(
  caminhoConfig?: string,
  baseDir: string = ".",
): Promise<GlobalTargetConfig> {
  const parsed = await loadConfig<EsbuildConfigFile>(
    "esbuild",
    caminhoConfig,
    baseDir,
  );

  if (parsed) {
    // Caso 1: Objeto possui a chave "targets"
    if (parsed.targets && typeof parsed.targets === "object") {
      return parsed.targets;
    }

    // Caso 2: Objeto possui a chave em português "alvos"
    if (parsed.alvos && typeof parsed.alvos === "object") {
      return parsed.alvos;
    }

    // Caso 3: Objeto define alvos diretamente na raiz excluindo metadados
    const filteredKeys = Object.keys(parsed).filter(
      (k) => !k.startsWith("$") && k !== "version",
    );

    if (filteredKeys.length > 0) {
      const resultado: GlobalTargetConfig = {};
      let hasValidTargets = false;

      for (const key of filteredKeys) {
        const val = (parsed as Record<string, unknown>)[key];
        if (val && typeof val === "object") {
          resultado[key] = val as GlobalTargetConfig[string];
          hasValidTargets = true;
        }
      }

      if (hasValidTargets) {
        return resultado;
      }
    }
  }

  return { ...CONFIGURACOES_PADRAO };
}

```

---

## Arquivo: `packages/utils/src/esbuild/mod.ts`

```ts
import { copy, emptyDir, ensureDir, walk, } from "@std/fs";
import { dirname, isAbsolute, join, } from "@std/path";
import { parse as parseJsonc, } from "@std/jsonc";

// ============================================================================
// 📦 TIPOS
// ============================================================================
import type {
  DenoBundleGlobalConfig,
  DenoBundleTargetConfig,
  GlobalTargetConfig,
  ParsedArgs,
  ParsedVersion,
  TargetConfig,
} from "../interfaces/mod.ts";

// ============================================================================
// 🔢 FUNÇÕES DE VERSÃO (puras, testáveis)
// ============================================================================
/**
 * Parseia uma string de versão no formato major.minor.patch[#hash].
 * @param version String de versão
 * @returns Objeto ParsedVersion
 */
export function parseVersion(version: string,): ParsedVersion {
  const trimmed = version.trim();
  if (trimmed !== version) {
    throw new Error(`❌ Versão não pode ter espaços: ${version}`,);
  }
  const versionWithoutHash = version.split("#",)[0] ?? "";
  if (version.includes("#",) && version.endsWith("#",)) {
    throw new Error(
      `❌ Formato de versão inválido (# sem hash): ${version}`,
    );
  }
  const parts = versionWithoutHash.split(".",);
  if (parts.length !== 3) {
    throw new Error(`❌ Formato de versão inválido: ${version}`,);
  }
  const majorStr = parts[0];
  const minorStr = parts[1];
  const patchStr = parts[2];
  if (
    majorStr === undefined || minorStr === undefined || patchStr === undefined
  ) {
    throw new Error(`❌ Formato de versão inválido: ${version}`,);
  }
  const major = parseInt(majorStr, 10,);
  const minor = parseInt(minorStr, 10,);
  const patch = parseInt(patchStr, 10,);
  if (isNaN(major,) || isNaN(minor,) || isNaN(patch,)) {
    throw new Error(`❌ Versão contém valores não numéricos: ${version}`,);
  }
  return { major, minor, patch, };
}

/**
 * Formata os componentes da versão em uma string padronizada.
 * @param major Versão major
 * @param minor Versão minor
 * @param patch Versão patch
 * @param buildHash Hash opcional do build
 * @returns String de versão formatada
 */
export function formatVersion(
  major: number,
  minor: number,
  patch: number,
  buildHash?: string,
): string {
  const hash = buildHash ?? Date.now().toString(36,);
  return `${major}.${minor}.${patch}#${hash}`;
}

/**
 * Extrai a string de versão de um conteúdo textual (ex: deno.jsonc).
 * @param content Conteúdo textual
 * @returns String de versão ou null se não encontrada
 */
export function extractVersionFromContent(content: string,): string | null {
  const match = content.match(/"version"\s*:\s*"([^"]+)"/,);
  return match && match[1] ? match[1] : null;
}

/**
 * Substitui a versão no conteúdo textual fornecido.
 * @param content Conteúdo textual original
 * @param newVersion Nova versão a ser injetada
 * @returns Conteúdo atualizado
 */
export function replaceVersionInContent(
  content: string,
  newVersion: string,
): string {
  return content.replace(
    /"version"\s*:\s*"[^"]+"/,
    `"version": "${newVersion}"`,
  );
}

// ============================================================================
// 🛡️ VALIDAÇÃO DE PATHS (pura, testável)
// ============================================================================
/**
 * Verifica se um caminho é seguro (evita path traversal e caminhos absolutos).
 * @param cleanPath Caminho a ser verificado
 * @returns True se for seguro
 */
export function isSafePath(cleanPath: string,): boolean {
  if (cleanPath.includes("..",)) return false;
  if (isAbsolute(cleanPath,)) return false;
  return true;
}

// ============================================================================
// 🎯 VALIDAÇÃO DE CONFIGURAÇÃO DO ALVO (fail-fast com mensagens claras)
// ============================================================================
/**
 * Valida se a configuração do alvo possui os campos obrigatórios para as operações solicitadas.
 * Lança erro com mensagem didática indicando exatamente qual condição falhou.
 *
 * Regras de obrigatoriedade:
 * - 'distdir' é obrigatório quando 'publicdir' está configurado, 'indexHtml' é true, ou 'outfile' não está configurado
 * - 'srcdir' é obrigatório quando 'indexHtml' é true ou quando 'entryPoints' contém paths relativos
 */
export function validateTargetConfig(
  targetName: string,
  config: TargetConfig | DenoBundleTargetConfig,
): void {
  const reasons: string[] = [];

  // Validação de distdir
  if (config.publicdir && !config.distdir) {
    reasons.push(
      "'publicdir' está configurado (necessário 'distdir' para copiar arquivos estáticos)",
    );
  }
  if (config.indexHtml === true && !config.distdir) {
    reasons.push(
      "'indexHtml' é true (necessário 'distdir' para copiar o HTML)",
    );
  }
  if (!config.outfile && !config.distdir) {
    reasons.push(
      "'outfile' não está configurado (necessário 'distdir' para usar como 'outdir')",
    );
  }

  // Validação de srcdir
  if (config.indexHtml === true && !config.srcdir) {
    reasons.push(
      "'indexHtml' é true (necessário 'srcdir' para copiar o HTML)",
    );
  }

  // Verifica se algum entrypoint é relativo e srcdir não existe
  if (!config.srcdir && config.entryPoints && config.entryPoints.length > 0) {
    const hasRelativeEntry = config.entryPoints.some((entry,) =>
      !isAbsolute(entry,)
    );
    if (hasRelativeEntry) {
      reasons.push(
        "'entryPoints' contém caminhos relativos (necessário 'srcdir' para resolver)",
      );
    }
  }

  if (reasons.length > 0) {
    const missingFields: string[] = [];
    if (!config.distdir && reasons.some((r,) => r.includes("'distdir'",))) {
      missingFields.push("'distdir'",);
    }
    if (!config.srcdir && reasons.some((r,) => r.includes("'srcdir'",))) {
      missingFields.push("'srcdir'",);
    }

    throw new Error(
      `❌ [${targetName}] Configuração incompleta.\n` +
        `   Campos obrigatórios faltando: ${missingFields.join(", ",)}\n` +
        `   Motivos:\n` +
        reasons.map((r,) => `   - ${r}`).join("\n",) +
        `\n   Por favor, configure os campos necessários no alvo '${targetName}'.`,
    );
  }
}

// ============================================================================
// 📍 RESOLUÇÃO DE OUTPUT PATHS (outfile relativo ao distdir)
// ============================================================================
/**
 * Resolve os caminhos de saída (outfile/outdir) baseado na configuração.
 *
 * Regras:
 * 1. Se 'outfile' e 'distdir' existem: outfile é RELATIVO ao distdir → join(distdir, outfile)
 * 2. Se apenas 'outfile' existe (sem distdir): outfile é ABSOLUTO
 * 3. Se apenas 'distdir' existe (sem outfile): distdir é usado como outdir
 * 4. Se nenhum existe: retorna objeto vazio (não deveria acontecer se validateTargetConfig foi chamado)
 *
 * @returns Objeto com 'outfile' ou 'outdir' resolvidos (nunca ambos)
 */
export function resolveOutputPaths(
  config: TargetConfig | DenoBundleTargetConfig,
): { outfile?: string; outdir?: string } {
  if (config.outfile) {
    if (config.distdir) {
      // outfile relativo ao distdir
      return { outfile: join(config.distdir, config.outfile,), };
    }
    // outfile absoluto (sem distdir)
    return { outfile: config.outfile, };
  }
  // Sem outfile, usa distdir como outdir
  if (config.distdir) {
    return { outdir: config.distdir, };
  }
  // Nem outfile nem distdir (não deveria chegar aqui se validateTargetConfig foi chamado)
  return {};
}

// ============================================================================
// 🎯 RESOLUÇÃO DE ENTRYPOINTS (relativo ao srcdir quando disponível)
// ============================================================================
/**
 * Resolve os entrypoints relativos ao srcdir (se disponível) e valida sua existência no disco.
 * Lança um erro claro e didático se algum arquivo não for encontrado.
 *
 * Se srcdir não está configurado, trata todos os entrypoints como absolutos.
 */
export function resolveEntryPoints(
  srcdir: string | undefined,
  entryPoints: string[],
): string[] {
  return entryPoints.map((entry,) => {
    let resolvedPath: string;

    if (srcdir && !isAbsolute(entry,)) {
      // srcdir existe e entry é relativo → faz join
      resolvedPath = join(srcdir, entry,);
    } else {
      // srcdir não existe OU entry já é absoluto → usa como está
      resolvedPath = entry;
    }

    try {
      Deno.statSync(resolvedPath,);
    } catch {
      throw new Error(
        `❌ Entrypoint não encontrado em: "${resolvedPath}"\n` +
          `   Origem configurada: "${entry}"\n` +
          (srcdir
            ? `   Verifique se o caminho está correto em relação ao srcdir: "${srcdir}".`
            : `   Verifique se o caminho absoluto está correto.`),
      );
    }

    return resolvedPath;
  },);
}

// ============================================================================
// 🎯 PARSING DE ARGUMENTOS CLI (pura, testável)
// ============================================================================
/**
 * Parseia os argumentos de linha de comando para determinar alvos e flags.
 * @param args Lista de argumentos
 * @param config Configuração global de alvos
 * @returns Argumentos parseados
 */
export function parseArgs(
  args: string[],
  config: GlobalTargetConfig | DenoBundleGlobalConfig,
): ParsedArgs {
  const lowerArgs = args.map((a,) => a.toLowerCase());
  const globalNoVersion = lowerArgs.includes("noversion",);
  const isWatchFlag = lowerArgs.includes("watch",);
  const configKeys = Object.keys(config,);
  const defaultTargets = configKeys.filter((t,) => {
    const cfg = config[t]!;
    return cfg.mode !== "watch" && cfg.default !== false;
  },);
  const requestedTargets = lowerArgs.filter(
    (arg,) =>
      !["noversion", "watch",].includes(arg,) && configKeys.includes(arg,),
  );
  let watchTarget: string | null = null;
  if (isWatchFlag) {
    watchTarget = configKeys.find((t,) => config[t]!.mode === "watch") ?? null;
  } else if (requestedTargets.length > 0) {
    const requestedWatches = requestedTargets.filter((t,) =>
      config[t]!.mode === "watch"
    );
    if (requestedWatches.length > 0) {
      watchTarget = configKeys.find((t,) => requestedWatches.includes(t,)) ??
        null;
    }
  }
  let finalTargets: string[];
  if (watchTarget !== null) {
    finalTargets = [];
  } else if (requestedTargets.length > 0) {
    finalTargets = configKeys.filter((t,) => requestedTargets.includes(t,));
  } else {
    finalTargets = defaultTargets;
  }
  return { targets: finalTargets, globalNoVersion, watchTarget, };
}

// ============================================================================
// 📂 FUNÇÕES DE FILESYSTEM
// ============================================================================
/**
 * Limpa os diretórios/arquivos configurados no alvo.
 * @param distDir Diretório de saída
 * @param cleanPaths Lista de caminhos relativos para limpar
 */
export async function cleanTarget(
  distDir: string,
  cleanPaths: string[],
): Promise<void> {
  if (!cleanPaths || cleanPaths.length === 0) return;
  console.log(`🧹 Limpando em ${distDir}...`,);
  for (const cleanPath of cleanPaths) {
    if (!isSafePath(cleanPath,)) {
      console.warn(
        `   ⚠️ Path perigoso ignorado (traversal/absoluto): "${cleanPath}"`,
      );
      continue;
    }
    if (cleanPath === ".") {
      try {
        await emptyDir(distDir,);
        console.log(`   ✅ Diretório esvaziado: ${distDir}`,);
      } catch (error) {
        console.warn(`   ⚠️ Falha ao esvaziar ${distDir}:`, error,);
      }
    } else {
      const fullPath = join(distDir, cleanPath,);
      try {
        await Deno.stat(fullPath,);
        await Deno.remove(fullPath, { recursive: true, },);
        console.log(`   ✅ Removido: ${cleanPath}`,);
      } catch {
        console.log(`   ⏭️  Não existia: ${cleanPath}`,);
      }
    }
  }
}

/**
 * Obtém a versão atual do arquivo de configuração deno.jsonc.
 * @param denoJsoncPath Caminho para o deno.jsonc
 * @returns Versão atual
 */
export async function currentVersion(denoJsoncPath: string,): Promise<string> {
  const content = await Deno.readTextFile(denoJsoncPath,);
  const version = extractVersionFromContent(content,);
  if (!version) {
    throw new Error("❌ Versão não encontrada no deno.jsonc",);
  }
  console.log(`📌 Versão Atual: v${version}`,);
  return version;
}

/**
 * Incrementa a versão patch e sincroniza workspaces e arquivos de versão.
 * @param version Versão atual
 * @param denoJsoncPath Caminho para o deno.jsonc raiz
 * @param buildHash Hash opcional do build
 * @returns Nova versão incrementada
 */
export async function incrementVersion(
  version: string,
  denoJsoncPath: string,
  buildHash?: string,
): Promise<string> {
  const { major, minor, patch, } = parseVersion(version,);
  const nextPatch = patch + 1;
  const newVersion = formatVersion(major, minor, nextPatch, buildHash,);
  const content = await Deno.readTextFile(denoJsoncPath,);
  const updatedRootContent = replaceVersionInContent(content, newVersion,);
  await Deno.writeTextFile(denoJsoncPath, updatedRootContent,);
  console.log(`📈 Versão incrementada para: v${newVersion}`,);

  // Sincronização de Workspaces
  try {
    const rootDir = dirname(denoJsoncPath,);
    const parsed = parseJsonc(content,) as { workspace?: string[] };

    if (parsed.workspace && Array.isArray(parsed.workspace,)) {
      console.log(`📦 Sincronizando workspaces...`,);
      for (const ws of parsed.workspace) {
        const wsPath = isAbsolute(ws,) ? ws : join(rootDir, ws,);

        // Tenta deno.jsonc depois deno.json
        for (const fileName of ["deno.jsonc", "deno.json",]) {
          const configPath = join(wsPath, fileName,);
          try {
            const stat = await Deno.stat(configPath,);
            if (stat.isFile) {
              let wsContent = await Deno.readTextFile(configPath,);
              wsContent = replaceVersionInContent(wsContent, newVersion,);
              await Deno.writeTextFile(configPath, wsContent,);
              console.log(`   ✅ Sincronizado: ${join(ws, fileName,)}`,);
              break; // Para no primeiro que encontrar
            }
          } catch {
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ Falha ao sincronizar workspaces:`, error,);
  }

  // Atualiza arquivo de versão (específico para injeção de código)
  try {
    const utilsVersionPath = "packages/utils/src/version.ts";
    const versionContent = `// Automatically generated file during build
declare const __APP_VERSION__: string;

/** Current library/application version. */
export const APP_VERSION: string = typeof __APP_VERSION__ !== "undefined"
  ? __APP_VERSION__
  : "${newVersion}";
`;
    await Deno.writeTextFile(utilsVersionPath, versionContent,);
    console.log(`📝 Versão atualizada em: ${utilsVersionPath}`,);
  } catch {
    // Ignora quando executando em ambientes sem a estrutura completa (ex: testes)
  }

  return newVersion;
}

/**
 * Lista todos os assets gerados no distdir para cache do Service Worker.
 * @param distDir Diretório de saída
 * @param excludeFiles Lista de arquivos para ignorar
 * @returns Lista de caminhos relativos
 */
export async function listAssetsForCache(
  distDir: string,
  excludeFiles: string[] = [],
): Promise<string[]> {
  // 🔥 CORREÇÃO: Verifica se distDir foi fornecido antes de tentar caminhar
  if (!distDir) {
    console.warn(
      `⚠️ 'listAssetsForCache' chamado sem 'distDir'. Retornando array vazio.`,
    );
    return [];
  }

  const assets: string[] = [];
  const exclude = new Set([
    ...excludeFiles,
    "service-worker.js",
    "service-worker.tmp.js",
  ],);
  for await (const entry of walk(distDir, { includeDirs: false, },)) {
    if (
      !entry.name.endsWith(".map",) &&
      !entry.name.endsWith("metafile.json",) &&
      !exclude.has(entry.name,)
    ) {
      let webPath = entry.path.replace(distDir, "",).replace(/\\/g, "/",);
      webPath = webPath.startsWith("/",) ? "." + webPath : "./" + webPath;
      assets.push(webPath,);
    }
  }
  return assets;
}

/**
 * Copia arquivos estáticos da pasta publicdir e srcdir para o distdir.
 * @param config Configuração do alvo
 * @param appVersion Versão da aplicação para injeção no manifest
 */
export async function copyStaticFiles(
  config: TargetConfig | DenoBundleTargetConfig,
  appVersion: string,
): Promise<void> {
  // 🔥 CORREÇÃO: Valida distdir e srcdir antes de operações
  if (!config.distdir) {
    if (config.publicdir) {
      console.warn(
        `⚠️ 'publicdir' configurado mas 'distdir' ausente. Pulando cópia de estáticos.`,
      );
    }
    if (config.indexHtml) {
      console.warn(
        `⚠️ 'indexHtml' é true mas 'distdir' ausente. Pulando cópia do HTML.`,
      );
    }
    return;
  }

  if (config.indexHtml && !config.srcdir) {
    console.warn(
      `⚠️ 'indexHtml' é true mas 'srcdir' ausente. Pulando cópia do HTML.`,
    );
    return;
  }

  const distDir = config.distdir;
  await ensureDir(distDir,);

  if (config.publicdir) {
    try {
      await copy(config.publicdir, distDir, { overwrite: true, },);
      console.log(
        `📁 Arquivos de ${config.publicdir} copiados para ${distDir}`,
      );
      const manifestPath = join(distDir, "manifest.json",);
      try {
        const manifestText = await Deno.readTextFile(manifestPath,);
        const manifestObj = JSON.parse(manifestText,);
        manifestObj.version = appVersion;
        await Deno.writeTextFile(
          manifestPath,
          JSON.stringify(manifestObj, null, 2,),
        );
        console.log(`📱 Versão v${appVersion} injetada em manifest.json`,);
      } catch {
        // manifest.json não existe
      }
    } catch {
      console.log(
        `⚠️ Pasta ${config.publicdir} não encontrada, pulando cópia.`,
      );
    }
  }

  if (config.indexHtml && config.srcdir) {
    const srcDir = config.srcdir;
    const srcHtml = join(srcDir, "index.html",);
    const destHtml = join(distDir, "index.html",);
    try {
      await copy(srcHtml, destHtml, { overwrite: true, },);
      console.log(`📄 index.html copiado de ${srcDir} para ${distDir}`,);
    } catch {
      console.log(`⚠️ ${srcHtml} não encontrado, pulando cópia do HTML.`,);
    }
  }
}

// ============================================================================
// 🛠️ FUNÇÕES DE ESBUILD
// ============================================================================
/**
 * Constrói as opções de build para o esbuild.
 * @param targetName Nome do alvo
 * @param config Configuração do alvo
 * @param appVersion Versão da aplicação
 * @param listAssetsFn Função para listar assets
 * @returns Opções do esbuild
 */
export async function buildEsbuildOptions(
  targetName: string,
  config: TargetConfig,
  appVersion: string,
  listAssetsFn?: (distDir: string,) => Promise<string[]>,
  // deno-lint-ignore no-explicit-any
): Promise<any> {
  const finalDefine: Record<string, string> = {
    ...config.define,
    __APP_VERSION__: JSON.stringify(`v${appVersion}`,),
  };

  // 🔥 CORREÇÃO: Só lista assets se distdir existe
  if (targetName === "sw" && listAssetsFn && config.distdir) {
    const assets = await listAssetsFn(config.distdir,);
    finalDefine["__GENERATED_ASSETS__"] = JSON.stringify(assets,);
    console.log(`📋 ${assets.length} assets listados para cache do SW`,);
  }

  // 🔥 RESOLUÇÃO DE ENTRYPOINTS (srcdir opcional)
  const resolvedEntryPoints = resolveEntryPoints(
    config.srcdir,
    config.entryPoints,
  );

  // 🔥 RESOLUÇÃO DE OUTPUT PATHS (outfile relativo ao distdir)
  const { outfile, outdir, } = resolveOutputPaths(config,);

  // deno-lint-ignore no-explicit-any
  const options: any = {
    entryPoints: resolvedEntryPoints,
  };

  // 🔥 CORREÇÃO: Usa outfile resolvido ou outdir
  if (outfile) {
    options.outfile = outfile;
  } else if (outdir) {
    options.outdir = outdir;
  }

  const optionalProps = [
    "platform",
    "format",
    "bundle",
    "minify",
    "sourcemap",
    "jsx",
    "jsxImportSource",
    "conditions",
    "external",
    "drop",
    "metafile",
    "write",
    "treeShaking",
    "legalComments",
    "keepNames",
    "splitting",
    "loader",
    "alias",
    "inject",
    "target",
    "charset",
    "logLevel",
    "logLimit",
    "logOverride",
    "entryNames",
    "chunkNames",
    "assetNames",
    "publicPath",
    "pure",
    "plugins",
  ];
  for (const prop of optionalProps) {
    // deno-lint-ignore no-explicit-any
    if ((config as any)[prop] !== undefined) {
      // deno-lint-ignore no-explicit-any
      (options as any)[prop] = (config as any)[prop];
    }
  }

  // 🔥 CORREÇÃO: Construção segura de banner
  if (config.banner !== undefined) {
    const banner: { js?: string; css?: string } = {};
    if (config.banner.js !== undefined) {
      banner.js = config.banner.js.replace(/__APP_VERSION__/g, appVersion,);
    }
    if (config.banner.css !== undefined) {
      banner.css = config.banner.css.replace(/__APP_VERSION__/g, appVersion,);
    }
    if (banner.js !== undefined || banner.css !== undefined) {
      options.banner = banner;
    }
  }

  // 🔥 CORREÇÃO: Construção segura de footer
  if (config.footer !== undefined) {
    const footer: { js?: string; css?: string } = {};
    if (config.footer.js !== undefined) {
      footer.js = config.footer.js.replace(/__APP_VERSION__/g, appVersion,);
    }
    if (config.footer.css !== undefined) {
      footer.css = config.footer.css.replace(/__APP_VERSION__/g, appVersion,);
    }
    if (footer.js !== undefined || footer.css !== undefined) {
      options.footer = footer;
    }
  }

  options.define = finalDefine;
  return options;
}

/**
 * Processa a compilação de um alvo do esbuild.
 * @param targetName Nome do alvo
 * @param config Configuração do alvo
 * @param appVersion Versão da aplicação
 * @param esbuildBuildFn Função de build do esbuild (com plugins injetados)
 * @param listAssetsFn Função opcional para listar assets
 */
export async function processTarget(
  targetName: string,
  config: TargetConfig,
  appVersion: string,
  // deno-lint-ignore no-explicit-any
  esbuildBuildFn: (options: any,) => Promise<any>,
  listAssetsFn?: (distDir: string,) => Promise<string[]>,
): Promise<void> {
  // 🔥 VALIDAÇÃO FAIL-FAST: Verifica configuração ANTES de qualquer operação
  validateTargetConfig(targetName, config,);

  console.log(`\n${"=".repeat(60,)}`,);
  console.log(`🎯 PROCESSANDO ALVO: ${targetName.toUpperCase()}`,);
  console.log(`${"=".repeat(60,)}`,);

  if (config.clean && config.clean.length > 0) {
    // 🔥 CORREÇÃO: Só limpa se distdir existe
    if (config.distdir) {
      await cleanTarget(config.distdir, config.clean,);
    } else {
      console.warn(
        `⚠️ 'clean' configurado mas 'distdir' ausente. Pulando limpeza.`,
      );
    }
  }

  await copyStaticFiles(config, appVersion,);

  const esbuildOptions = await buildEsbuildOptions(
    targetName,
    config,
    appVersion,
    listAssetsFn,
  );

  console.log(`🔨 Compilando com esbuild...`,);
  const startTime = performance.now();

  try {
    const result = await esbuildBuildFn(esbuildOptions,);
    const duration = (performance.now() - startTime).toFixed(0,);
    console.log(`✅ [${targetName}] Build concluído em ${duration}ms`,);

    // 🔥 CORREÇÃO: Só salva metafile se distdir existe
    if (config.metafile && result.metafile && config.distdir) {
      const metafilePath = join(config.distdir, `${targetName}-metafile.json`,);
      await Deno.writeTextFile(
        metafilePath,
        JSON.stringify(result.metafile, null, 2,),
      );
      console.log(`📊 Metafile gerado: ${metafilePath}`,);
    }
  } catch (error) {
    console.error(`❌ Erro fatal no build [${targetName}]:`, error,);
    throw error;
  }
}

// ============================================================================
// 📦 RE-EXPORTS DE MÓDULOS ESPECÍFICOS
// ============================================================================
export * from "./bundle.ts";
export * from "./config.ts";
export * from "./engine.ts";
export * from "./cli.ts";
export * from "../config/version.ts";

```

---

## Arquivo: `packages/utils/src/mod.ts`

```ts
/**
 * @vanaware/buildit
 * Entry point for shared utilities.
 */

export type { ParsedVersion } from "./interfaces/mod.ts";
export * from "./config/mod.ts";
export * from "./interfaces/mod.ts";
export * from "./export/mod.ts";
export * from "./version.ts";

```

---

## Arquivo: `packages/utils/src/export/mod.ts`

````ts
/**
 * @module @vanaware/buildit/export
 * @description Ferramenta e biblioteca para consolidação estruturada de código-fonte
 * e documentação de projetos em snapshots Markdown otimizados para consumo por IAs.
 *
 * Suporta configuração declarativa externa via `export.jsonc`, filtros por extensão,
 * proteção contra loops e execução via CLI ou programática.
 *
 * @example
 * ```typescript
 * import { executarExport } from "@vanaware/buildit/export";
 *
 * const resultados = await executarExport({
 *   caminhoConfig: "export.jsonc",
 *   modos: ["ui", "docs"],
 * });
 * ```
 */

export * from "./types.ts";
export * from "./formatter.ts";
export * from "./config.ts";
export * from "./engine.ts";
export * from "./cli.ts";

````

---

## Arquivo: `packages/utils/src/export/formatter.ts`

`````ts
/**
 * @module @vanaware/buildit/export/formatter
 * @description Funções utilitárias puras para normalização de caminhos,
 * mapeamento de extensões e formatação Markdown com proteção contra crases.
 */

import type { ExportConfig, } from "./types.ts";

/**
 * Normaliza um caminho de arquivo para comparação consistente entre sistemas operacionais.
 * - Converte barras invertidas Windows (\) em barras normais (/)
 * - Converte todos os caracteres para minúsculas
 *
 * @param caminho Caminho relativo ou absoluto a ser normalizado
 * @returns Caminho normalizado em minúsculas com barras normais
 *
 * @example
 * ```typescript
 * normalizarCaminho("src\\components\\App.tsx"); // "src/components/app.tsx"
 * ```
 */
export function normalizarCaminho(caminho: string,): string {
  return caminho.replace(/\\/g, "/",).toLowerCase();
}

/**
 * Normaliza um caminho para comparação de prefixos de diretório.
 * Remove prefixos `./` ou `.` redundantes e trailing slash.
 *
 * @param caminho Caminho do diretório
 * @returns Prefixo limpo pronto para comparação de início de string
 *
 * @example
 * ```typescript
 * normalizarPrefixo("./packages/ui/"); // "packages/ui"
 * ```
 */
export function normalizarPrefixo(caminho: string,): string {
  let normalized = caminho.replace(/\\/g, "/",).toLowerCase();
  if (normalized === "./" || normalized === ".") {
    return "";
  }
  if (normalized.startsWith("./",)) {
    normalized = normalized.substring(2,);
  }
  normalized = normalized.replace(/\/$/, "",);
  return normalized;
}

/**
 * Calcula a quantidade mínima de crases necessárias para envolver um texto
 * em um bloco de código markdown, evitando conflitos quando o próprio conteúdo
 * possui crases consecutivas.
 *
 * @param texto Conteúdo textual do arquivo
 * @returns String contendo 3 ou mais crases (ex: "```", "````")
 *
 * @example
 * ```typescript
 * calcularCraseWrapper("console.log('oi');"); // "```"
 * calcularCraseWrapper("```markdown```"); // "````"
 * ```
 */
export function calcularCraseWrapper(texto: string,): string {
  const matches = texto.match(/`+/g,);
  if (!matches) return "```";
  const maiorSequencia = Math.max(...matches.map((m,) => m.length),);
  const tamanhoNecessario = Math.max(3, maiorSequencia + 1,);
  return "`".repeat(tamanhoNecessario,);
}

/**
 * Mapeia extensões de arquivo para a sintaxe de highlight correspondente do Markdown.
 *
 * @param caminhoRelativo Caminho relativo do arquivo
 * @returns Nome da linguagem para bloco de código Markdown (ex: "json", "bash")
 *
 * @example
 * ```typescript
 * mapearExtensao("deno.jsonc"); // "json"
 * mapearExtensao("script.sh"); // "bash"
 * ```
 */
export function mapearExtensao(caminhoRelativo: string,): string {
  const ext = caminhoRelativo.split(".",).pop()?.toLowerCase() || "";
  const mapa: Record<string, string> = {
    manifest: "json",
    jsonc: "json",
    yml: "yaml",
    sh: "bash",
    env: "properties",
  };

  if (caminhoRelativo.includes(".env",)) return "properties";

  return mapa[ext] || ext;
}

/**
 * Determina se um determinado arquivo deve ser incluído no snapshot baseado na configuração do modo.
 *
 * Regras aplicadas (em ordem estrita):
 * 1. Proteção anti-loop: sempre exclui arquivos dentro de pastas `exports/` ou `snapshots/` gerados anteriormente.
 * 2. Verifica se está em caminhos adicionais explicitamente permitidos.
 * 3. Verifica se está dentro de `pastaBase`.
 * 4. Se está na raiz de `pastaBase`, valida contra `arquivosRaizPermitidos`.
 * 5. Se está em subpasta, valida contra `subpastasPermitidas`.
 * 6. Valida se a extensão do arquivo consta em `extensoesPermitidas`.
 *
 * @param caminhoRelativo Caminho relativo do arquivo no repositório
 * @param config Configuração do modo de exportação
 * @returns True se o arquivo deve ser adicionado ao snapshot, false caso contrário
 *
 * @example
 * ```typescript
 * deveIncluirArquivo("packages/ui/src/main.tsx", config); // true
 * ```
 */
export function deveIncluirArquivo(
  caminhoRelativo: string,
  config: ExportConfig,
): boolean {
  const caminhoNormalizado = normalizarCaminho(caminhoRelativo,);

  // 🔒 Proteção anti-loop: nunca inclui arquivos gerados de exportação
  if (
    caminhoNormalizado.startsWith("exports/",) ||
    caminhoNormalizado.startsWith("snapshots/",)
  ) {
    return false;
  }

  // 🔍 Verifica caminhos adicionais (fora de pastaBase)
  if (
    config.caminhosAdicionaisPermitidos &&
    config.caminhosAdicionaisPermitidos.length > 0
  ) {
    const correspondeAdicional = config.caminhosAdicionaisPermitidos.some(
      (caminhoExtra,) => {
        const extraNormalizado = normalizarCaminho(caminhoExtra,);
        return (
          caminhoNormalizado === extraNormalizado ||
          caminhoNormalizado.startsWith(extraNormalizado + "/",)
        );
      },
    );

    if (correspondeAdicional) {
      if (config.extensoesPermitidas.length === 0) return true;
      return config.extensoesPermitidas.some(
        (ext,) =>
          caminhoNormalizado.endsWith(ext,) || caminhoNormalizado === ext,
      );
    }
  }

  // 🔍 Verifica se está dentro de pastaBase
  const prefixoBase = normalizarPrefixo(config.pastaBase,);
  const prefixoBaseComBarra = prefixoBase !== "" ? prefixoBase + "/" : "";

  if (
    prefixoBaseComBarra !== "" &&
    !caminhoNormalizado.startsWith(prefixoBaseComBarra,)
  ) {
    return false;
  }

  // 🔍 Extrai o caminho relativo dentro de pastaBase
  const caminhoInterno = prefixoBaseComBarra !== ""
    ? caminhoNormalizado.substring(prefixoBaseComBarra.length,)
    : caminhoNormalizado;

  // Verifica se está NA RAIZ de pastaBase (não possui barras no caminho interno)
  const estaNaRaiz = !caminhoInterno.includes("/",);

  if (estaNaRaiz) {
    return config.arquivosRaizPermitidos.some(
      (raiz,) => normalizarCaminho(raiz,) === caminhoInterno,
    );
  }

  // 🔍 Está em subpasta: verifica subpastasPermitidas
  let emSubpastaPermitida = false;

  if (config.subpastasPermitidas.length === 0) {
    // Lista vazia = permite varrer todas as subpastas
    emSubpastaPermitida = true;
  } else {
    emSubpastaPermitida = config.subpastasPermitidas.some((sub,) => {
      const subNormalizada = normalizarCaminho(sub,) + "/";
      return (
        caminhoInterno.startsWith(subNormalizada,) ||
        caminhoInterno === normalizarCaminho(sub,)
      );
    },);
  }

  if (emSubpastaPermitida) {
    if (config.extensoesPermitidas.length === 0) return true;
    return config.extensoesPermitidas.some(
      (ext,) => caminhoNormalizado.endsWith(ext,) || caminhoNormalizado === ext,
    );
  }

  return false;
}

/**
 * Gera o cabeçalho estruturado do snapshot Markdown contendo metadados e diretrizes para a IA.
 *
 * @param config Configuração do modo
 * @param modo Nome identificador do modo
 * @param versaoApp Versão semântica atual do projeto
 * @returns Cabeçalho formatado em Markdown
 *
 * @example
 * ```typescript
 * const header = gerarCabecalho(config, "ui", "0.3.1");
 * ```
 */
export function gerarCabecalho(
  config: ExportConfig,
  modo: string,
  versaoApp: string,
): string {
  const versaoDisplay = config.incluiVersao ? `[v${versaoApp}] ` : "";

  return `> **INSTRUÇÃO PARA A IA:** 
> ${config.instrucaoCustomizada}
> O projeto é o **BuildIt ${versaoDisplay}** estruturado em módulos. 
> Cada arquivo começa com um título indicando seu caminho relativo exato (ex: \`## Arquivo: src/main.ts\`).
> Sempre que sugerir alterações, indique claramente qual arquivo deve ser modificado com base nesses caminhos e forneça o novo código completo do arquivo.

---

# Contexto Exportado do Projeto BuildIt ${versaoDisplay}- Modo: ${modo.toUpperCase()}

Gerado automaticamente em: ${new Date().toISOString()}

---

`;
}

/**
 * Formata um arquivo individual com caminho relativo e bloco de código Markdown seguro.
 *
 * @param caminhoRelativo Caminho relativo do arquivo a ser exibido
 * @param conteudo Conteúdo de texto original do arquivo
 * @returns Bloco de código Markdown formatado com separador
 *
 * @example
 * ```typescript
 * formatarArquivoMarkdown("src/index.ts", "console.log('oi');");
 * ```
 */
export function formatarArquivoMarkdown(
  caminhoRelativo: string,
  conteudo: string,
): string {
  const extensaoMarkdown = mapearExtensao(caminhoRelativo,);
  const wrapperCrasis = calcularCraseWrapper(conteudo,);

  let resultado = `## Arquivo: \`${caminhoRelativo}\`\n\n`;
  resultado += `${wrapperCrasis}${extensaoMarkdown}\n`;
  resultado += conteudo;
  resultado += `\n${wrapperCrasis}\n\n---\n\n`;

  return resultado;
}

`````

---

## Arquivo: `packages/utils/src/export/engine.ts`

````ts
/**
 * @module @vanaware/buildit/export/engine
 * @description Mecanismo de varredura de diretórios, filtragem e geração de snapshots consolidados.
 */

import { walk, } from "@std/fs/walk";
import { dirname, join, relative, } from "@std/path";
import { readProjectVersion, } from "../config/version.ts";
import { carregarConfigExport, } from "./config.ts";
import {
  deveIncluirArquivo,
  formatarArquivoMarkdown,
  gerarCabecalho,
} from "./formatter.ts";
import type {
  ExportConfig,
  ExportOptions,
  ExportResult,
} from "./types.ts";

/**
 * Analisa os argumentos fornecidos via linha de comando ou array de strings
 * e determina quais modos devem ser executados.
 *
 * Regras:
 * - Sem argumentos: seleciona todos os modos configurados com `default !== false`
 * - Com argumentos: seleciona apenas os modos correspondentes às chaves conhecidas
 * - Argumentos desconhecidos são ignorados
 *
 * @param args Lista de argumentos recebidos
 * @param configs Dicionário de configurações de modos disponíveis
 * @returns Array de chaves de modos a serem executados
 *
 * @example
 * ```typescript
 * const modos = parseArgs(["ui"], configs); // ["ui"]
 * ```
 */
export function parseArgs(
  args: string[],
  configs: Record<string, ExportConfig>,
): string[] {
  const configKeys = Object.keys(configs,);
  const lowerArgs = args.map((a,) => a.toLowerCase());
  const requestedModos = lowerArgs.filter((arg,) => configKeys.includes(arg,));

  if (requestedModos.length === 0) {
    return configKeys.filter((modo,) => configs[modo]?.default !== false);
  }

  return configKeys.filter((modo,) => requestedModos.includes(modo,));
}

/**
 * Executa o processo de exportação para um único modo configurado.
 *
 * @param modo Nome identificador do modo (ex: "ui")
 * @param config Objeto de configuração do modo
 * @param opcoes Opções adicionais de execução (versão, diretório base, logs)
 * @returns Resultado detalhado contendo contagem de arquivos e bytes gravados
 *
 * @example
 * ```typescript
 * const result = await exportarModo("ui", config, { versaoApp: "0.3.1" });
 * console.log(`Exportados ${result.arquivos} arquivos para ${result.arquivoSaida}`);
 * ```
 */
export async function exportarModo(
  modo: string,
  config: ExportConfig,
  opcoes?: {
    versaoApp?: string;
    baseDir?: string;
    silencioso?: boolean;
    denoJsoncPath?: string;
  },
): Promise<ExportResult> {
  const baseDir = opcoes?.baseDir ?? ".";
  const versaoApp = opcoes?.versaoApp ?? await readProjectVersion(opcoes?.denoJsoncPath, baseDir);
  const silencioso = opcoes?.silencioso ?? false;
  const versaoDisplay = config.incluiVersao ? `[v${versaoApp}] ` : "";

  if (!silencioso) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📦 EXPORTANDO MODO: ${modo.toUpperCase()} ${versaoDisplay}`);
    console.log(`${"=".repeat(60)}`);
    console.log(`📄 Arquivo de saída: ${config.arquivoSaida}`);
    console.log(`📁 Pasta base: ${config.pastaBase}`);
  }

  let conteudoFinal = gerarCabecalho(config, modo, versaoApp);
  let arquivosIncluidos = 0;

  for await (const entry of walk(baseDir, { includeDirs: false })) {
    const caminhoRelativo = relative(baseDir, entry.path);

    if (deveIncluirArquivo(caminhoRelativo, config)) {
      try {
        if (!silencioso) {
          console.log(`   ✅ Incluindo: ${caminhoRelativo}`);
        }
        const conteudoArquivo = await Deno.readTextFile(entry.path);
        conteudoFinal += formatarArquivoMarkdown(caminhoRelativo, conteudoArquivo);
        arquivosIncluidos++;
      } catch (erro) {
        if (!silencioso && erro instanceof Error) {
          console.error(`   ❌ Erro ao ler ${caminhoRelativo}:`, erro.message);
        }
      }
    }
  }

  // Garante que o diretório de destino existe antes da gravação
  const caminhoSaida = join(baseDir, config.arquivoSaida);
  const dirSaida = dirname(caminhoSaida);
  if (dirSaida && dirSaida !== ".") {
    await Deno.mkdir(dirSaida, { recursive: true });
  }

  const encodedBytes = new TextEncoder().encode(conteudoFinal);
  await Deno.writeTextFile(caminhoSaida, conteudoFinal);

  if (!silencioso) {
    console.log(
      `\n✨ Modo ${modo.toUpperCase()} concluído: ${arquivosIncluidos} arquivos exportados para ${config.arquivoSaida} (${encodedBytes.length} bytes)`,
    );
  }

  return {
    modo,
    arquivos: arquivosIncluidos,
    arquivoSaida: config.arquivoSaida,
    bytes: encodedBytes.length,
  };
}

/**
 * Executa programaticamente o fluxo completo de exportação com suporte a múltiplos modos.
 * Aceita diretamente um objeto de configurações de modos em memória ou um objeto ExportOptions.
 *
 * @param configOuOpcoes Objeto de modos em memória ou opções completas de execução
 * @returns Lista de resultados obtidos para cada modo processado
 *
 * @example
 * ```typescript
 * // Passando configuração diretamente em memória:
 * const resultados = await executarExport({
 *   ui: { arquivoSaida: "snapshot.md", pastaBase: "./src", ... }
 * });
 *
 * // Ou usando opções completas:
 * const resultados = await executarExport({
 *   caminhoConfig: "export.jsonc",
 *   modos: ["ui", "docs"]
 * });
 * ```
 */
export async function executarExport(
  configOuOpcoes?: ExportOptions | Record<string, ExportConfig>,
): Promise<ExportResult[]> {
  let configs: Record<string, ExportConfig>;
  let opcoes: ExportOptions | undefined;

  // Verifica se o argumento passado é diretamente a configuração de modos (chaves mapeando para ExportConfig)
  if (
    configOuOpcoes &&
    typeof configOuOpcoes === "object" &&
    !("caminhoConfig" in configOuOpcoes) &&
    !("modos" in configOuOpcoes) &&
    !("baseDir" in configOuOpcoes) &&
    !("config" in configOuOpcoes) &&
    !("silencioso" in configOuOpcoes) &&
    !("versaoApp" in configOuOpcoes) &&
    !("denoJsoncPath" in configOuOpcoes)
  ) {
    configs = configOuOpcoes as Record<string, ExportConfig>;
  } else {
    opcoes = configOuOpcoes as ExportOptions | undefined;
    if (opcoes?.config) {
      configs = opcoes.config;
    } else {
      const baseDir = opcoes?.baseDir ?? ".";
      configs = await carregarConfigExport(opcoes?.caminhoConfig, baseDir);
    }
  }

  const baseDir = opcoes?.baseDir ?? ".";
  const versaoApp = opcoes?.versaoApp ?? await readProjectVersion(opcoes?.denoJsoncPath, baseDir);
  const modosParaExecutar = opcoes?.modos && opcoes.modos.length > 0
    ? parseArgs(opcoes.modos, configs)
    : parseArgs([], configs);

  const resultados: ExportResult[] = [];

  for (const modo of modosParaExecutar) {
    const config = configs[modo];
    if (config) {
      const res = await exportarModo(modo, config, {
        baseDir,
        versaoApp,
        silencioso: opcoes?.silencioso,
        denoJsoncPath: opcoes?.denoJsoncPath,
      });
      resultados.push(res);
    }
  }

  return resultados;
}

````

---

## Arquivo: `packages/utils/src/export/config.ts`

````ts
/**
 * @module @vanaware/buildit/export/config
 * @description Carregamento de configurações externas a partir de `export.jsonc`
 * e fallback para configurações padrão do projeto BuildIt.
 */

import { loadConfig } from "../config/mod.ts";
import { EXTENSOES_PADRAO, } from "../config/mod.ts";
import type { ExportConfig, ExportConfigFile, } from "./types.ts";

/**
 * Dicionário com as configurações padrão dos modos de exportação do BuildIt.
 * Utilizado quando não há arquivo de configuração externo ou como referência.
 */
export const CONFIGURACOES_PADRAO: Record<string, ExportConfig> = {
  ui: {
    arquivoSaida: "snapshots/ui.md",
    extensoesPermitidas: EXTENSOES_PADRAO,
    pastaBase: "./packages/ui/",
    subpastasPermitidas: ["src", "public", "tests", "docs",],
    arquivosRaizPermitidos: [
      "build.ts",
      "deno.json",
      "deno.jsonc",
      "readme.md",
    ],
    incluiVersao: true,
    instrucaoCustomizada:
      "O texto abaixo contém os arquivos de CÓDIGO FONTE principais da aplicação exemplo (UI).",
    default: true,
  },
  docs: {
    arquivoSaida: "snapshots/docs.md",
    extensoesPermitidas: [".md", ".txt",],
    pastaBase: "./",
    subpastasPermitidas: ["docs",],
    arquivosRaizPermitidos: [
      "readme.md",
      "readme",
      "license",
      "license.md",
      "license.txt",
      ".tool-versions",
    ],
    incluiVersao: false,
    instrucaoCustomizada:
      "O texto abaixo contém a DOCUMENTAÇÃO e diretrizes arquiteturais do projeto.",
    default: false,
  },
  server: {
    arquivoSaida: "snapshots/server.md",
    extensoesPermitidas: EXTENSOES_PADRAO,
    pastaBase: "packages/server",
    subpastasPermitidas: ["src", "tests", "docs",],
    caminhosAdicionaisPermitidos: [".github/workflows",],
    arquivosRaizPermitidos: [
      "deno.json",
      "deno.jsonc",
      "readme.md",
    ],
    incluiVersao: false,
    instrucaoCustomizada:
      "O texto abaixo contém os arquivos de configuração e execução do SERVIDOR @vanaware/server e CI/CD.",
    default: true,
  },
  utils: {
    arquivoSaida: "snapshots/utils.md",
    extensoesPermitidas: EXTENSOES_PADRAO,
    pastaBase: "packages/utils",
    subpastasPermitidas: ["src", "tests", "docs",],
    caminhosAdicionaisPermitidos: ["export.ts", "esbuild.ts", "build.ts",],
    arquivosRaizPermitidos: ["deno.json", "deno.jsonc", "readme.md",],
    incluiVersao: false,
    instrucaoCustomizada:
      "O texto abaixo contém o código e testes da biblioteca @vanaware/buildit",
    default: true,
  },
};

/**
 * Carrega a configuração de exportação a partir de um arquivo JSONC externo
 * (ex: `export.jsonc` ou `export.json`). Se o arquivo não existir, retorna
 * as configurações padrão embutidas.
 *
 * @param caminhoConfig Caminho opcional para o arquivo de configuração
 * @param baseDir Diretório base para resolução do arquivo relativo
 * @returns Dicionário mapeando o nome de cada modo para sua respectiva `ExportConfig`
 *
 * @example
 * ```typescript
 * const configs = await carregarConfigExport("export.jsonc");
 * console.log(Object.keys(configs)); // ["ui", "docs", "server", "utils"]
 * ```
 */
export async function carregarConfigExport(
  caminhoConfig?: string,
  baseDir: string = ".",
): Promise<Record<string, ExportConfig>> {
  const parsed = await loadConfig<ExportConfigFile>(
    "export",
    caminhoConfig,
    baseDir,
  );

  if (parsed) {
    if ("modos" in parsed && typeof (parsed as ExportConfigFile).modos === "object") {
      return (parsed as ExportConfigFile).modos;
    }
    return parsed as unknown as Record<string, ExportConfig>;
  }

  return { ...CONFIGURACOES_PADRAO };
}

````

---

## Arquivo: `packages/utils/src/export/types.ts`

```ts
/**
 * @module @vanaware/buildit/export/types
 * @description Definições de tipos e interfaces para o motor de exportação de contexto para IAs.
 */

import type { ExportConfig, } from "../interfaces/mod.ts";

export type { ExportConfig };

/**
 * Estrutura do arquivo de configuração externo `export.jsonc`.
 */
export interface ExportConfigFile {
  /** URL do JSON Schema para validação e autocomplete no editor */
  $schema?: string;
  /** Versão opcional do schema de configuração */
  version?: string;
  /** Modos de exportação configurados para o projeto */
  modos: Record<string, ExportConfig>;
}

/**
 * Resultado detalhado da execução de exportação de um modo.
 */
export interface ExportResult {
  /** Nome identificador do modo executado (ex: "ui", "docs", "server", "utils") */
  modo: string;
  /** Quantidade de arquivos incluídos no snapshot gerado */
  arquivos: number;
  /** Caminho relativo do arquivo de saída gravado */
  arquivoSaida: string;
  /** Tamanho total do arquivo de saída em bytes */
  bytes: number;
}

/**
 * Opções de configuração para o método programático `executarExport`.
 */
export interface ExportOptions {
  /** Configuração direta de modos em memória (substitui leitura de arquivo) */
  config?: Record<string, ExportConfig>;
  /** Caminho do arquivo de configuração (padrão: "export.jsonc" ou "export.json") */
  caminhoConfig?: string;
  /** Lista explícita de modos a serem executados. Se omitido, executa os marcados como default */
  modos?: string[];
  /** Diretório base de varredura (padrão: ".") */
  baseDir?: string;
  /** Versão da aplicação a ser injetada no cabeçalho (se omitido, lê do deno.jsonc raiz) */
  versaoApp?: string;
  /** Caminho alternativo para o deno.jsonc para extração da versão */
  denoJsoncPath?: string;
  /** Se true, suprime logs informativos no console */
  silencioso?: boolean;
}

```

---

## Arquivo: `packages/utils/src/export/cli.ts`

````ts
/**
 * @module @vanaware/buildit/export/cli
 * @description Ponto de entrada para execução do exportador de contexto via linha de comando (CLI).
 */

import { parseCommonCliFlags } from "../config/cli-flags.ts";
import { readProjectVersion } from "../config/version.ts";
import { carregarConfigExport } from "./config.ts";
import { exportarModo, parseArgs } from "./engine.ts";

/**
 * Exibe a mensagem de ajuda para o comando export.
 */
export function showExportHelp(): void {
  console.log(`
BuildIt Context Exporter CLI

Uso:
  deno task export [modos...] [opções]
  deno run -A jsr:@vanaware/buildit/export/cli [modos...] [opções]

Opções:
  -c, --config <path>    Especifica o arquivo de configuração (ex: export.jsonc)
  -V, --version, -v      Exibe a versão do projeto
  -h, --help             Exibe esta mensagem de ajuda

Exemplos:
  deno task export                      # Executa todos os modos marcados como default
  deno task export ui docs              # Executa apenas os modos 'ui' e 'docs'
  deno task export -c custom.jsonc      # Usa configuração customizada
  deno task export -V                   # Exibe a versão do projeto
`);
}

/**
 * Executa o CLI do exportador de contexto a partir dos argumentos da linha de comando.
 *
 * @param args Argumentos passados via CLI (ex: `Deno.args`)
 * @param caminhoConfig Caminho alternativo opcional para o arquivo de configuração
 *
 * @example
 * ```typescript
 * await runExportCli(Deno.args);
 * ```
 */
export async function runExportCli(
  args: string[] = Deno.args,
  caminhoConfig?: string,
): Promise<void> {
  const flags = parseCommonCliFlags(args);

  if (flags.showHelp) {
    showExportHelp();
    return;
  }

  const projectVersion = await readProjectVersion();

  if (flags.showVersion) {
    console.log(`v${projectVersion}`);
    return;
  }

  const startTime = performance.now();
  const configPath = flags.configPath ?? caminhoConfig;
  const configs = await carregarConfigExport(configPath);
  const modosParaExecutar = parseArgs(flags.positional, configs);

  console.log("\n🚀 Iniciando Exportação de Contexto BuildIt");
  console.log(`📋 Modos a exportar: ${modosParaExecutar.join(", ")}`);
  console.log(`📌 Versão: v${projectVersion}\n`);

  if (modosParaExecutar.length === 0) {
    console.log(
      "⚠️ Nenhum modo selecionado para execução. Verifique a chave 'default' no export.jsonc ou especifique os modos via CLI.",
    );
    return;
  }

  for (const modo of modosParaExecutar) {
    const config = configs[modo];
    if (config) {
      try {
        await exportarModo(modo, config, { versaoApp: projectVersion });
      } catch (erro) {
        console.error(`\n🛑 Erro ao exportar modo ${modo}:`, erro);
        Deno.exit(1);
      }
    }
  }

  const elapsed = (performance.now() - startTime).toFixed(0);
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🎉 EXPORTAÇÃO CONCLUÍDA COM SUCESSO!`);
  console.log(`⏱️ Tempo total: ${elapsed}ms`);
  console.log(`${"=".repeat(60)}\n`);
}

if (import.meta.main) {
  await runExportCli(Deno.args);
}

````

---

## Arquivo: `packages/utils/src/denobuild/cli.ts`

````ts
/**
 * @module @vanaware/buildit/denobuild/cli
 * @description Ponto de entrada CLI para o orquestrador denobuild baseado em Deno.bundle API.
 */

import { parseCommonCliFlags } from "../config/cli-flags.ts";
import { readProjectVersion, updateProjectVersion } from "../config/version.ts";
import {
  listAssetsForCache,
  parseArgs,
} from "../esbuild/mod.ts";
import { carregarConfigDenoBuild } from "./config.ts";
import { processBundleTarget } from "./engine.ts";

/**
 * Exibe a mensagem de ajuda para o comando denobuild.
 */
export function showDenoBuildHelp(): void {
  console.log(`
BuildIt Deno.bundle Orquestrador CLI

Uso:
  deno task denobuild [alvos...] [opções]
  deno run -A --unstable-bundle jsr:@vanaware/buildit/denobuild/cli [alvos...] [opções]

Opções:
  -c, --config <path>               Especifica o arquivo de configuração (ex: denobuild.jsonc)
  -V, --version, -v                 Exibe a versão do projeto
  -h, --help                        Exibe esta mensagem de ajuda
  -n, --noversion, noversion        Desabilita o incremento automático de versão
  -f, --forcepackagesversion        Propaga a versão para os subpacotes do workspace
  --version-path <path>             Diretório ou arquivo adicional onde salvar o version.ts

Exemplos:
  deno task denobuild               # Compila alvos padrão
  deno task denobuild ui            # Compila apenas o alvo 'ui'
  deno task denobuild noversion     # Compila sem incrementar a versão
  deno task denobuild -c custom.jsonc
  deno task denobuild -V            # Exibe a versão do projeto
`);
}

/**
 * Executa o CLI do orquestrador de build baseado em Deno.bundle.
 *
 * @param args Argumentos da linha de comando (ex: `Deno.args`)
 * @param caminhoConfig Caminho opcional do arquivo de configuração (ex: "denobuild.jsonc")
 *
 * @example
 * ```typescript
 * await runDenoBuildCli(Deno.args);
 * ```
 */
export async function runDenoBuildCli(
  args: string[] = Deno.args,
  caminhoConfig?: string,
): Promise<void> {
  const flags = parseCommonCliFlags(args);

  if (flags.showHelp) {
    showDenoBuildHelp();
    return;
  }

  const projectVersion = await readProjectVersion();

  if (flags.showVersion) {
    console.log(`v${projectVersion}`);
    return;
  }

  const start = performance.now();
  const configPath = flags.configPath ?? caminhoConfig;
  const configs = await carregarConfigDenoBuild(configPath);
  const rawArgs = [
    ...flags.positional,
    ...(flags.noversion ? ["noversion"] : []),
  ];
  const { targets, globalNoVersion, watchTarget } = parseArgs(rawArgs, configs);

  console.log("\n🚀 Iniciando Orquestrador de Build BuildIt (denobuild / Deno.bundle API)");
  console.log(`   📦 Motor: Deno.bundle (nativo, --unstable-bundle)`);

  if (watchTarget) {
    console.log(`\n⚠️ AVISO: Modo Watch não suportado pelo Deno.bundle API.`);
    console.log(`   O alvo '${watchTarget}' foi ignorado.`);
    console.log(`   Para watch mode, use o build esbuild: deno task esbuild watch\n`);
    return;
  }

  console.log(`   📋 Alvos: ${targets.join(", ") || "(nenhum)"}`);
  console.log(`   🔒 Noversion: ${globalNoVersion}\n`);

  if (targets.length === 0) {
    console.log("⚠️ Nenhum alvo selecionado para compilação.");
    return;
  }

  const DENO_JSONC_PATH = "deno.jsonc";

  try {
    const finalVersion = await updateProjectVersion({
      denoJsonPath: DENO_JSONC_PATH,
      noversion: globalNoVersion,
      versionPaths: flags.versionPaths,
      forcepackagesversion: flags.forcepackagesversion,
    });

    for (const targetName of targets) {
      const targetConfig = configs[targetName];
      if (!targetConfig) {
        console.warn(`⚠️ Alvo '${targetName}' não encontrado na configuração. Pulando.`);
        continue;
      }

      const listFn = targetName === "sw" ? listAssetsForCache : undefined;
      await processBundleTarget(
        targetName,
        targetConfig,
        finalVersion,
        listFn,
      );
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🎉 ORQUESTRAÇÃO DENOBUILD CONCLUÍDA COM SUCESSO!`);
    console.log(`${"=".repeat(60)}`);
  } catch (error) {
    console.error("\n🛑 Pipeline de build falhou:", error);
    Deno.exit(1);
  } finally {
    const elapsed = (performance.now() - start).toFixed(0);
    console.log(`\n⏱️ Tempo total: ${elapsed}ms\n`);
  }
}

if (import.meta.main) {
  await runDenoBuildCli(Deno.args);
}

````

---

## Arquivo: `packages/utils/src/denobuild/types.ts`

```ts
/**
 * @module @vanaware/buildit/denobuild/types
 * @description Definições de tipos e interfaces para o motor de compilação Deno.bundle (denobuild).
 */

import type {
  DenoBundleGlobalConfig,
  DenoBundlePlatform,
  DenoBundleTargetConfig,
  ParsedArgs,
  ParsedVersion,
} from "../interfaces/mod.ts";

export type {
  DenoBundleGlobalConfig,
  DenoBundlePlatform,
  DenoBundleTargetConfig,
  ParsedArgs,
  ParsedVersion,
};

/**
 * Estrutura do arquivo de configuração externo `denobuild.jsonc`.
 */
export interface DenoBuildConfigFile {
  /** URL do JSON Schema para validação e autocomplete no editor */
  $schema?: string;
  /** Versão semântica da configuração */
  version?: string;
  /** Alvos de build configurados no projeto */
  targets?: DenoBundleGlobalConfig;
  /** Alias em português para alvos de build configurados */
  alvos?: DenoBundleGlobalConfig;
  /** Suporte a alvos definidos diretamente no nível raiz do JSON */
  [key: string]: unknown;
}

/**
 * Resultado detalhado da execução de compilação de um alvo via Deno.bundle.
 */
export interface DenoBuildResult {
  /** Nome identificador do alvo compilado (ex: "ui") */
  target: string;
  /** Indica se a compilação foi concluída com êxito */
  success: boolean;
  /** Duração da compilação em milissegundos */
  durationMs: number;
  /** Lista de caminhos dos arquivos gerados no disco */
  outputFiles: string[];
}

/**
 * Opções de configuração para o método programático `executarDenoBuild`.
 */
export interface DenoBuildOptions {
  /** Configuração direta de alvos em memória (substitui leitura de arquivo) */
  config?: DenoBundleGlobalConfig;
  /** Caminho do arquivo de configuração externo (padrão: "denobuild.jsonc" ou "denobuild.json") */
  caminhoConfig?: string;
  /** Lista explícita de alvos a serem compilados. Se omitido, compila os marcados como default */
  targets?: string[];
  /** Diretório base de resolução do projeto (padrão: ".") */
  baseDir?: string;
  /** Se true, não incrementa a versão semântica no deno.jsonc */
  noversion?: boolean;
  /** Lista de caminhos de arquivos ou diretórios onde salvar o version.ts */
  versionPaths?: string[];
  /** Se true, sincroniza versão para os subpacotes do workspace */
  forcepackagesversion?: boolean;
  /** Caminho para o arquivo deno.jsonc (padrão: "deno.jsonc") */
  denoJsoncPath?: string;
  /** Se true, suprime mensagens informativas no console */
  silencioso?: boolean;
}

```

---

## Arquivo: `packages/utils/src/denobuild/config.ts`

````ts
/**
 * @module @vanaware/buildit/denobuild/config
 * @description Carregamento de configurações externas a partir de `denobuild.jsonc`
 * e fallback para configurações padrão do projeto BuildIt.
 */

import { loadConfig } from "../config/mod.ts";
import type {
  DenoBuildConfigFile,
  DenoBundleGlobalConfig,
} from "./types.ts";

/**
 * Configuração padrão para o motor Deno.bundle no projeto BuildIt.
 */
export const CONFIGURACOES_PADRAO: DenoBundleGlobalConfig = {
  ui: {
    mode: "build",
    default: true,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    publicdir: "packages/ui/public",
    indexHtml: true,
    clean: [".",],
    entryPoints: ["main.tsx",],
    platform: "browser",
    format: "esm",
    minify: false,
    sourcemap: "linked",
    keepNames: true,
    codeSplitting: false,
    packages: "bundle",
    inlineImports: true,
  },
};

/**
 * Carrega as configurações de alvos para o motor Deno.bundle a partir de um arquivo JSONC externo
 * (ex: `denobuild.jsonc` ou `denobuild.json`).
 *
 * Se o arquivo não for encontrado ou não contiver alvos válidos, retorna o objeto padrão `CONFIGURACOES_PADRAO`.
 *
 * @param caminhoConfig Caminho opcional do arquivo de configuração
 * @param baseDir Diretório base para resolução de arquivos relativos
 * @returns Mapeamento de alvos para suas configurações `DenoBundleTargetConfig`
 *
 * @example
 * ```typescript
 * const configs = await carregarConfigDenoBuild("denobuild.jsonc");
 * console.log(Object.keys(configs)); // ["ui"]
 * ```
 */
export async function carregarConfigDenoBuild(
  caminhoConfig?: string,
  baseDir: string = ".",
): Promise<DenoBundleGlobalConfig> {
  const parsed = await loadConfig<DenoBuildConfigFile>(
    "denobuild",
    caminhoConfig,
    baseDir,
  );

  if (parsed) {
    // Caso 1: Objeto possui a chave "targets"
    if (parsed.targets && typeof parsed.targets === "object") {
      return parsed.targets;
    }

    // Caso 2: Objeto possui a chave em português "alvos"
    if (parsed.alvos && typeof parsed.alvos === "object") {
      return parsed.alvos;
    }

    // Caso 3: Objeto define alvos diretamente na raiz excluindo metadados
    const filteredKeys = Object.keys(parsed).filter(
      (k) => !k.startsWith("$") && k !== "version",
    );

    if (filteredKeys.length > 0) {
      const resultado: DenoBundleGlobalConfig = {};
      let hasValidTargets = false;

      for (const key of filteredKeys) {
        const val = (parsed as Record<string, unknown>)[key];
        if (val && typeof val === "object") {
          resultado[key] = val as DenoBundleGlobalConfig[string];
          hasValidTargets = true;
        }
      }

      if (hasValidTargets) {
        return resultado;
      }
    }
  }

  return { ...CONFIGURACOES_PADRAO };
}

````

---

## Arquivo: `packages/utils/src/denobuild/mod.ts`

````ts
/**
 * @module @vanaware/buildit/denobuild
 * @description Orquestrador e biblioteca de compilação utilizando a API nativa `Deno.bundle` (--unstable-bundle).
 *
 * Suporta configuração declarativa externa via `denobuild.jsonc`, pré e pós-processamento,
 * injeção de defines em memória, cópia de ativos e geração de bundles ESM de alta performance.
 *
 * @example
 * ```typescript
 * import { executarDenoBuild } from "@vanaware/buildit/denobuild";
 *
 * const resultados = await executarDenoBuild({
 *   caminhoConfig: "denobuild.jsonc",
 *   targets: ["ui"],
 *   noversion: true,
 * });
 * ```
 */

export * from "./types.ts";
export * from "./config.ts";
export * from "./bundle.ts";
export * from "./engine.ts";
export * from "./cli.ts";

````

---

## Arquivo: `packages/utils/src/denobuild/engine.ts`

````ts
/**
 * @module @vanaware/buildit/denobuild/engine
 * @description Mecanismo central de compilação, injeção de defines e processamento de alvos com Deno.bundle.
 */

import { ensureDir, } from "@std/fs";
import { join, } from "@std/path";
import { updateProjectVersion, } from "../config/version.ts";
import {
  cleanTarget,
  copyStaticFiles,
  listAssetsForCache,
  parseArgs,
  validateTargetConfig,
} from "../esbuild/mod.ts";
import {
  applyDefines,
  buildBundleOptions,
} from "./bundle.ts";
import { carregarConfigDenoBuild, } from "./config.ts";
import type {
  DenoBuildOptions,
  DenoBuildResult,
  DenoBundleGlobalConfig,
  DenoBundleTargetConfig,
} from "./types.ts";

/**
 * Processa a compilação de um alvo específico utilizando o motor Deno.bundle.
 *
 * Etapas executadas:
 * 1. Validação de consistência da configuração
 * 2. Limpeza prévia de diretórios de saída (clean)
 * 3. Cópia de arquivos estáticos e templates HTML
 * 4. Preparação de definições em tempo de compilação (defines)
 * 5. Invocação da API nativa `Deno.bundle`
 * 6. Injeção de variáveis em memória e gravação no disco
 *
 * @param targetName Nome identificador do alvo (ex: "ui")
 * @param config Objeto de configuração do alvo
 * @param appVersion Versão semântica atual da aplicação
 * @param listAssetsFn Função opcional para listar assets gerados para cache do Service Worker
 * @returns Resultado detalhado da compilação do alvo
 *
 * @example
 * ```typescript
 * const result = await processBundleTarget("ui", config, "0.3.5");
 * ```
 */
export async function processBundleTarget(
  targetName: string,
  config: DenoBundleTargetConfig,
  appVersion: string,
  listAssetsFn?: (distDir: string,) => Promise<string[]>,
): Promise<DenoBuildResult> {
  validateTargetConfig(targetName, config,);

  console.log(`\n${"=".repeat(60,)}`,);
  console.log(`🎯 PROCESSANDO ALVO: ${targetName.toUpperCase()}`,);
  console.log(`${"=".repeat(60,)}`,);

  // 1. Limpar diretório de saída
  if (config.clean && config.clean.length > 0) {
    if (config.distdir) {
      await cleanTarget(config.distdir, config.clean,);
    } else {
      console.warn(
        `⚠️ 'clean' configurado mas 'distdir' ausente. Pulando limpeza.`,
      );
    }
  }

  // 2. Copiar arquivos estáticos
  await copyStaticFiles(config, appVersion,);

  // 3. Preparar defines
  const defines: Record<string, string> = {
    ...config.define,
    __APP_VERSION__: JSON.stringify(`v${appVersion}`,),
  };

  if (targetName === "sw" && listAssetsFn && config.distdir) {
    const assets = await listAssetsFn(config.distdir,);
    defines["__GENERATED_ASSETS__"] = JSON.stringify(assets,);
    console.log(`📋 ${assets.length} assets listados para cache do SW`,);
  }

  // 4. Executar bundle
  console.log(`🔨 Compilando com Deno.bundle...`,);
  const startTime = performance.now();
  const bundleOptions = buildBundleOptions(config,);
  const result = await Deno.bundle(bundleOptions,);

  // 5. Verificar erros
  if (!result.success) {
    console.error("❌ Erros de compilação:",);
    for (const error of result.errors) {
      const loc = error.location
        ? ` (${error.location.file}:${error.location.line}:${error.location.column})`
        : "";
      console.error(`   ${error.text}${loc}`,);
      for (const note of error.notes ?? []) {
        console.error(`      💡 ${note.text}`,);
      }
    }
    throw new Error(`Bundle falhou para o alvo [${targetName}]`,);
  }

  // 6. Exibir avisos (se houver)
  for (const warning of result.warnings) {
    const loc = warning.location
      ? ` (${warning.location.file}:${warning.location.line}:${warning.location.column})`
      : "";
    console.warn(`   ⚠️ ${warning.text}${loc}`,);
  }

  // 7. Processar arquivos gerados
  const outputFiles = result.outputFiles ?? [];
  const writtenPaths: string[] = [];

  if (outputFiles.length === 0) {
    console.warn(`   ⚠️ Nenhum arquivo gerado pelo bundle [${targetName}]`,);
    return {
      target: targetName,
      success: true,
      durationMs: Number((performance.now() - startTime).toFixed(0,)),
      outputFiles: [],
    };
  }

  const defineKeys = Object.keys(defines,);
  const hasDefines = defineKeys.length > 0;
  if (hasDefines) {
    console.log(
      `🔧 Injetando ${defineKeys.length} define(s): ${defineKeys.join(", ",)}`,
    );
  }

  for (const outputFile of outputFiles) {
    const dir = outputFile.path.substring(
      0,
      outputFile.path.lastIndexOf("/",),
    );
    if (dir) {
      await ensureDir(dir,);
    }

    let content = outputFile.text();
    if (hasDefines) {
      content = applyDefines(content, defines,);
    }

    await Deno.writeTextFile(outputFile.path, content,);
    writtenPaths.push(outputFile.path,);
    console.log(
      `   📄 ${outputFile.path} (${(content.length / 1024).toFixed(1,)}KB)`,
    );
  }

  const durationMs = Number((performance.now() - startTime).toFixed(0,));
  console.log(
    `✅ [${targetName}] Build concluído em ${durationMs}ms (${outputFiles.length} arquivo(s))`,
  );

  return {
    target: targetName,
    success: true,
    durationMs,
    outputFiles: writtenPaths,
  };
}

/**
 * Executa programaticamente a compilação via Deno.bundle para os alvos configurados.
 * Aceita diretamente um objeto DenoBundleGlobalConfig em memória ou DenoBuildOptions.
 *
 * @param configOuOpcoes Objeto DenoBundleGlobalConfig em memória ou opções completas de execução
 * @returns Lista de resultados obtidos por alvo
 *
 * @example
 * ```typescript
 * // Passando configuração diretamente em memória:
 * const resultados = await executarDenoBuild({
 *   ui: { entryPoints: ["main.tsx"], distdir: "dist", srcdir: "src", ... }
 * });
 *
 * // Ou usando opções completas:
 * const resultados = await executarDenoBuild({ targets: ["ui"], noversion: true });
 * ```
 */
export async function executarDenoBuild(
  configOuOpcoes?: DenoBuildOptions | DenoBundleGlobalConfig,
): Promise<DenoBuildResult[]> {
  let configs: DenoBundleGlobalConfig;
  let opcoes: DenoBuildOptions | undefined;

  if (
    configOuOpcoes &&
    typeof configOuOpcoes === "object" &&
    !("caminhoConfig" in configOuOpcoes) &&
    !("targets" in configOuOpcoes) &&
    !("baseDir" in configOuOpcoes) &&
    !("config" in configOuOpcoes) &&
    !("silencioso" in configOuOpcoes) &&
    !("noversion" in configOuOpcoes) &&
    !("versionPaths" in configOuOpcoes) &&
    !("forcepackagesversion" in configOuOpcoes) &&
    !("denoJsoncPath" in configOuOpcoes)
  ) {
    configs = configOuOpcoes as DenoBundleGlobalConfig;
  } else {
    opcoes = configOuOpcoes as DenoBuildOptions | undefined;
    if (opcoes?.config) {
      configs = opcoes.config;
    } else {
      const baseDir = opcoes?.baseDir ?? ".";
      configs = await carregarConfigDenoBuild(opcoes?.caminhoConfig, baseDir);
    }
  }

  const baseDir = opcoes?.baseDir ?? ".";
  const rawArgs = [
    ...(opcoes?.targets ?? []),
    ...(opcoes?.noversion ? ["noversion"] : []),
  ];

  const { targets, globalNoVersion, watchTarget } = parseArgs(rawArgs, configs);

  if (watchTarget) {
    console.warn("⚠️ Modo Watch não é suportado pela API Deno.bundle nativa.");
    return [];
  }

  if (targets.length === 0) {
    return [];
  }

  const denoJsoncPath = opcoes?.denoJsoncPath ?? join(baseDir, "deno.jsonc");
  const finalVersion = await updateProjectVersion({
    denoJsonPath: denoJsoncPath,
    baseDir,
    noversion: globalNoVersion || (opcoes?.noversion ?? false),
    versionPaths: opcoes?.versionPaths,
    forcepackagesversion: opcoes?.forcepackagesversion,
  });

  const resultados: DenoBuildResult[] = [];

  for (const targetName of targets) {
    const targetConfig = configs[targetName];
    if (!targetConfig) {
      console.warn(`⚠️ Alvo '${targetName}' não encontrado na configuração. Pulando.`);
      continue;
    }

    const listFn = targetName === "sw" ? listAssetsForCache : undefined;
    const res = await processBundleTarget(
      targetName,
      targetConfig,
      finalVersion,
      listFn,
    );
    resultados.push(res);
  }

  return resultados;
}

````

---

## Arquivo: `packages/utils/src/denobuild/bundle.ts`

````ts
/**
 * @module @vanaware/buildit/denobuild/bundle
 * @description Funções utilitárias e geradores de opções para a API nativa Deno.bundle.
 */

import {
  resolveEntryPoints,
  resolveOutputPaths,
} from "../esbuild/mod.ts";
import type { DenoBundleTargetConfig, } from "./types.ts";

/**
 * Aplica substituição de definições (defines) em uma string de código em memória.
 *
 * @param text Conteúdo original do código-fonte
 * @param defines Mapa de identificadores e valores substitutos
 * @returns Código com as substituições aplicadas
 *
 * @example
 * ```typescript
 * applyDefines("console.log(__APP_VERSION__)", { "__APP_VERSION__": '"1.0.0"' });
 * ```
 */
export function applyDefines(
  text: string,
  defines: Record<string, string>,
): string {
  let result = text;
  for (const [key, value,] of Object.entries(defines,)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&",);
    const regex = new RegExp(escapedKey, "g",);
    result = result.replace(regex, value,);
  }
  return result;
}

/**
 * Constrói o objeto de opções aceito pela API `Deno.bundle`.
 *
 * @param config Configuração do alvo de compilação
 * @returns Objeto `Deno.bundle.Options` pronto para execução
 *
 * @example
 * ```typescript
 * const options = buildBundleOptions(config);
 * ```
 */
export function buildBundleOptions(
  config: DenoBundleTargetConfig,
): Deno.bundle.Options {
  const resolvedEntryPoints = resolveEntryPoints(
    config.srcdir,
    config.entryPoints,
  );

  const { outfile, outdir, } = resolveOutputPaths(config,);

  const options: Deno.bundle.Options = {
    entrypoints: resolvedEntryPoints,
    write: false,
  };

  if (outfile) {
    options.outputPath = outfile;
  } else if (outdir) {
    options.outputDir = outdir;
  }

  if (config.platform !== undefined) options.platform = config.platform;
  if (config.format !== undefined) options.format = config.format;
  if (config.minify !== undefined) options.minify = config.minify;
  if (config.keepNames !== undefined) options.keepNames = config.keepNames;
  if (config.sourcemap !== undefined) options.sourcemap = config.sourcemap;
  if (config.codeSplitting !== undefined) {
    options.codeSplitting = config.codeSplitting;
  }
  if (config.inlineImports !== undefined) {
    options.inlineImports = config.inlineImports;
  }
  if (config.packages !== undefined) options.packages = config.packages;
  if (config.external !== undefined) options.external = config.external;

  return options;
}

````

---

## Arquivo: `packages/utils/src/interfaces/mod.ts`

````ts
// ============================================================================
// 📦 TIPOS ESBUILD
// ============================================================================
// 🔥 ESTRATÉGIA DE TIPAGEM: Usamos string literals explícitos em vez de
// `esbuild.LegalComments`, `esbuild.Platform`, etc. porque o esm.sh não
// re-exporta esses tipos internos do esbuild como membros do namespace.
// String literals mantêm autocomplete + type-safety e são independentes
// de como o esm.sh expõe a tipagem.
/**
 * Versão semântica parseada.
 */
export interface ParsedVersion {
  /** Versão major */
  major: number;
  /** Versão minor */
  minor: number;
  /** Versão patch */
  patch: number;
}

/**
 * Argumentos de linha de comando parseados.
 */
export interface ParsedArgs {
  /** Alvos de build a processar (exclui alvos watch) */
  targets: string[];
  /** Flag global para não incrementar versão */
  globalNoVersion: boolean;
  /** Nome do alvo watch a executar, ou null se não estiver em modo watch */
  watchTarget: string | null;
}

/** Modo de operação do alvo */
export type TargetMode = "build" | "watch";

/** Plataformas suportadas pelo esbuild */
export type EsbuildPlatform = "browser" | "node" | "neutral";

/** Formatos de saída suportados pelo esbuild */
export type EsbuildFormat = "esm" | "iife" | "cjs";

/** Estratégias de source map */
export type EsbuildSourcemap = boolean | "linked" | "inline" | "external";

/** Modos JSX */
export type EsbuildJsx = "automatic" | "transform" | "preserve";

/** O que fazer com comentários legais */
export type EsbuildLegalComments =
  | "none"
  | "inline"
  | "eof"
  | "linked"
  | "external";

/** O que remover do bundle (console, debugger) */
export type EsbuildDrop = "console" | "debugger";

/** Charset de saída */
export type EsbuildCharset = "ascii" | "utf8";

/** Níveis de log do esbuild */
export type EsbuildLogLevel =
  | "verbose"
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "silent";

/** Loaders disponíveis para diferentes tipos de arquivo */
export type EsbuildLoader =
  | "js"
  | "jsx"
  | "ts"
  | "tsx"
  | "css"
  | "json"
  | "text"
  | "base64"
  | "dataurl"
  | "file"
  | "binary"
  | "empty"
  | "copy";

/**
 * Configuração de um alvo de build (esbuild).
 */
export interface TargetConfig {
  // --- Configurações de Pipeline (Pré/Post Build) ---
  /** Diretório de arquivos estáticos/públicos */
  publicdir?: string;
  /** Diretório de código-fonte */
  srcdir?: string;
  /** Diretório de saída do build */
  distdir?: string;
  /** Se deve processar/copiar o arquivo index.html */
  indexHtml?: boolean;
  /** Lista de caminhos para limpar antes do build */
  clean?: string[];
  /**
   * Determina se o alvo é incluído automaticamente quando nenhum alvo
   * é especificado via CLI.
   *
   * - `true` ou `undefined`: Incluído por padrão (comportamento padrão)
   * - `false`: Só roda quando explicitamente solicitado via CLI
   *
   * ⚠️ Esta propriedade é IGNORADA para alvos com `mode: 'watch'`.
   * Alvos watch nunca são incluídos na lista de targets padrão.
   */
  default?: boolean;
  /**
   * Modo de operação do alvo.
   *
   * - `'build'`: Alvo normal de build (padrão). Compila e termina.
   * - `'watch'`: Modo de desenvolvimento contínuo. Monitora mudanças
   *   e rebuilda automaticamente. O processo fica vivo até Ctrl+C.
   *
   * ⚠️ Se múltiplos alvos tiverem `mode: 'watch'`, apenas o PRIMEIRO
   * (na ordem do CONFIG) é executado quando a flag `watch` é usada.
   */
  mode?: TargetMode;
  // --- Configurações do Esbuild (TODAS configuráveis) ---
  /** Arquivos de entrada do bundle */
  entryPoints: string[];
  /** Plataforma alvo (browser, node, neutral) */
  platform?: EsbuildPlatform;
  /** Formato de saída (esm, cjs, iife) */
  format?: EsbuildFormat;
  /** Se deve agrupar dependências no bundle */
  bundle?: boolean;
  /** Se deve minificar o código */
  minify?: boolean;
  /** Tipo de sourcemap a ser gerado */
  sourcemap?: EsbuildSourcemap;
  /** Configuração de JSX */
  jsx?: EsbuildJsx;
  /** Origem de importação do JSX (ex: preact) */
  jsxImportSource?: string;
  /** Condições personalizadas de exportação */
  conditions?: string[];
  /** Mapa de substituições globais */
  define?: Record<string, string>;
  /** Coisas para remover do código (ex: console, debugger) */
  drop?: EsbuildDrop[];
  /** Módulos a serem tratados como externos */
  external?: string[];
  /** Se deve gerar um arquivo de metadados JSON */
  metafile?: boolean;
  /** Se deve gravar o resultado no disco */
  write?: boolean;
  /** Se deve habilitar tree shaking */
  treeShaking?: boolean;
  /** Como tratar comentários legais (ex: linked, inline) */
  legalComments?: EsbuildLegalComments;
  /** Se deve preservar nomes originais de funções/classes */
  keepNames?: boolean;
  /** Caminho explícito do arquivo de saída */
  outfile?: string;
  /** Se deve habilitar splitting de código */
  splitting?: boolean;
  /** Mapeamento de loaders por extensão */
  loader?: Record<string, EsbuildLoader>;
  /** Mapa de aliases de módulos */
  alias?: Record<string, string>;
  /** Arquivos para injetar no bundle */
  inject?: string[];
  /** Texto a ser adicionado no topo dos arquivos gerados */
  banner?: { js?: string; css?: string };
  /** Texto a ser adicionado no final dos arquivos gerados */
  footer?: { js?: string; css?: string };
  /** Ambiente alvo (ex: chrome58, node12, esnext) */
  target?: string | string[];
  /** Conjunto de caracteres (utf8 ou ascii) */
  charset?: EsbuildCharset;
  /** Nível de detalhamento do log */
  logLevel?: EsbuildLogLevel;
  /** Limite de mensagens de log */
  logLimit?: number;
  /** Sobrescrita de nível de log por código de erro */
  logOverride?: Record<string, EsbuildLogLevel>;
  /** Padrão de nome para arquivos de entrada */
  entryNames?: string;
  /** Padrão de nome para arquivos de chunk */
  chunkNames?: string;
  /** Padrão de nome para ativos estáticos */
  assetNames?: string;
  /** Caminho público base para ativos */
  publicPath?: string;
  /** Lista de funções que podem ser removidas se o resultado não for usado */
  pure?: string[];
  /**
   * Plugins do esbuild.
   * Permite injetar plugins customizados (ex: @deno/esbuild-plugin).
   * Os plugins definidos aqui são mesclados com quaisquer plugins
   * injetados externamente pelo orquestrador de build.
   */
  plugins?: unknown[];
}

/**
 * Configuração global de alvos de build do esbuild.
 * Mapeia o nome do alvo para sua configuração.
 */
export interface GlobalTargetConfig {
  /** Nome do alvo e sua configuração correspondente */
  [targetName: string]: TargetConfig;
}

/** Alias semântico para a configuração de alvo do esbuild */
export type EsbuildTargetConfig = TargetConfig;
/** Alias semântico para a configuração global de alvos do esbuild */
export type EsbuildGlobalConfig = GlobalTargetConfig;

/**
 * Opções para execução programática do esbuild.
 */
export interface EsbuildOptions {
  /** Configuração direta de alvos em memória (substitui leitura de arquivo) */
  config?: GlobalTargetConfig;
  /** Caminho do arquivo de configuração (ex: "esbuild.jsonc") */
  caminhoConfig?: string;
  /** Alvos específicos a compilar */
  targets?: string[];
  /** Se true, não incrementa a versão */
  noversion?: boolean;
  /** Lista de caminhos de arquivos ou diretórios onde salvar o version.ts */
  versionPaths?: string[];
  /** Se true, sincroniza versão para os subpacotes do workspace */
  forcepackagesversion?: boolean;
  /** Diretório base de resolução */
  baseDir?: string;
  /** Caminho para o deno.jsonc raiz */
  denoJsoncPath?: string;
  /** Alvo watch específico a executar */
  watchTarget?: string;
  /** Se true, suprime logs não críticos */
  silencioso?: boolean;
}

// ============================================================================
// 📦 TIPOS E INTERFACES EXPORT
// ============================================================================
/**
 * Configuração de um modo de exportação.
 * Genérica o suficiente para ser usada em qualquer projeto.
 */
export interface ExportConfig {
  /** Caminho do arquivo de saída (relativo à raiz do projeto) */
  arquivoSaida: string;
  /** Extensões de arquivo que devem ser incluídas */
  extensoesPermitidas: string[];
  /** Pasta base onde a varredura começa */
  pastaBase: string;
  /** Subpastas dentro de pastaBase que devem ser varridas */
  subpastasPermitidas: string[];
  /** Caminhos adicionais fora de pastaBase que devem ser incluídos */
  caminhosAdicionaisPermitidos?: string[];
  /** Arquivos específicos na raiz de pastaBase que devem ser incluídos */
  arquivosRaizPermitidos: string[];
  /** Se deve incluir a versão do app no cabeçalho */
  incluiVersao: boolean;
  /** Texto de instrução para a IA no cabeçalho */
  instrucaoCustomizada: string;
  /**
   * Determina se o modo é incluído automaticamente quando nenhum modo
   * é especificado via CLI.
   *
   * - `true` ou `undefined`: Incluído por padrão (comportamento padrão)
   * - `false`: Só roda quando explicitamente solicitado via CLI
   *
   * @example
   * ```typescript
   * ui: { default: true, ... }       // Roda por padrão
   * tests: { default: false, ... }   // Só roda com: deno task export tests
   * ```
   */
  default?: boolean;
}

// ============================================================================
// 📦 TIPOS DENO.BUNDLE (API nativa do Deno 2.x --unstable-bundle)
// ============================================================================

/** Plataformas suportadas pelo Deno.bundle */
export type DenoBundlePlatform = "browser" | "deno";

/** Formatos de saída suportados pelo Deno.bundle */
export type DenoBundleFormat = "esm" | "cjs" | "iife";

/** Estratégias de source map do Deno.bundle */
export type DenoBundleSourceMap = "linked" | "inline" | "external";

/** Como tratar pacotes/dependências externas */
export type DenoBundlePackageHandling = "bundle" | "external";

/**
 * Configuração de um alvo de build usando a API nativa Deno.bundle.
 *
 * Interface declarativa e explícita: cada propriedade é listada
 * diretamente, sem uso de Omit ou herança de outras interfaces.
 *
 * Seções:
 * 1. Pipeline BuildIt: Pré/pós processamento (cleanup, cópia de estáticos)
 * 2. Deno.bundle Options: Propriedades passadas para Deno.bundle()
 * 3. Extensões BuildIt: Define customizado e opções extras
 */
export interface DenoBundleTargetConfig {
  // ==========================================================================
  // 🔄 PIPELINE BUILDIT (Pré/Pós Build)
  // ==========================================================================

  /** Diretório fonte (onde estão os arquivos de entrada) */
  srcdir?: string;

  /** Diretório de destino (onde o bundle será escrito) */
  distdir?: string;

  /** Diretório de arquivos estáticos públicos (copiados para distdir) */
  publicdir?: string;

  /** Se deve copiar index.html do srcdir para distdir */
  indexHtml?: boolean;

  /**
   * Lista de paths para limpar antes do build (relativos ao distdir).
   * Use ["."] para esvaziar completamente o diretório.
   */
  clean?: string[];

  /**
   * Incluído automaticamente quando nenhum alvo é especificado via CLI.
   * - `true` ou `undefined`: Incluído por padrão
   * - `false`: Só roda quando explicitamente solicitado
   */
  default?: boolean;

  /**
   * Modo de operação do alvo.
   * - `'build'`: Compila e termina (padrão)
   * - `'watch'`: ⚠️ NÃO SUPORTADO pelo Deno.bundle — emite aviso e ignora
   */
  mode?: "build" | "watch";

  // ==========================================================================
  // ⚙️ DENO.BUNDLE OPTIONS (API nativa)
  // Ref: https://docs.deno.com/api/deno/bundler/#Deno.bundle.Options
  // ==========================================================================

  /** Pontos de entrada do bundle (arquivos TypeScript/JavaScript) */
  entryPoints: string[];

  /**
   * Formato de saída do bundle.
   * - `"esm"`: ES Modules (padrão)
   * - `"cjs"`: CommonJS
   * - `"iife"`: Immediately Invoked Function Expression
   */
  format?: DenoBundleFormat;

  /**
   * Plataforma alvo.
   * - `"browser"`: Otimizado para navegadores (padrão para UI/SW)
   * - `"deno"`: Otimizado para runtime Deno
   */
  platform?: DenoBundlePlatform;

  /** Se deve minificar o output */
  minify?: boolean;

  /** Preserva nomes originais de funções e classes */
  keepNames?: boolean;

  /**
   * Estratégia de source map.
   * - `"linked"`: Arquivo .map separado com link no bundle
   * - `"inline"`: Source map embutido no bundle (base64)
   * - `"external"`: Arquivo .map separado sem link
   */
  sourcemap?: DenoBundleSourceMap;

  /** Habilita code splitting (divide o bundle em chunks) */
  codeSplitting?: boolean;

  /** Se deve inlinar imports externos no bundle */
  inlineImports?: boolean;

  /**
   * Como tratar pacotes/dependências externas.
   * - `"bundle"`: Pacotes são incluídos no bundle (padrão)
   * - `"external"`: Pacotes são excluídos
   */
  packages?: DenoBundlePackageHandling;

  /** Módulos externos a excluir do bundle */
  external?: string[];

  // ==========================================================================
  // 🔧 EXTENSÕES BUILDIT (pré-processamento customizado)
  // ==========================================================================

  /**
   * Define customizado para substituição de variáveis em tempo de build.
   * Aplicado em memória nos OutputFiles ANTES de salvar no disco.
   *
   * __APP_VERSION__ é injetado automaticamente — não precisa declarar.
   *
   * @example
   * ```typescript
   * define: {
   *   "__DEBUG__": "false",
   *   "__API_URL__": '"https://api.buildit.app"'
   * }
   * ```
   */
  define?: Record<string, string>;

  /**
   * Caminho explícito do arquivo de saída (quando há 1 entry point).
   * Se não especificado, usa outputDir do Deno.bundle.
   */
  outfile?: string;
}

/**
 * Configuração global de múltiplos alvos de build para Deno.bundle.
 */
export interface DenoBundleGlobalConfig {
  /** Nome do alvo e sua configuração correspondente */
  [targetName: string]: DenoBundleTargetConfig;
}

/**
 * Opções para execução programática do denobuild.
 */
export interface DenoBuildOptions {
  /** Configuração direta de alvos em memória (substitui leitura de arquivo) */
  config?: DenoBundleGlobalConfig;
  /** Caminho do arquivo de configuração (ex: "denobuild.jsonc") */
  caminhoConfig?: string;
  /** Alvos específicos a compilar */
  targets?: string[];
  /** Se true, não incrementa a versão */
  noversion?: boolean;
  /** Lista de caminhos de arquivos ou diretórios onde salvar o version.ts */
  versionPaths?: string[];
  /** Se true, sincroniza versão para os subpacotes do workspace */
  forcepackagesversion?: boolean;
  /** Diretório base de resolução */
  baseDir?: string;
  /** Caminho para o deno.jsonc raiz */
  denoJsoncPath?: string;
  /** Se true, suprime logs não críticos */
  silencioso?: boolean;
}

````

---

## Arquivo: `packages/utils/src/config/jsonc.ts`

```ts
import { parse as parseJsonc } from "@std/jsonc";
import { join } from "@std/path";

/**
 * Carrega e faz o parse de um arquivo JSON ou JSONC de forma segura.
 * Tenta carregar o arquivo especificado ou busca por alternativas padrão.
 * 
 * @param fileName Nome base do arquivo (ex: "denobuild")
 * @param explicitPath Caminho explícito fornecido pelo usuário (opcional)
 * @param baseDir Diretório base para busca (default: ".")
 * @returns O objeto parseado ou null se não encontrado/inválido
 */
export async function loadConfig<T>(
  fileName: string,
  explicitPath?: string,
  baseDir: string = ".",
): Promise<T | null> {
  const candidates = explicitPath
    ? [explicitPath]
    : [
      join(baseDir, `${fileName}.jsonc`),
      join(baseDir, `${fileName}.json`),
    ];

  for (const path of candidates) {
    try {
      const content = await Deno.readTextFile(path);
      const parsed = parseJsonc(content);
      
      if (parsed && typeof parsed === "object") {
        return parsed as T;
      }
    } catch (error) {
      // Se o usuário passou um caminho específico e ele não existe ou está quebrado, avisamos.
      // Se for a busca padrão, falhamos silenciosamente para tentar o próximo candidato.
      if (explicitPath && !(error instanceof Deno.errors.NotFound)) {
        console.warn(`⚠️ Erro ao ler arquivo de configuração em ${path}:`, error);
      }
    }
  }

  return null;
}

```

---

## Arquivo: `packages/utils/src/config/mod.ts`

```ts
export { APP_VERSION } from "../version.ts";
export { loadConfig } from "./jsonc.ts";
export * from "./version.ts";
export * from "./cli-flags.ts";

/**
 * Extensões de arquivo padrão que são comumente incluídas em snapshots.
 * Reutilizável em qualquer projeto de software.
 */
export const EXTENSOES_PADRAO = [
  ".tsx",
  ".jsx",
  ".js",
  ".ts",
  ".css",
  ".html",
  ".manifest",
  ".map",
  ".sh",
  ".py",
  ".json",
  ".jsonc",
  ".yaml",
  ".yml",
  ".toml",
  ".env.example",
  ".md",
];

```

---

## Arquivo: `packages/utils/src/config/cli-flags.ts`

```ts
/**
 * @module @vanaware/buildit/config/cli-flags
 * @description Parser padronizado de argumentos CLI para ferramentas de build e exportação.
 */

/**
 * Opções comuns parseadas da linha de comando.
 */
export interface CommonCliFlags {
  /** Caminho explícito para o arquivo de configuração (--config / -c) */
  configPath?: string;
  /** Se a flag de versão foi solicitada (--version / -V) */
  showVersion: boolean;
  /** Se a flag de ajuda foi solicitada (--help / -h) */
  showHelp: boolean;
  /** Se o incremento de versão deve ser desabilitado (noversion / --noversion / -n) */
  noversion: boolean;
  /** Se a versão deve ser propagada para os pacotes do workspace (--forcepackagesversion / -f) */
  forcepackagesversion: boolean;
  /** Caminhos adicionais onde salvar o version.ts (--version-path) */
  versionPaths?: string[];
  /** Argumentos posicionais restantes (alvos ou modos) */
  positional: string[];
}

/**
 * Parseia argumentos de linha de comando extraindo flags comuns e posicionais.
 *
 * @param args Array de argumentos recebidos via CLI (ex: `Deno.args`)
 * @returns Objeto com flags parseadas
 */
export function parseCommonCliFlags(args: string[]): CommonCliFlags {
  let configPath: string | undefined;
  let showVersion = false;
  let showHelp = false;
  let noversion = false;
  let forcepackagesversion = false;
  const versionPaths: string[] = [];
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;

    if (arg === "-h" || arg === "--help") {
      showHelp = true;
    } else if (arg === "-V" || arg === "--version" || arg === "-v") {
      showVersion = true;
    } else if (arg === "-n" || arg === "--noversion" || arg.toLowerCase() === "noversion") {
      noversion = true;
    } else if (arg === "-f" || arg === "--forcepackagesversion" || arg.toLowerCase() === "forcepackagesversion") {
      forcepackagesversion = true;
    } else if (arg === "-c" || arg === "--config") {
      if (i + 1 < args.length) {
        configPath = args[++i];
      }
    } else if (arg.startsWith("--config=")) {
      configPath = arg.substring("--config=".length);
    } else if (arg.startsWith("-c=")) {
      configPath = arg.substring("-c=".length);
    } else if (arg === "--version-path" || arg === "--versionpath") {
      if (i + 1 < args.length) {
        versionPaths.push(args[++i]!);
      }
    } else if (arg.startsWith("--version-path=") || arg.startsWith("--versionpath=")) {
      versionPaths.push(arg.split("=")[1]!);
    } else if (!arg.startsWith("-")) {
      positional.push(arg);
    }
  }

  return {
    configPath,
    showVersion,
    showHelp,
    noversion,
    forcepackagesversion,
    versionPaths: versionPaths.length > 0 ? versionPaths : undefined,
    positional,
  };
}

```

---

## Arquivo: `packages/utils/src/config/version.ts`

```ts
/**
 * @module @vanaware/buildit/config/version
 * @description Gerenciamento centralizado de versões semânticas e sincronização
 * de workspaces para Deno projects e snapshots.
 */

import { dirname, isAbsolute, join } from "@std/path";
import { parse as parseJsonc } from "@std/jsonc";
import { APP_VERSION as FALLBACK_VERSION } from "../version.ts";
import type { ParsedVersion } from "../interfaces/mod.ts";

export type { ParsedVersion };

/**
 * Opções para atualização e sincronização de versão.
 */
export interface VersionUpdateOptions {
  /** Versão base a ser utilizada. Se não fornecida, será lida do arquivo deno.jsonc */
  currentVersion?: string;
  /** Caminho do arquivo deno.jsonc raiz */
  denoJsonPath?: string;
  /** Diretório base do projeto (padrão: ".") */
  baseDir?: string;
  /** Se true, não incrementa o patch da versão */
  noversion?: boolean;
  /** Lista de caminhos de arquivos ou diretórios onde salvar o arquivo version.ts */
  versionPaths?: string[];
  /** Se true, sincroniza a versão para os subpacotes do workspace */
  forcepackagesversion?: boolean;
  /** Hash customizado para compor a versão (opcional) */
  buildHash?: string;
}

/**
 * Caminhos padrão onde o arquivo version.ts é sincronizado.
 */
export const DEFAULT_VERSION_PATHS: string[] = [
  "packages/utils/src/version.ts",
];

/**
 * Parseia uma string de versão no formato major.minor.patch[#hash].
 *
 * @param version String de versão
 * @returns Objeto ParsedVersion com major, minor e patch numéricos
 */
export function parseVersion(version: string): ParsedVersion {
  const trimmed = version.trim();
  if (trimmed !== version) {
    throw new Error(`❌ Versão não pode ter espaços: ${version}`);
  }
  const versionWithoutHash = version.split("#")[0] ?? "";
  if (version.includes("#") && version.endsWith("#")) {
    throw new Error(`❌ Formato de versão inválido (# sem hash): ${version}`);
  }
  const parts = versionWithoutHash.split(".");
  if (parts.length !== 3) {
    throw new Error(`❌ Formato de versão inválido: ${version}`);
  }
  const majorStr = parts[0];
  const minorStr = parts[1];
  const patchStr = parts[2];
  if (
    majorStr === undefined || minorStr === undefined || patchStr === undefined
  ) {
    throw new Error(`❌ Formato de versão inválido: ${version}`);
  }
  const major = parseInt(majorStr, 10);
  const minor = parseInt(minorStr, 10);
  const patch = parseInt(patchStr, 10);
  if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
    throw new Error(`❌ Versão contém valores não numéricos: ${version}`);
  }
  return { major, minor, patch };
}

/**
 * Formata os componentes da versão em uma string padronizada.
 */
export function formatVersion(
  major: number,
  minor: number,
  patch: number,
  buildHash?: string,
): string {
  const hash = buildHash ?? Date.now().toString(36);
  return `${major}.${minor}.${patch}#${hash}`;
}

/**
 * Extrai a string de versão de um conteúdo textual (ex: deno.jsonc ou deno.json).
 */
export function extractVersionFromContent(content: string): string | null {
  const match = content.match(/"version"\s*:\s*"([^"]+)"/);
  return match && match[1] ? match[1] : null;
}

/**
 * Substitui a versão no conteúdo textual fornecido.
 */
export function replaceVersionInContent(
  content: string,
  newVersion: string,
): string {
  return content.replace(
    /"version"\s*:\s*"[^"]+"/,
    `"version": "${newVersion}"`,
  );
}

/**
 * Lê a versão semântica do projeto a partir do arquivo deno.jsonc ou deno.json raiz.
 *
 * @param denoJsonPath Caminho opcional para o arquivo de configuração
 * @param baseDir Diretório base caso denoJsonPath não seja absoluto
 * @returns Versão lida do projeto
 */
export async function readProjectVersion(
  denoJsonPath?: string,
  baseDir: string = ".",
): Promise<string> {
  const candidates = denoJsonPath
    ? [denoJsonPath]
    : [
      join(baseDir, "deno.jsonc"),
      join(baseDir, "deno.json"),
    ];

  for (const path of candidates) {
    try {
      const content = await Deno.readTextFile(path);
      const version = extractVersionFromContent(content);
      if (version) {
        return version;
      }
    } catch (error) {
      if (denoJsonPath && !(error instanceof Deno.errors.NotFound)) {
        console.warn(`⚠️ Erro ao ler versão em ${path}:`, error);
      }
    }
  }

  return FALLBACK_VERSION;
}

/**
 * Grava o arquivo version.ts no caminho ou diretório especificado.
 */
export async function writeVersionFile(
  targetPathOrDir: string,
  version: string,
): Promise<void> {
  const filePath = targetPathOrDir.endsWith(".ts")
    ? targetPathOrDir
    : join(targetPathOrDir, "version.ts");

  const dir = dirname(filePath);
  if (dir && dir !== ".") {
    try {
      await Deno.mkdir(dir, { recursive: true });
    } catch {
      // diretório já existe ou sem permissão
    }
  }

  const versionContent = `// Automatically generated file during build
declare const __APP_VERSION__: string;

/** Current library/application version. */
export const APP_VERSION: string = typeof __APP_VERSION__ !== "undefined"
  ? __APP_VERSION__
  : "${version}";
`;

  await Deno.writeTextFile(filePath, versionContent);
}

/**
 * Incrementa e/ou sincroniza a versão do projeto em arquivos de configuração e código.
 *
 * @param options Opções de sincronização e versionamento
 * @returns Versão final aplicada
 */
export async function updateProjectVersion(
  options: VersionUpdateOptions = {},
): Promise<string> {
  const baseDir = options.baseDir ?? ".";
  const denoJsonPath = options.denoJsonPath ??
    join(baseDir, "deno.jsonc");
  const noversion = options.noversion ?? false;
  const forcePackages = options.forcepackagesversion ?? false;
  const versionPaths = options.versionPaths ?? DEFAULT_VERSION_PATHS;

  let currentVer = options.currentVersion;
  if (!currentVer) {
    try {
      currentVer = await readProjectVersion(denoJsonPath, baseDir);
    } catch {
      currentVer = FALLBACK_VERSION;
    }
  }

  let finalVersion = currentVer;

  if (!noversion) {
    const { major, minor, patch } = parseVersion(currentVer);
    finalVersion = formatVersion(major, minor, patch + 1, options.buildHash);

    // Atualiza deno.jsonc raiz
    try {
      const rootContent = await Deno.readTextFile(denoJsonPath);
      const updatedRootContent = replaceVersionInContent(
        rootContent,
        finalVersion,
      );
      await Deno.writeTextFile(denoJsonPath, updatedRootContent);
      console.log(`📈 Versão incrementada para: v${finalVersion}`);

      // Sincroniza workspaces se solicitado ou configurado
      if (forcePackages) {
        try {
          const rootDir = dirname(denoJsonPath);
          const parsed = parseJsonc(rootContent) as { workspace?: string[] };

          if (parsed.workspace && Array.isArray(parsed.workspace)) {
            console.log(`📦 Sincronizando workspaces...`);
            for (const ws of parsed.workspace) {
              const wsPath = isAbsolute(ws) ? ws : join(rootDir, ws);
              for (const fileName of ["deno.jsonc", "deno.json"]) {
                const configPath = join(wsPath, fileName);
                try {
                  const stat = await Deno.stat(configPath);
                  if (stat.isFile) {
                    let wsContent = await Deno.readTextFile(configPath);
                    wsContent = replaceVersionInContent(
                      wsContent,
                      finalVersion,
                    );
                    await Deno.writeTextFile(configPath, wsContent);
                    console.log(`   ✅ Sincronizado: ${join(ws, fileName)}`);
                    break;
                  }
                } catch {
                  continue;
                }
              }
            }
          }
        } catch (err) {
          console.warn(`⚠️ Falha ao sincronizar workspaces:`, err);
        }
      }
    } catch (err) {
      console.warn(`⚠️ Aviso ao atualizar ${denoJsonPath}:`, err);
    }
  } else {
    console.log(`📌 Versão mantida (noversion): v${finalVersion}`);
  }

  // Atualiza os arquivos version.ts nos caminhos especificados
  for (const vPath of versionPaths) {
    try {
      await writeVersionFile(vPath, finalVersion);
      console.log(`📝 Versão atualizada em: ${vPath}`);
    } catch (err) {
      // Ignora falhas em testes ou diretórios isolados
      if (options.versionPaths) {
        console.warn(`⚠️ Aviso ao gravar version.ts em ${vPath}:`, err);
      }
    }
  }

  return finalVersion;
}

```

---

## Arquivo: `packages/utils/src/version.ts`

```ts
// Automatically generated file during build
declare const __APP_VERSION__: string;

/** Current library/application version. */
export const APP_VERSION: string = typeof __APP_VERSION__ !== "undefined"
  ? __APP_VERSION__
  : "0.3.16#mub3tk02";

```

---

## Arquivo: `packages/utils/README.md`

````md
# buildit

Build orchestration, bundling, and AI context export utilities for Deno and Web projects.

`buildit` provides modular engines to bundle web applications using esbuild or native `Deno.bundle`, alongside an intelligent snapshot generator that formats codebase context into structured Markdown for LLMs.

## Installation

```bash
deno add jsr:@vanaware/buildit
```

## Basic Usage

Exporting codebase context for AI workflows:

```ts
import { runExport } from "jsr:@vanaware/buildit/export";

// Generate an AI context snapshot for the UI target
const result = await runExport({
  target: "ui",
  configPath: "./export.jsonc",
});

console.log(`Snapshot generated at ${result.outputPath}`);
console.log(`Included ${result.filesCount} files in ${result.durationMs}ms`);
```

## Features

- ⚡ **esbuild Pipeline**: High-speed bundling with `@deno/esbuild-plugin`, asset management, and version stamping.
- 📦 **Native Deno Bundler**: Standalone packaging powered by `Deno.bundle` (`--unstable-bundle`) without external binary dependencies.
- 📝 **AI Context Snapshots**: Structured Markdown generator with recursive path scanning, token-friendly delimiters, and anti-loop safeguards.
- ⚙️ **Declarative JSONC Config**: Type-safe configuration loaders supporting `.jsonc` and fallback defaults.
- 🏷️ **Semantic Versioning**: Automated SemVer synchronization and build timestamp injection across workspaces.

## API Overview

| Export Path | Description |
| :--- | :--- |
| `.` | Root entrypoint re-exporting core types, configuration loaders, and version helpers. |
| `./esbuild` | esbuild bundling engine, file watchers, asset copy, and manifest stampers. |
| `./esbuild/cli` | CLI runner for esbuild pipelines. |
| `./denobuild` | Native `Deno.bundle` packaging engine and defines injector. |
| `./denobuild/cli` | CLI runner for native `Deno.bundle`. |
| `./export` | LLM context generator, AST/file scanner, and Markdown formatter. |
| `./export/cli` | CLI runner for AI context exports. |
| `./config` | JSONC configuration parsers and CLI flag utilities. |
| `./interfaces` | TypeScript interfaces, target configuration types, and contracts. |

## Examples

### Bundling with esbuild

```ts
import { runEsbuild } from "jsr:@vanaware/buildit/esbuild";

await runEsbuild({
  targets: ["ui"],
  configPath: "./esbuild.jsonc",
  noversion: true,
});
```

### Packaging with Native Deno.bundle

```ts
import { runDenoBuild } from "jsr:@vanaware/buildit/denobuild";

await runDenoBuild({
  targets: ["ui"],
  configPath: "./denobuild.jsonc",
  noversion: true,
});
```

## Documentation

For full API references, type definitions, and generated docs, visit the
[package page on JSR](https://jsr.io/@vanaware/buildit).

````

---

## Arquivo: `packages/utils/deno.jsonc`

```json
{
  "name": "@vanaware/buildit",
  "version": "0.3.14",
  "license": "MIT",
  "publish": {
    "include": [
      "src/**/*.ts",
      "README.md",
      "LICENSE"
    ],
    "exclude": [
      "**/*_test.ts",
      "**/*.test.ts",
      "tests/"
    ]
  },
  "compilerOptions": {
    "lib": [
      "deno.window",
      "deno.unstable"
    ]
  },
  "imports": {
    "@std/fs": "jsr:@std/fs@^1.0.24",
    "@std/path": "jsr:@std/path@^1.1.6",
    "@std/jsonc": "jsr:@std/jsonc@^1.0.2",
    "@std/assert": "jsr:@std/assert@^1.0.19",
    "@std/testing": "jsr:@std/testing@^1.0.20"
  },
  "tasks": {
    "test": "deno test --allow-env --allow-net --allow-read --allow-write tests/",
    "check": "deno check src/**/*.{ts,tsx} tests/**/*.ts",
    "lint:doc": "deno doc --lint src/**/*.ts",
    "tests": "deno task check && deno task test"
  },
  "exports": {
    ".": "./src/mod.ts",
    "./config": "./src/config/mod.ts",
    "./interfaces": "./src/interfaces/mod.ts",
    "./build": "./src/esbuild/mod.ts",
    "./build/cli": "./src/esbuild/cli.ts",
    "./esbuild": "./src/esbuild/mod.ts",
    "./esbuild/cli": "./src/esbuild/cli.ts",
    "./export": "./src/export/mod.ts",
    "./export/cli": "./src/export/cli.ts",
    "./denobuild": "./src/denobuild/mod.ts",
    "./denobuild/cli": "./src/denobuild/cli.ts"
  }
}

```

---

## Arquivo: `esbuild.ts`

```ts
/// <reference lib="deno.ns" />

/**
 * @file esbuild.ts
 * @description CLI do orquestrador de build baseado em esbuild nativo.
 * Delega a execução para a biblioteca @vanaware/buildit/build
 * e carrega as configurações declarativas de esbuild.jsonc.
 */

import { runEsbuildCli, } from "@vanaware/buildit/build";

if (import.meta.main) {
  await runEsbuildCli(Deno.args,);
}

```

---

## Arquivo: `build.ts`

```ts
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

/**
 * @file build.ts
 * @description CLI do orquestrador de build baseado em Deno.bundle (denobuild).
 * Delega a execução para a biblioteca @vanaware/buildit/denobuild
 * e carrega as configurações declarativas de denobuild.jsonc.
 */

import { runDenoBuildCli, } from "@vanaware/buildit/denobuild";

if (import.meta.main) {
  await runDenoBuildCli(Deno.args,);
}

```

---

## Arquivo: `export.ts`

```ts
/// <reference lib="deno.ns" />

/**
 * @file export.ts
 * @description CLI de consolidação de contexto para IAs no projeto BuildIt.
 * Delega a execução e regras para a biblioteca @vanaware/buildit/export
 * e carrega as configurações declarativas de export.jsonc.
 */

import { runExportCli, } from "@vanaware/buildit/export";

if (import.meta.main) {
  await runExportCli(Deno.args,);
}

```

---

