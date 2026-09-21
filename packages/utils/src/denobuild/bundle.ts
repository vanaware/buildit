/**
 * @module @vanaware/buildit/denobuild/bundle
 * @description Funções utilitárias e geradores de opções para a API nativa Deno.bundle.
 */

import {
  resolveEntryPoints,
  resolveOutputPaths,
} from "../esbuild/mod.ts";
import type { DenoBundleTargetConfig, } from "./types.ts";

/**
 * Aplica substituição de definições (defines) em uma string de código em memória.
 *
 * @param text Conteúdo original do código-fonte
 * @param defines Mapa de identificadores e valores substitutos
 * @returns Código com as substituições aplicadas
 *
 * @example
 * ```typescript
 * applyDefines("console.log(__APP_VERSION__)", { "__APP_VERSION__": '"1.0.0"' });
 * ```
 */
export function applyDefines(
  text: string,
  defines: Record<string, string>,
): string {
  let result = text;
  for (const [key, value,] of Object.entries(defines,)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&",);
    const regex = new RegExp(escapedKey, "g",);
    result = result.replace(regex, value,);
  }
  return result;
}

/**
 * Constrói o objeto de opções aceito pela API `Deno.bundle`.
 *
 * @param config Configuração do alvo de compilação
 * @returns Objeto `Deno.bundle.Options` pronto para execução
 *
 * @example
 * ```typescript
 * const options = buildBundleOptions(config);
 * ```
 */
export function buildBundleOptions(
  config: DenoBundleTargetConfig,
): Deno.bundle.Options {
  const resolvedEntryPoints = resolveEntryPoints(
    config.srcdir,
    config.entryPoints,
  );

  const { outfile, outdir, } = resolveOutputPaths(config,);

  const options: Deno.bundle.Options = {
    entrypoints: resolvedEntryPoints,
    write: false,
  };

  if (outfile) {
    options.outputPath = outfile;
  } else if (outdir) {
    options.outputDir = outdir;
  }

  if (config.platform !== undefined) options.platform = config.platform;
  if (config.format !== undefined) options.format = config.format;
  if (config.minify !== undefined) options.minify = config.minify;
  if (config.keepNames !== undefined) options.keepNames = config.keepNames;
  if (config.sourcemap !== undefined) options.sourcemap = config.sourcemap;
  if (config.codeSplitting !== undefined) {
    options.codeSplitting = config.codeSplitting;
  }
  if (config.inlineImports !== undefined) {
    options.inlineImports = config.inlineImports;
  }
  if (config.packages !== undefined) options.packages = config.packages;
  if (config.external !== undefined) options.external = config.external;

  return options;
}
