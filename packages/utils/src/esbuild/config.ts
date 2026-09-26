/**
 * @module @vanaware/buildit/esbuild/config
 * @description Carregamento de configurações externas a partir de `esbuild.jsonc`.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type {
  EsbuildConfigFile,
  EsbuildConfigResult,
  GlobalTargetConfig,
} from "../tools/interfaces.ts";

/**
 * Exemplo de configuração para o motor esbuild no projeto BuildIt.
 */
export const ESBUILD_CONFIG_EXAMPLE: GlobalTargetConfig = {
  ui: {
    default: true,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    copyFiles: [
      { basedir: "packages/ui/public", },
      { basedir: "packages/ui/src", includes: ["index.html",], },
    ],
    clean: {
      includes: ["*",],
    },
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
};

/**
 * Carrega as configurações de alvos para o motor esbuild a partir de um arquivo JSONC externo
 * (ex: `esbuild.jsonc` ou `esbuild.json`).
 *
 * Se o arquivo não for encontrado, a execução é interrompida com uma mensagem de exemplo.
 *
 * @param caminhoConfig Caminho opcional do arquivo de configuração
 * @param baseDir Diretório base para resolução de arquivos relativos
 * @returns Configuração carregada com alvos e opções globais
 */
export async function carregarConfigEsbuild(
  caminhoConfig?: string,
  baseDir: string = ".",
): Promise<EsbuildConfigResult> {
  const parsed = await loadConfig<EsbuildConfigFile>(
    "esbuild",
    caminhoConfig,
    baseDir,
  );

  if (!parsed) {
    throw new Error(`❌ Arquivo de configuração "esbuild.jsonc" não encontrado na raiz do projeto.
O BuildIt agora exige uma declaração explícita de alvos.

Exemplo de arquivo "esbuild.jsonc" mínimo:
{
  "targets": {
    "app": {
      "srcdir": "src",
      "distdir": "dist",
      "entryPoints": ["main.tsx"]
    }
  }
}`);
  }

  const result: EsbuildConfigResult = {
    targets: {},
  };

  result.versionPaths = parsed.versionPaths;
  result.forcepackagesversion = parsed.forcepackagesversion;

  if (parsed.targets && typeof parsed.targets === "object") {
    result.targets = parsed.targets;
  } else {
    throw new Error(`❌ Chave "targets" não encontrada no arquivo de configuração esbuild.`);
  }

  return result;
}
