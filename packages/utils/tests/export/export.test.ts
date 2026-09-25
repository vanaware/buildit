/**
 * @file export.test.ts
 * @description Testes unitários BDD para a lógica de filtragem, expandGlob e execução do exportador de contexto.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { CONFIGURACOES_PADRAO, } from "../../src/export/mod.ts";
import { deveIncluirArquivo, } from "../../src/export/formatter.ts";
import {
  coletarArquivosParaExportacao,
  parseArgs,
} from "../../src/export/engine.ts";
import type { ExportConfig, } from "../../src/tools/interfaces.ts";

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

  it("deve PERMITIR caminhos contemplados pelo padrão includes", () => {
    const config: ExportConfig = {
      arquivoSaida: "snapshots/custom.md",
      includes: [
        "packages/server/{src,docs}/**/*.{ts,md}",
        ".github/workflows/**/*.{yaml,yml}",
      ],
      excludes: ["**/*.test.ts",],
    };

    assertEquals(
      deveIncluirArquivo("packages/server/src/main.ts", config,),
      true,
    );
    assertEquals(
      deveIncluirArquivo("packages/server/docs/arquitetura.md", config,),
      true,
    );
    assertEquals(
      deveIncluirArquivo(".github/workflows/deploy.yml", config,),
      true,
    );
  });

  it("deve BLOQUEAR caminhos contemplados pelo padrão excludes", () => {
    const config: ExportConfig = {
      arquivoSaida: "snapshots/custom.md",
      includes: ["packages/server/src/**/*.{ts,tsx}",],
      excludes: ["**/*.test.ts", "**/dist/**",],
    };

    assertEquals(
      deveIncluirArquivo("packages/server/src/main.ts", config,),
      true,
    );
    assertEquals(
      deveIncluirArquivo("packages/server/src/main.test.ts", config,),
      false,
    );
    assertEquals(
      deveIncluirArquivo("packages/server/src/dist/bundle.ts", config,),
      false,
    );
  });

  it("deve BLOQUEAR arquivos fora dos padrões includes", () => {
    const config: ExportConfig = {
      arquivoSaida: "snapshots/custom.md",
      includes: ["packages/server/src/**/*.{ts,tsx}",],
    };

    assertEquals(
      deveIncluirArquivo("packages/ui/src/app.tsx", config,),
      false,
    );
    assertEquals(
      deveIncluirArquivo("docs/readme.md", config,),
      false,
    );
  });
});

describe("coletarArquivosParaExportacao (expandGlob)", () => {
  it("deve coletar arquivos usando brace expansion e respeitar excludes de forma ordenada", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    const testDir = join(tempDir, "tests",);
    await Deno.mkdir(srcDir, { recursive: true, },);
    await Deno.mkdir(testDir, { recursive: true, },);

    await Deno.writeTextFile(join(srcDir, "index.ts",), "console.log(1);",);
    await Deno.writeTextFile(
      join(srcDir, "app.tsx",),
      "export default () => {};",
    );
    await Deno.writeTextFile(join(srcDir, "helper.test.ts",), "test",);
    await Deno.writeTextFile(join(testDir, "suite.test.ts",), "test",);

    const config: ExportConfig = {
      arquivoSaida: "snapshots/out.md",
      includes: [
        "src/**/*.{ts,tsx}",
      ],
      excludes: [
        "**/*.test.ts",
      ],
    };

    const arquivos = await coletarArquivosParaExportacao(config, tempDir,);

    assertEquals(arquivos, [
      "src/app.tsx",
      "src/index.ts",
    ],);

    await Deno.remove(tempDir, { recursive: true, },);
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
