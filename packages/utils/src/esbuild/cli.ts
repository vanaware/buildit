/// <reference lib="deno.ns" />
import * as esbuild from "esbuild";
import { denoPlugin, } from "@deno/esbuild-plugin";
import {
  buildEsbuildOptions,
  copyStaticFiles,
  currentVersion,
  incrementVersion,
  listAssetsForCache,
  parseArgs,
  processTarget,
} from "./mod.ts";
import { carregarConfigEsbuild, } from "./config.ts";
import type { GlobalTargetConfig, } from "../interfaces/mod.ts";

/**
 * Interface para opções de execução do esbuild via CLI ou programática.
 */
export interface EsbuildRunOptions {
  /** Caminho do arquivo de configuração (ex: "esbuild.jsonc") */
  caminhoConfig?: string;
  /** Diretório base de resolução */
  baseDir?: string;
  /** Argumentos da linha de comando */
  args?: string[];
  /** Caminho para o deno.jsonc (padrão: "deno.jsonc") */
  denoJsoncPath?: string;
}

/**
 * Função interna para injetar o Deno Plugin nas opções do esbuild.
 */
// deno-lint-ignore no-explicit-any
const buildWithDenoPlugin = (options: any, denoJsoncPath: string): Promise<any> => {
  options.plugins = [
    ...(options.plugins || []),
    denoPlugin({ "configPath": denoJsoncPath, },),
  ];
  return esbuild.build(options,);
};

/**
 * Executa o Watch Mode do esbuild.
 */
async function startWatchMode(
  watchTargetName: string,
  currentVer: string,
  config: GlobalTargetConfig,
  denoJsoncPath: string,
) {
  const targetConfig = config[watchTargetName];
  if (!targetConfig) {
    throw new Error(`❌ Alvo watch '${watchTargetName}' não encontrado na configuração`,);
  }

  console.log(`\n👀 Iniciando Watch Mode: ${watchTargetName}\n`,);

  await copyStaticFiles(targetConfig, currentVer,);

  const esbuildOptions = await buildEsbuildOptions(
    watchTargetName,
    targetConfig,
    currentVer,
  );

  esbuildOptions.plugins = [
    ...(esbuildOptions.plugins || []),
    denoPlugin({ "configPath": denoJsoncPath }),
  ];

  const ctx = await esbuild.context(esbuildOptions,);
  await ctx.watch();

  console.log("\n✅ Watch mode ativo!",);
  console.log(`📁 Monitorando: ${targetConfig.srcdir}/`,);

  const resolvedOutfile = esbuildOptions.outfile ||
    (targetConfig.distdir ? `${targetConfig.distdir}/` : "N/A");
  console.log(`📦 Output: ${resolvedOutfile}`,);
  console.log(`📌 Versão: v${currentVer}`,);
  console.log("\n💡 Pressione Ctrl+C para parar.\n",);

  // Mantém o processo vivo
  await new Promise(() => {},);
}

/**
 * Executa o CLI do orquestrador de build baseado em esbuild.
 *
 * @param args Argumentos da linha de comando (ex: `Deno.args`)
 * @param caminhoConfig Caminho opcional do arquivo de configuração
 *
 * @example
 * ```typescript
 * await runEsbuildCli(Deno.args, "esbuild.jsonc");
 * ```
 */
export async function runEsbuildCli(
  args: string[] = Deno.args,
  caminhoConfig?: string,
): Promise<void> {
  const start = performance.now();
  const baseDir = ".";
  const configs = await carregarConfigEsbuild(caminhoConfig, baseDir,);
  const { targets, globalNoVersion, watchTarget, } = parseArgs(args, configs,);

  const DENO_JSONC_PATH = "deno.jsonc";

  console.log("\n🚀 Iniciando Orquestrador de Build BuildIt (esbuild nativo + @deno/esbuild-plugin)",);
  
  if (watchTarget) {
    console.log(`👀 Modo Watch ativo: ${watchTarget}`,);
  } else {
    console.log(
      `📋 Alvos de build (ordem segura do CONFIG): ${targets.join(", ",) || "(nenhum)"}`,
    );
  }
  console.log(`🔒 Noversion: ${globalNoVersion}\n`,);

  try {
    const currentVer = await currentVersion(DENO_JSONC_PATH,);

    if (watchTarget) {
      await startWatchMode(watchTarget, currentVer, configs, DENO_JSONC_PATH,);
      return;
    }

    const finalVersion = globalNoVersion
      ? currentVer
      : await incrementVersion(currentVer, DENO_JSONC_PATH,);

    for (const targetName of targets) {
      const targetConfig = configs[targetName];
      if (!targetConfig) {
        console.warn(`⚠️ Alvo '${targetName}' não encontrado na configuração. Pulando.`,);
        continue;
      }

      await processTarget(
        targetName,
        targetConfig,
        finalVersion,
        (opts) => buildWithDenoPlugin(opts, DENO_JSONC_PATH),
        listAssetsForCache,
      );
    }

    console.log(`\n${"=".repeat(60,)}`,);
    console.log(`🎉 ORQUESTRAÇÃO ESBUILD CONCLUÍDA COM SUCESSO!`,);
    console.log(`${"=".repeat(60,)}`,);
  } catch (error) {
    console.error("\n🛑 Pipeline de build falhou:", error,);
    Deno.exit(1,);
  } finally {
    const elapsed = (performance.now() - start).toFixed(0,);
    console.log(`\n⏱️ Tempo total: ${elapsed}ms\n`,);
  }
}

if (import.meta.main) {
  await runEsbuildCli(Deno.args,);
}
