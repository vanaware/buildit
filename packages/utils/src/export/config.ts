/**
 * @module @vanaware/buildit/export/config
 * @description Carregamento de configurações externas a partir de `export.jsonc`
 * e fallback para configurações padrão do projeto BuildIt.
 */

import { parse as parseJsonc, } from "@std/jsonc";
import { join, } from "@std/path";
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
  const caminhosCandidatos = caminhoConfig
    ? [caminhoConfig,]
    : [
      join(baseDir, "export.jsonc",),
      join(baseDir, "export.json",),
    ];

  for (const caminho of caminhosCandidatos) {
    try {
      const conteudo = await Deno.readTextFile(caminho,);
      const parsed = parseJsonc(conteudo,) as unknown;

      if (parsed && typeof parsed === "object") {
        if ("modos" in parsed && typeof (parsed as ExportConfigFile).modos === "object") {
          return (parsed as ExportConfigFile).modos;
        }
        return parsed as Record<string, ExportConfig>;
      }
    } catch (erro) {
      if (caminhoConfig && !(erro instanceof Deno.errors.NotFound)) {
        console.warn(`⚠️ Aviso ao ler configuração em ${caminho}:`, erro,);
      }
    }
  }

  return { ...CONFIGURACOES_PADRAO, };
}
