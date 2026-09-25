import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import {
  calcularCraseWrapper,
  correspondeGlobs,
  deveIncluirArquivo,
  formatarArquivoMarkdown,
  gerarCabecalho,
  mapearExtensao,
  normalizarCaminho,
} from "../../src/export/formatter.ts";
import { EXTENSOES_PADRAO, } from "../../src/tools/interfaces.ts";
import type { ExportConfig, } from "../../src/tools/interfaces.ts";

// Helper para criar config customizada em testes
function makeConfig(overrides: Partial<ExportConfig> = {},): ExportConfig {
  return {
    arquivoSaida: "snapshot.md",
    includes: ["**/*",],
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

describe("correspondeGlobs", () => {
  it("deve corresponder com wildcards simples", () => {
    assertEquals(correspondeGlobs("src/main.ts", ["src/*.ts",],), true,);
    assertEquals(correspondeGlobs("src/main.js", ["src/*.ts",],), false,);
  });

  it("deve corresponder com globstar recursivo", () => {
    assertEquals(
      correspondeGlobs("packages/ui/src/app.tsx", ["packages/ui/**",],),
      true,
    );
  });

  it("deve corresponder com brace expansion", () => {
    assertEquals(
      correspondeGlobs("src/main.tsx", ["src/**/*.{ts,tsx}",],),
      true,
    );
    assertEquals(
      correspondeGlobs("src/main.ts", ["src/**/*.{ts,tsx}",],),
      true,
    );
    assertEquals(
      correspondeGlobs("src/main.css", ["src/**/*.{ts,tsx}",],),
      false,
    );
  });
});

// ============================================================================
// 🎯 LÓGICA DE FILTRAGEM
// ============================================================================

describe("deveIncluirArquivo", () => {
  describe("proteção anti-loop", () => {
    it("bloqueia qualquer arquivo dentro de exports/", () => {
      const config = makeConfig({
        includes: ["**/*",],
      },);
      assertEquals(deveIncluirArquivo("exports/server.md", config,), false,);
      assertEquals(deveIncluirArquivo("exports/sub/file.ts", config,), false,);
    });

    it("bloqueia mesmo com extensão válida", () => {
      const config = makeConfig({
        includes: ["**/*.{md,ts}",],
      },);
      assertEquals(deveIncluirArquivo("exports/qualquer.ts", config,), false,);
    });
  });

  describe("modo moderno includes / excludes", () => {
    it("permite arquivo que casa com includes e não casa com excludes", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["src/**/*.{ts,tsx}",],
        excludes: ["**/*.test.ts",],
      };
      assertEquals(deveIncluirArquivo("src/app.tsx", config,), true,);
      assertEquals(deveIncluirArquivo("src/app.test.ts", config,), false,);
    });
  });

  describe("caminhos adicionais e arquivos raiz via glob", () => {
    it("permite caminho adicional com extensão válida", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["src/**/*.{ts,tsx}", ".github/workflows/*.{yml,yaml}",],
      };
      assertEquals(
        deveIncluirArquivo(".github/workflows/deploy.yml", config,),
        true,
      );
      assertEquals(
        deveIncluirArquivo(".github/workflows/ci.yaml", config,),
        true,
      );
    });

    it("bloqueia caminho com extensão que não casa com glob", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: [".github/workflows/*.yml",],
      };
      assertEquals(
        deveIncluirArquivo(".github/workflows/segredo.png", config,),
        false,
      );
    });

    it("permite arquivo exato no caminho adicional", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["README.md",],
      };
      assertEquals(deveIncluirArquivo("README.md", config,), true,);
    });
  });

  describe("pastas e subpastas via glob", () => {
    it("permite arquivo dentro de subpasta permitida", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["monorepo/server/{src,docs}/**/*.{ts,md}",],
      };
      assertEquals(
        deveIncluirArquivo("monorepo/server/src/main.ts", config,),
        true,
      );
      assertEquals(
        deveIncluirArquivo("monorepo/server/docs/arquitetura.md", config,),
        true,
      );
    });

    it("bloqueia arquivo fora das pastas incluídas", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["monorepo/server/src/**/*",],
      };
      assertEquals(
        deveIncluirArquivo("monorepo/ui/src/app.tsx", config,),
        false,
      );
    });

    it("bloqueia arquivo em subpasta excluída", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["monorepo/server/**/*",],
        excludes: ["monorepo/server/dist/**/*",],
      };
      assertEquals(
        deveIncluirArquivo("monorepo/server/dist/bundle.js", config,),
        false,
      );
    });
  });

  describe("arquivos raiz via glob", () => {
    it("permite arquivos raiz explicitamente configurados", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["monorepo/server/{deno.json,deploy.sh}",],
      };
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
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["monorepo/server/deno.json",],
      };
      assertEquals(
        deveIncluirArquivo("monorepo/server/package.json", config,),
        false,
      );
    });
  });

  describe("configuração tipo docs via glob", () => {
    it("captura raiz e subpasta docs", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["readme.md", "docs/**/*.md",],
      };
      assertEquals(deveIncluirArquivo("readme.md", config,), true,);
      assertEquals(deveIncluirArquivo("docs/arquitetura.md", config,), true,);
    });

    it("bloqueia código fonte fora de docs", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["docs/**/*.md",],
      };
      assertEquals(deveIncluirArquivo("src/main.ts", config,), false,);
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

  it("usa cabeçalho padrão com diretrizes de arquivo quando cabecalho não for fornecido", () => {
    const config = makeConfig();
    const resultado = gerarCabecalho(config, "ui", "1.0.0",);
    assertStringIncludes(
      resultado,
      "> Cada arquivo começa com um título indicando seu caminho relativo exato (ex: `## Arquivo: src/main.ts`).",
    );
    assertStringIncludes(
      resultado,
      "> Sempre que sugerir alterações, indique claramente qual arquivo deve ser modificado com base nesses caminhos e forneça o novo código completo do arquivo.",
    );
  });

  it("permite substituir o cabeçalho através da opção cabecalho", () => {
    const customCabecalho = "> Diretriz especial e única para este projeto.";
    const config = makeConfig({ cabecalho: customCabecalho, },);
    const resultado = gerarCabecalho(config, "ui", "1.0.0",);
    assertStringIncludes(resultado, customCabecalho,);
    assertEquals(
      resultado.includes(
        "Cada arquivo começa com um título indicando seu caminho relativo exato",
      ),
      false,
    );
  });

  it("permite customizar o nome do projeto via opção projeto", () => {
    const config = makeConfig({ projeto: "MeuSuperApp", },);
    const resultado = gerarCabecalho(config, "ui", "1.0.0",);
    assertStringIncludes(
      resultado,
      "# Contexto Exportado do Projeto MeuSuperApp - Modo: UI",
    );
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
    assertStringIncludes(resultado, "````md",);
    assertStringIncludes(resultado, "````",);
  });

  it("inclui separador no final", () => {
    const resultado = formatarArquivoMarkdown("src/main.ts", "code",);
    assertStringIncludes(resultado, "---",);
  });
});
