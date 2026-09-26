/**
 * @module @vanaware/buildit/watch/config
 * @description Carregamento e validação de configurações para o modo de desenvolvimento contínuo (Watch).
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type {
  WatchConfigFile,
  WatchConfigResult,
  WatchGlobalConfig,
  WatchTargetConfig,
} from "../tools/interfaces.ts";

/** Exemplo de configurações para o modo watch */
export const WATCH_CONFIG_EXAMPLE: WatchGlobalConfig = {
  ui: {
    default: true,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    copyFiles: [
      { basedir: "packages/ui/public", },
      { basedir: "packages/ui/src", includes: ["index.html",], },
    ],
    entryPoints: ["main.tsx",],
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
 * Carrega e valida o arquivo de configuração do watch (watch.jsonc ou watch.json).
 *
 * @param configPath Caminho explícito opcional para o arquivo
 * @param baseDir Diretório base do projeto (padrão: ".")
 * @returns Configuração resolvida de alvos do watch
 */
export async function carregarConfigWatch(
  configPath?: string,
  baseDir: string = ".",
): Promise<WatchConfigResult> {
  const parsed = await loadConfig<WatchConfigFile | WatchGlobalConfig>(
    "watch",
    configPath,
    baseDir,
  );

  if (!parsed) {
    throw new Error(`❌ Arquivo de configuração "watch.jsonc" não encontrado na raiz do projeto.
O BuildIt agora exige uma declaração explícita de alvos para o modo watch.

Exemplo de arquivo "watch.jsonc" mínimo:
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

  let targets: WatchGlobalConfig = {};

  if (
    "targets" in parsed && parsed.targets && typeof parsed.targets === "object"
  ) {
    targets = parsed.targets as WatchGlobalConfig;
  } else if (!("targets" in parsed) && Object.keys(parsed,).length > 0) {
    // Tenta tratar o objeto raiz como os alvos
    targets = parsed as WatchGlobalConfig;
  }

  if (Object.keys(targets,).length === 0) {
    throw new Error(`❌ Nenhuma configuração de alvos encontrada no arquivo de configuração watch.`);
  }

  return { targets, };
}
