/**
 * @module @vanaware/buildit/esbuild/cli
 * @description Ponto de entrada CLI para o orquestrador de compilação baseado em esbuild.
 */

import { Command, } from "@cliffy/command";
import { carregarConfigEsbuild, } from "./config.ts";
import { esBuild, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";
import { parseArgs, } from "../tools/cli-flags.ts";

/**
 * Executa o CLI do orquestrador de build baseado em esbuild.
 */
// deno-lint-ignore no-explicit-any
export function esBuildCli(): Command<any, any, any, any, any, any, any, any> {
  return new Command()
    .name("esbuild",)
    .description("BuildIt esbuild Orchestrator",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Arquivo de configuração", {
      default: "esbuild.jsonc",
      env: { prefix: "ESBUILD_", },
    },)
    .option("-b, --base-dir [dir:string]", "Diretório Base", {
      default: "./",
      env: true,
    },)
    .option("-d, --deno-config [file:string]", "Configuração do Deno", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .option(
      "-n, --noversion",
      "Desabilita o incremento automático de versão",
      {
        default: false,
      },
    )
    .arguments("[targets...:string]", ["Alvos de build",],)
    .action(async function (options, ...args): Promise<void> {
      const startTime = performance.now();
      const baseDir = options.baseDir as string || ".";
      const configPath = options.appConfig as string;
      const loaded = await carregarConfigEsbuild(configPath, baseDir,);
      const configs = loaded.targets;

      const { targets, globalNoVersion, } = parseArgs(
        args,
        { noversion: Boolean(options.noversion,), },
      );

      const DENO_JSONC_PATH = options.denoConfig as string || "deno.jsonc";

      console.log(
        "\n🚀 Iniciando Orquestrador de Build BuildIt (esbuild nativo + @deno/esbuild-plugin)",
      );
      console.log(`🔒 Noversion: ${globalNoVersion}\n`,);

      try {
        await esBuild({
          config: configs,
          targets: targets.length > 0 ? targets : undefined,
          noversion: globalNoVersion,
          versionPaths: loaded.versionPaths,
          forcepackagesversion: loaded.forcepackagesversion,
          denoJsoncPath: DENO_JSONC_PATH,
          baseDir,
          silencioso: false,
        },);

        console.log(`\n${"=".repeat(60,)}`,);
        console.log(`🎉 ORQUESTRAÇÃO ESBUILD CONCLUÍDA COM SUCESSO!`,);
        console.log(`${"=".repeat(60,)}`,);
      } catch (error) {
        console.error("\n🛑 Pipeline de build falhou:", error,);
        Deno.exit(1,);
      } finally {
        const elapsed = (performance.now() - startTime).toFixed(0,);
        console.log(`\n⏱️ Tempo total: ${elapsed}ms\n`,);
      }
    },);
}

if (import.meta.main) {
  const cli = esBuildCli();
  await cli.parse(Deno.args,);
}
