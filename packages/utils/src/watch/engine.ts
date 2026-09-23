/**
 * @module @vanaware/buildit/watch/engine
 * @description Mecanismo programático para monitoramento contínuo (Watch Mode) com esbuild e Deno.
 */

import * as esbuild from "esbuild";
import { denoPlugin, } from "@deno/esbuild-plugin";
import { join, } from "@std/path";
import { copyStaticFiles, } from "../tools/paths.ts";
import { buildEsbuildOptions, } from "../esbuild/engine.ts";
import { readProjectVersion, } from "../tools/version.ts";
import { resolverOrdemTargets, } from "../tools/targets.ts";
import { validateTargetConfig, } from "../tools/validate.ts";
import type {
  TargetConfig,
  WatchOptions,
  WatchResult,
} from "../tools/interfaces.ts";

/**
 * Inicia o contexto de monitoramento contínuo para um alvo específico.
 *
 * @param targetName Nome do alvo
 * @param config Configuração do alvo
 * @param appVersion Versão atual da aplicação
 * @param denoJsoncPath Caminho para o deno.jsonc
 * @returns Contexto ativo do esbuild
 */
export async function startTargetWatcher(
  targetName: string,
  config: TargetConfig,
  appVersion: string,
  denoJsoncPath: string,
  // deno-lint-ignore no-explicit-any
): Promise<any> {
  validateTargetConfig(targetName, config,);

  console.log(`\n${"=".repeat(60,)}`,);
  console.log(`👀 INICIANDO WATCH: ${targetName.toUpperCase()}`,);
  console.log(`${"=".repeat(60,)}`,);

  // Copia arquivos estáticos no início
  await copyStaticFiles(config, appVersion,);

  const esbuildOptions = await buildEsbuildOptions(
    targetName,
    config,
    appVersion,
  );

  esbuildOptions.plugins = [
    ...(esbuildOptions.plugins || []),
    denoPlugin({ configPath: denoJsoncPath, },),
  ];

  const ctx = await esbuild.context(esbuildOptions,);
  await ctx.watch();

  const resolvedOut = esbuildOptions.outfile ||
    (config.distdir ? `${config.distdir}/` : "N/A");
  console.log(`✅ [${targetName}] Watcher ativo!`);
  console.log(`📁 Monitorando: ${config.srcdir ?? "."}/`);
  console.log(`📦 Saída: ${resolvedOut}`);
  console.log(`📌 Versão: v${appVersion}\n`);

  return ctx;
}

/**
 * Executa programaticamente o motor de watch para os alvos configurados.
 * A ordem de execução e inicialização é estritamente garantida pela ordem
 * declarada na configuração.
 *
 * @param opcoes Opções completas de execução do Watch
 * @returns Lista de resultados dos alvos inicializados
 */
export async function watchEngine(
  opcoes: WatchOptions,
): Promise<WatchResult[]> {
  const configs = opcoes.config;
  const baseDir = opcoes.baseDir ?? ".";
  const denoJsoncPath = opcoes.denoJsoncPath ?? join(baseDir, "deno.jsonc",);

  // Garantia da ordem exclusivamente pelo Engine
  const targetsParaExecutar = resolverOrdemTargets(configs, opcoes.targets,);

  if (targetsParaExecutar.length === 0) {
    console.warn("⚠️ Nenhum alvo selecionado para watch.");
    return [];
  }

  // Lê a versão atual do projeto sem qualquer incremento (watch mode é 100% read-only de versão)
  const currentVersion = await readProjectVersion(denoJsoncPath, baseDir,);

  const resultados: WatchResult[] = [];
  // deno-lint-ignore no-explicit-any
  const activeContexts: any[] = [];

  for (const targetName of targetsParaExecutar) {
    const targetConfig = configs[targetName];
    if (!targetConfig) {
      console.warn(`⚠️ Alvo '${targetName}' não encontrado no config.`);
      continue;
    }

    try {
      const ctx = await startTargetWatcher(
        targetName,
        targetConfig,
        currentVersion,
        denoJsoncPath,
      );
      activeContexts.push(ctx,);
      resultados.push({
        target: targetName,
        success: true,
        srcdir: targetConfig.srcdir,
        distdir: targetConfig.distdir,
      },);
    } catch (error) {
      console.error(`❌ Falha ao iniciar watcher para [${targetName}]:`, error,);
      throw error;
    }
  }

  console.log("💡 Todos os watchers foram iniciados. Pressione Ctrl+C para encerrar.\n",);

  if (!opcoes.unref) {
    // Mantém o processo vivo indefinidamente em modo interativo
    await new Promise(() => {},);
  }

  return resultados;
}
