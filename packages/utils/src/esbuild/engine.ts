/// <reference lib="deno.ns" />

/**
 * @module @vanaware/buildit/esbuild/engine
 * @description Mecanismo programático para execução de builds com esbuild e @deno/esbuild-plugin.
 */

import * as esbuild from "esbuild";
import { denoPlugin } from "@deno/esbuild-plugin";
import { join } from "@std/path";
import { updateProjectVersion } from "../config/version.ts";
import {
  copyStaticFiles,
  buildEsbuildOptions,
  listAssetsForCache,
  parseArgs,
  processTarget,
} from "./mod.ts";
import { carregarConfigEsbuild } from "./config.ts";
import type {
  EsbuildOptions,
  GlobalTargetConfig,
} from "../interfaces/mod.ts";

/**
 * Resultado detalhado de compilação esbuild.
 */
export interface EsbuildResult {
  target: string;
  success: boolean;
  durationMs: number;
}

/**
 * Injeta o Deno Plugin nas opções do esbuild.
 */
// deno-lint-ignore no-explicit-any
export const buildWithDenoPlugin = (options: any, denoJsoncPath: string): Promise<any> => {
  options.plugins = [
    ...(options.plugins || []),
    denoPlugin({ configPath: denoJsoncPath }),
  ];
  return esbuild.build(options);
};

/**
 * Inicia o Watch Mode do esbuild.
 */
export async function startWatchMode(
  watchTargetName: string,
  currentVer: string,
  config: GlobalTargetConfig,
  denoJsoncPath: string,
): Promise<void> {
  const targetConfig = config[watchTargetName];
  if (!targetConfig) {
    throw new Error(`❌ Alvo watch '${watchTargetName}' não encontrado na configuração`);
  }

  console.log(`\n👀 Iniciando Watch Mode: ${watchTargetName}\n`);

  await copyStaticFiles(targetConfig, currentVer);

  const esbuildOptions = await buildEsbuildOptions(
    watchTargetName,
    targetConfig,
    currentVer,
  );

  esbuildOptions.plugins = [
    ...(esbuildOptions.plugins || []),
    denoPlugin({ configPath: denoJsoncPath }),
  ];

  const ctx = await esbuild.context(esbuildOptions);
  await ctx.watch();

  console.log("\n✅ Watch mode ativo!");
  console.log(`📁 Monitorando: ${targetConfig.srcdir}/`);

  const resolvedOutfile = esbuildOptions.outfile ||
    (targetConfig.distdir ? `${targetConfig.distdir}/` : "N/A");
  console.log(`📦 Output: ${resolvedOutfile}`);
  console.log(`📌 Versão: v${currentVer}`);
  console.log("\n💡 Pressione Ctrl+C para parar.\n");

  await new Promise(() => {});
}

/**
 * Executa programaticamente a compilação com esbuild para os alvos configurados.
 * Aceita diretamente um objeto GlobalTargetConfig em memória ou EsbuildOptions.
 *
 * @param configOuOpcoes Objeto GlobalTargetConfig em memória ou opções completas de execução
 * @returns Lista de resultados obtidos por alvo
 *
 * @example
 * ```typescript
 * // Passando configuração diretamente em memória:
 * const resultados = await executarEsbuild({
 *   ui: { entryPoints: ["main.tsx"], distdir: "dist", srcdir: "src", ... }
 * });
 *
 * // Ou usando opções completas:
 * const resultados = await executarEsbuild({ targets: ["ui"], noversion: true });
 * ```
 */
export async function executarEsbuild(
  configOuOpcoes?: EsbuildOptions | GlobalTargetConfig,
): Promise<EsbuildResult[]> {
  let configs: GlobalTargetConfig;
  let opcoes: EsbuildOptions | undefined;

  if (
    configOuOpcoes &&
    typeof configOuOpcoes === "object" &&
    !("caminhoConfig" in configOuOpcoes) &&
    !("targets" in configOuOpcoes) &&
    !("baseDir" in configOuOpcoes) &&
    !("config" in configOuOpcoes) &&
    !("silencioso" in configOuOpcoes) &&
    !("noversion" in configOuOpcoes) &&
    !("versionPaths" in configOuOpcoes) &&
    !("forcepackagesversion" in configOuOpcoes) &&
    !("denoJsoncPath" in configOuOpcoes) &&
    !("watchTarget" in configOuOpcoes)
  ) {
    configs = configOuOpcoes as GlobalTargetConfig;
  } else {
    opcoes = configOuOpcoes as EsbuildOptions | undefined;
    if (opcoes?.config) {
      configs = opcoes.config;
    } else {
      const baseDir = opcoes?.baseDir ?? ".";
      configs = await carregarConfigEsbuild(opcoes?.caminhoConfig, baseDir);
    }
  }

  const baseDir = opcoes?.baseDir ?? ".";
  const rawArgs = [
    ...(opcoes?.targets ?? []),
    ...(opcoes?.noversion ? ["noversion"] : []),
  ];

  const { targets, globalNoVersion, watchTarget } = parseArgs(rawArgs, configs);
  const activeWatch = opcoes?.watchTarget ?? watchTarget;
  const denoJsoncPath = opcoes?.denoJsoncPath ?? join(baseDir, "deno.jsonc");

  const finalVersion = await updateProjectVersion({
    denoJsonPath: denoJsoncPath,
    baseDir,
    noversion: globalNoVersion || (opcoes?.noversion ?? false),
    versionPaths: opcoes?.versionPaths,
    forcepackagesversion: opcoes?.forcepackagesversion,
  });

  if (activeWatch) {
    await startWatchMode(activeWatch, finalVersion, configs, denoJsoncPath);
    return [{ target: activeWatch, success: true, durationMs: 0 }];
  }

  if (targets.length === 0) {
    return [];
  }

  const resultados: EsbuildResult[] = [];

  for (const targetName of targets) {
    const targetConfig = configs[targetName];
    if (!targetConfig) {
      console.warn(`⚠️ Alvo '${targetName}' não encontrado na configuração. Pulando.`);
      continue;
    }

    const startTime = performance.now();
    await processTarget(
      targetName,
      targetConfig,
      finalVersion,
      (opts) => buildWithDenoPlugin(opts, denoJsoncPath),
      listAssetsForCache,
    );
    const durationMs = Number((performance.now() - startTime).toFixed(0));

    resultados.push({
      target: targetName,
      success: true,
      durationMs,
    });
  }

  return resultados;
}
