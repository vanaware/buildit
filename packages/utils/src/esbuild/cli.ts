/**
 * @module @vanaware/buildit/esbuild/cli
 * @description Ponto de entrada CLI para o orquestrador de compilação baseado em esbuild.
 */

import { Command, } from "@cliffy/command";
import { readProjectVersion, updateProjectVersion, } from "../tools/version.ts";
import { listAssetsForCache, } from "../tools/paths.ts";
import { carregarConfigEsbuild, } from "./config.ts";
import {
  buildWithDenoPlugin,
  processTarget,
  startWatchMode,
} from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";
import { parseArgs, } from "../tools/cli-flags.ts";

/**
 * Executa o CLI do orquestrador de build baseado em esbuild.
 */
export function esBuildCli() {
  return new Command()
    .name("esbuild",)
    .description("BuildIt esbuild Orchestrator",)
    .version(APP_VERSION,)
    .option("-c, --config [file]", "Arquivo de configuração", {
      default: "esbuild.jsonc",
      env: { prefix: "ESBUILD_", },
    },)
    .option("-n, --noversion", "Desabilita o incremento automático de versão", {
      default: false,
    },)
    .option("-f, --forcepackagesversion", "Propaga a versão para os subpacotes do workspace", {
      default: false,
    },)
    .option("--version-path <path:string>", "Diretório ou arquivo adicional onde salvar o version.ts", {
      collect: true,
    },)
    .option("--deno-jsonc [file]", "Configuração do Deno", {
      default: findDenoConfig(),
      env: { prefix: "DENO_", },
    },)
    .arguments("[targets...:string]", ["Alvos de build",],)
    .action(async function (options, ...args): Promise<void> {
      const startTime = performance.now();
      const baseDir = ".";
      const configPath = options.config as string;
      const loaded = await carregarConfigEsbuild(configPath, baseDir,);
      const configs = loaded.targets;

      const rawArgs = [
        ...args,
        ...(options.noversion ? ["noversion",] : []),
      ];
      const { targets, globalNoVersion, watchTarget, } = parseArgs(
        rawArgs,
        configs,
      );

      const DENO_JSONC_PATH = options.denoJsonc as string || "deno.jsonc";

      console.log(
        "\n🚀 Iniciando Orquestrador de Build BuildIt (esbuild nativo + @deno/esbuild-plugin)",
      );

      if (watchTarget) {
        console.log(`👀 Modo Watch ativo: ${watchTarget}`,);
      } else {
        console.log(
          `📋 Alvos de build (ordem segura do CONFIG): ${
            targets.join(", ",) || "(nenhum)"
          }`,
        );
      }
      console.log(`🔒 Noversion: ${globalNoVersion}\n`,);

      try {
        const finalVersion = await updateProjectVersion({
          denoJsonPath: DENO_JSONC_PATH,
          noversion: globalNoVersion || (watchTarget !== null),
          versionPaths: (options.versionPath as string[]) ?? loaded.versionPaths,
          forcepackagesversion: options.forcepackagesversion ??
            loaded.forcepackagesversion,
        },);

        if (watchTarget) {
          await startWatchMode(
            watchTarget,
            finalVersion,
            configs,
            DENO_JSONC_PATH,
          );
          return;
        }

        for (const targetName of targets) {
          const targetConfig = configs[targetName];
          if (!targetConfig) {
            console.warn(
              `⚠️ Alvo '${targetName}' não encontrado na configuração. Pulando.`,
            );
            continue;
          }

          await processTarget(
            targetName,
            targetConfig,
            finalVersion,
            (opts,) => buildWithDenoPlugin(opts, DENO_JSONC_PATH,),
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
        const elapsed = (performance.now() - startTime).toFixed(0,);
        console.log(`\n⏱️ Tempo total: ${elapsed}ms\n`,);
      }
    },);
}

if (import.meta.main) {
  const cli = esBuildCli();
  await cli.parse(Deno.args,);
}
