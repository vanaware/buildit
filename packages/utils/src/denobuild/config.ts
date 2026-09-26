/**
 * @module @vanaware/buildit/denobuild/config
 * @description Carregamento de configurações externas a partir de `denobuild.jsonc`
 * e fallback para configurações padrão do projeto BuildIt.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type {
  DenoBuildConfigFile,
  DenoBuildConfigResult,
  DenoBundleGlobalConfig,
} from "../tools/interfaces.ts";

/**
 * Exemplo de configuração para o motor Deno.bundle no projeto BuildIt.
 */
export const DENOBUILD_CONFIG_EXAMPLE: DenoBundleGlobalConfig = {
  ui: {
    mode: "build",
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
 * Se o arquivo não for encontrado, a execução é interrompida com uma mensagem de exemplo.
 *
 * @param caminhoConfig Caminho opcional do arquivo de configuração
 * @param baseDir Diretório base para resolução de arquivos relativos
 * @returns Configuração carregada com alvos e opções globais
 */
export async function carregarConfigDenoBuild(
  caminhoConfig?: string,
  baseDir: string = ".",
): Promise<DenoBuildConfigResult> {
  const parsed = await loadConfig<DenoBuildConfigFile>(
    "denobuild",
    caminhoConfig,
    baseDir,
  );

  if (!parsed) {
    throw new Error(`❌ Arquivo de configuração "denobuild.jsonc" não encontrado na raiz do projeto.
O BuildIt agora exige uma declaração explícita de alvos.

Exemplo de arquivo "denobuild.jsonc" mínimo:
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

  const result: DenoBuildConfigResult = {
    targets: {},
  };

  result.versionPaths = parsed.versionPaths;
  result.forcepackagesversion = parsed.forcepackagesversion;

  if (parsed.targets && typeof parsed.targets === "object") {
    result.targets = parsed.targets;
  } else {
    throw new Error(`❌ Chave "targets" não encontrada no arquivo de configuração denobuild.`);
  }

  return result;
}
