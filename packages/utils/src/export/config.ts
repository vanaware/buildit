/**
 * @module @vanaware/buildit/export/config
 * @description Carregamento de configurações externas a partir de `export.jsonc`
 * e fallback para configurações padrão do projeto BuildIt.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type { ExportConfig, ExportConfigFile, } from "../tools/interfaces.ts";

/**
 * Exemplo com as configurações dos modos de exportação do BuildIt.
 */
export const EXPORT_CONFIG_EXAMPLE: Record<string, ExportConfig> = {
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
};

/**
 * Carrega a configuração de exportação a partir de um arquivo JSONC externo
 * (ex: `export.jsonc` ou `export.json`).
 *
 * Se o arquivo não for encontrado, a execução é interrompida com uma mensagem de exemplo.
 *
 * @param caminhoConfig Caminho opcional para o arquivo de configuração
 * @param baseDir Diretório base para resolução do arquivo relativo
 * @returns Dicionário mapeando o nome de cada modo para sua respectiva `ExportConfig`
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

  if (!parsed) {
    throw new Error(`❌ Arquivo de configuração "export.jsonc" não encontrado na raiz do projeto.
O BuildIt agora exige uma declaração explícita de modos de exportação.

Exemplo de arquivo "export.jsonc" mínimo:
{
  "modos": {
    "src": {
      "arquivoSaida": "snapshots/src.md",
      "includes": ["src/**/*.ts"]
    }
  }
}`);
  }

  if (
    "modos" in parsed &&
    typeof (parsed as ExportConfigFile).modos === "object"
  ) {
    const rootProjeto = (parsed as ExportConfigFile).projeto;
    const rootCabecalho = (parsed as ExportConfigFile).cabecalho;
    const modos = (parsed as ExportConfigFile).modos;

    if (rootProjeto !== undefined || rootCabecalho !== undefined) {
      for (const [modoKey, modoConfig,] of Object.entries(modos,)) {
        modos[modoKey] = {
          ...(rootProjeto !== undefined && modoConfig.projeto === undefined
            ? { projeto: rootProjeto, }
            : {}),
          ...(rootCabecalho !== undefined &&
              modoConfig.cabecalho === undefined
            ? { cabecalho: rootCabecalho, }
            : {}),
          ...modoConfig,
        };
      }
    }

    return modos;
  }

  throw new Error(`❌ Chave "modos" não encontrada no arquivo de configuração export.`);
}
