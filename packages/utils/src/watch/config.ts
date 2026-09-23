/**
 * @module @vanaware/buildit/watch/config
 * @description Carregamento de configurações de desenvolvimento contínuo a partir de `watch.jsonc`
 * e fallback para configurações padrão do projeto BuildIt.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type {
  GlobalTargetConfig,
  WatchConfigFile,
  WatchConfigResult,
} from "../tools/interfaces.ts";

/**
 * Configuração padrão para o motor watch no projeto BuildIt.
 */
export const CONFIGURACOES_WATCH_PADRAO: GlobalTargetConfig = {
  ui: {
    mode: "watch",
    default: true,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    publicdir: "packages/ui/public",
    indexHtml: true,
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
    banner: {
      js: "/*!\n * BuildIt (Watch Mode)\n * (c) 2026 Vanaware - MIT License\n */\n",
    },
  },
};

/**
 * Carrega as configurações de alvos para o modo watch a partir de um arquivo JSONC externo
 * (ex: `watch.jsonc` ou `watch.json`).
 *
 * Se o arquivo não for encontrado ou não contiver alvos válidos, retorna o objeto padrão `CONFIGURACOES_WATCH_PADRAO`.
 *
 * @param caminhoConfig Caminho opcional do arquivo de configuração
 * @param baseDir Diretório base para resolução de arquivos relativos
 * @returns Configuração carregada com alvos de monitoramento
 */
export async function carregarConfigWatch(
  caminhoConfig?: string,
  baseDir: string = ".",
): Promise<WatchConfigResult> {
  const parsed = await loadConfig<WatchConfigFile>(
    "watch",
    caminhoConfig,
    baseDir,
  );

  const result: WatchConfigResult = {
    targets: { ...CONFIGURACOES_WATCH_PADRAO, },
  };

  if (parsed) {
    // Caso 1: Objeto possui a chave "targets"
    if (parsed.targets && typeof parsed.targets === "object") {
      result.targets = parsed.targets;
      return result;
    }

    // Caso 2: Objeto possui a chave em português "alvos"
    if (parsed.alvos && typeof parsed.alvos === "object") {
      result.targets = parsed.alvos;
      return result;
    }

    // Caso 3: Objeto define alvos diretamente na raiz excluindo metadados
    const filteredKeys = Object.keys(parsed,).filter(
      (k,) => !k.startsWith("$",) && !["version",].includes(k,),
    );

    if (filteredKeys.length > 0) {
      const resultado: GlobalTargetConfig = {};
      let hasValidTargets = false;

      for (const key of filteredKeys) {
        const val = (parsed as Record<string, unknown>)[key];
        if (val && typeof val === "object") {
          resultado[key] = val as GlobalTargetConfig[string];
          hasValidTargets = true;
        }
      }

      if (hasValidTargets) {
        result.targets = resultado;
        return result;
      }
    }
  }

  return result;
}
