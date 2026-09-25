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

/** Configurações padrão para o modo watch caso nenhum arquivo exista */
export const CONFIGURACOES_PADRAO_WATCH: WatchGlobalConfig = {
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

/** Alias retrocompatível para configurações padrão de watch */
export const CONFIGURACOES_WATCH_PADRAO: Record<string, WatchTargetConfig> =
  CONFIGURACOES_PADRAO_WATCH;

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
    console.warn(
      "⚠️ Arquivo de configuração watch não encontrado. Usando padrões.",
    );
    return { targets: CONFIGURACOES_PADRAO_WATCH, };
  }

  let targets: WatchGlobalConfig = {};

  if (
    "targets" in parsed && parsed.targets && typeof parsed.targets === "object"
  ) {
    targets = parsed.targets as WatchGlobalConfig;
  } else if (
    "alvos" in parsed && parsed.alvos && typeof parsed.alvos === "object"
  ) {
    targets = parsed.alvos as WatchGlobalConfig;
  } else {
    // Procura por chaves que parecem definições de target (possuem entryPoints)
    for (const [key, value,] of Object.entries(parsed,)) {
      if (
        key !== "$schema" &&
        key !== "version" &&
        value &&
        typeof value === "object" &&
        "entryPoints" in value
      ) {
        targets[key] = value as WatchTargetConfig;
      }
    }
  }

  if (Object.keys(targets,).length === 0) {
    targets = CONFIGURACOES_PADRAO_WATCH;
  }

  return { targets, };
}
