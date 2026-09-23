/**
 * @file export.test.ts
 * @description Testes unitários BDD para a lógica de filtragem e execução do exportador de contexto.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import {
  CONFIGURACOES_PADRAO,
} from "../../src/export/mod.ts";
import {
  deveIncluirArquivo,
} from "../../src/export/formatter.ts";
import {
  parseArgs,
} from "../../src/export/engine.ts";

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
