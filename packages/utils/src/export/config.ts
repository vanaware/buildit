/**
 * @module @vanaware/buildit/export/config
 * @description Carregamento de configurações externas a partir de `export.jsonc`
 * e fallback para configurações padrão do projeto BuildIt.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type { ExportConfig, ExportConfigFile, } from "../tools/interfaces.ts";

/**
 * Dicionário com as configurações padrão dos modos de exportação do BuildIt.
 * Utilizado quando não há arquivo de configuração externo ou como referência.
 */
export const CONFIGURACOES_PADRAO: Record<string, ExportConfig> = {
  ui: {
    arquivoSaida: "snapshots/ui.md",
    includes: [
      "packages/ui/{src,public,tests,docs}/**/*.{tsx,jsx,js,ts,css,html,manifest,json,jsonc,md}",
      "packages/ui/{build.ts,deno.json,deno.jsonc,readme.md}",
    ],
    excludes: [
      "**/node_modules/**",
      "**/.git/**",
    ],
    incluiVersao: true,
    instrucaoCustomizada:
      "O texto abaixo contém os arquivos de CÓDIGO FONTE principais da aplicação exemplo (UI).",
    default: true,
  },
  docs: {
    arquivoSaida: "snapshots/docs.md",
    includes: [
      "docs/**/*.{md,txt}",
      "{readme.md,readme,license,license.md,license.txt,.tool-versions}",
    ],
    excludes: [],
    incluiVersao: false,
    instrucaoCustomizada:
      "O texto abaixo contém a DOCUMENTAÇÃO e diretrizes arquiteturais do projeto.",
    default: false,
  },
  server: {
    arquivoSaida: "snapshots/server.md",
    includes: [
      "packages/server/{src,tests,docs}/**/*.{tsx,jsx,js,ts,css,html,json,jsonc,yaml,yml,md}",
      "packages/server/{deno.json,deno.jsonc,readme.md}",
      ".github/workflows/**/*.{yaml,yml}",
    ],
    excludes: [
      "**/node_modules/**",
      "**/.git/**",
    ],
    incluiVersao: false,
    instrucaoCustomizada:
      "O texto abaixo contém os arquivos de configuração e execução do SERVIDOR @vanaware/server e CI/CD.",
    default: true,
  },
  utils: {
    arquivoSaida: "snapshots/utils.md",
    includes: [
      "packages/utils/{src,tests,docs}/**/*.{tsx,jsx,js,ts,json,jsonc,md}",
      "packages/utils/{deno.json,deno.jsonc,readme.md}",
      "{export.ts,esbuild.ts,build.ts}",
    ],
    excludes: [
      "**/node_modules/**",
      "**/.git/**",
    ],
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
    if (
      "modos" in parsed &&
      typeof (parsed as ExportConfigFile).modos === "object"
    ) {
      const rootProjeto = (parsed as ExportConfigFile).projeto;
      const rootCabecalho = (parsed as ExportConfigFile).cabecalho;
      const modos = (parsed as ExportConfigFile).modos;

      if (rootProjeto !== undefined || rootCabecalho !== undefined) {
        for (const [modoKey, modoConfig] of Object.entries(modos)) {
          modos[modoKey] = {
            ...(rootProjeto !== undefined && modoConfig.projeto === undefined
              ? { projeto: rootProjeto }
              : {}),
            ...(rootCabecalho !== undefined && modoConfig.cabecalho === undefined
              ? { cabecalho: rootCabecalho }
              : {}),
            ...modoConfig,
          };
        }
      }

      return modos;
    }
    console.warn("⚠️ Arquivo de configuração de exportação inválido: chave 'modos' não encontrada.");
    return {};
  }

  return { ...CONFIGURACOES_PADRAO, };
}
