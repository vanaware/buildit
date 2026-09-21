/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

/**
 * @module @vanaware/buildit/denobuild/cli
 * @description Ponto de entrada CLI para o orquestrador denobuild baseado em Deno.bundle API.
 */

import {
  currentVersion,
  incrementVersion,
  listAssetsForCache,
  parseArgs,
} from "../esbuild/mod.ts";
import { carregarConfigDenoBuild, } from "./config.ts";
import { processBundleTarget, } from "./engine.ts";

/**
 * Executa o CLI do orquestrador de build baseado em Deno.bundle.
 *
 * @param args Argumentos da linha de comando (ex: `Deno.args`)
 * @param caminhoConfig Caminho opcional do arquivo de configuração (ex: "denobuild.jsonc")
 *
 * @example
 * ```typescript
 * await runDenoBuildCli(Deno.args, "denobuild.jsonc");
 * ```
 */
export async function runDenoBuildCli(
  args: string[] = Deno.args,
  caminhoConfig?: string,
): Promise<void> {
  const start = performance.now();
  const configs = await carregarConfigDenoBuild(caminhoConfig,);
  const { targets, globalNoVersion, watchTarget, } = parseArgs(args, configs,);

  console.log("\n🚀 Iniciando Orquestrador de Build BuildIt (denobuild / Deno.bundle API)",);
  console.log(`   📦 Motor: Deno.bundle (nativo, --unstable-bundle)`,);

  if (watchTarget) {
    console.log(`\n⚠️ AVISO: Modo Watch não suportado pelo Deno.bundle API.`,);
    console.log(`   O alvo '${watchTarget}' foi ignorado.`,);
    console.log(`   Para watch mode, use o build esbuild: deno task build watch\n`,);
    return;
  }

  console.log(`   📋 Alvos: ${targets.join(", ",) || "(nenhum)"}`,);
  console.log(`   🔒 Noversion: ${globalNoVersion}\n`,);

  if (targets.length === 0) {
    console.log("⚠️ Nenhum alvo selecionado para compilação.",);
    return;
  }

  const DENO_JSONC_PATH = "deno.jsonc";

  try {
    const currentVer = await currentVersion(DENO_JSONC_PATH,);
    const finalVersion = globalNoVersion
      ? currentVer
      : await incrementVersion(currentVer, DENO_JSONC_PATH,);

    for (const targetName of targets) {
      const targetConfig = configs[targetName];
      if (!targetConfig) {
        console.warn(`⚠️ Alvo '${targetName}' não encontrado na configuração. Pulando.`,);
        continue;
      }

      const listFn = targetName === "sw" ? listAssetsForCache : undefined;
      await processBundleTarget(
        targetName,
        targetConfig,
        finalVersion,
        listFn,
      );
    }

    console.log(`\n${"=".repeat(60,)}`,);
    console.log(`🎉 ORQUESTRAÇÃO DENOBUILD CONCLUÍDA COM SUCESSO!`,);
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
  await runDenoBuildCli(Deno.args,);
}
