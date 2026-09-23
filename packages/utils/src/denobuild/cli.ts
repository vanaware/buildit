/**
 * @module @vanaware/buildit/denobuild/cli
 * @description Ponto de entrada CLI para o orquestrador denobuild baseado em Deno.bundle API.
 */

import { Command, } from "@cliffy/command";
import { readProjectVersion, } from "../tools/version.ts";
import { carregarConfigDenoBuild, } from "./config.ts";
import { denoBuild, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";

/**
 * Executa o CLI do orquestrador de build baseado em Deno.bundle.
 */
export function denoBuildCli() {
  return new Command()
    .name("denobuild",)
    .description("BuildIt Deno.bundle Orchestrator",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Arquivo de configuração", {
      default: "denobuild.jsonc",
      env: { prefix: "DENOBUILD_", },
    },)
    .option(
      "-n, --noVersion",
      "Desabilita o incremento automático de versão",
      {
        default: false,
      },
    )
    .option(
      "-f, --force-packages-version",
      "Propaga a versão para os subpacotes do workspace",
      {
        default: false,
      },
    )
    .option(
      "--version-path [path:string]",
      "Diretório ou arquivo adicional onde salvar o version.ts",
      {
        collect: true,
      },
    )
    .option("--deno-config [file:string]", "Configuração do Deno", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .arguments("[targets...:string]", ["Alvos de build",],)
    .action(async function (options, ...args): Promise<void> {
      const startTime = performance.now();
      const configPath = options.appConfig as string;
      const loaded = await carregarConfigDenoBuild(configPath,);

      console.log(
        "\n🚀 Iniciando Orquestrador de Build BuildIt (denobuild / Deno.bundle API)",
      );
      console.log(`   📦 Motor: Deno.bundle (nativo, --unstable-bundle)`,);

      try {
        await denoBuild({
          targets: args,
          noversion: options.noVersion,
          versionPaths: (options.versionPath as string[]) ??
            loaded.versionPaths,
          forcepackagesversion: options.forcePackagesVersion ??
            loaded.forcepackagesversion,
          caminhoConfig: configPath,
          config: loaded.targets,
        },);

        console.log(`\n${"=".repeat(60,)}`,);
        console.log(`🎉 ORQUESTRAÇÃO DENOBUILD CONCLUÍDA COM SUCESSO!`,);
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
  const cli = denoBuildCli();
  await cli.parse(Deno.args,);
}
