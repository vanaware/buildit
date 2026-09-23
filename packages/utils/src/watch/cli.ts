/**
 * @module @vanaware/buildit/watch/cli
 * @description Ponto de entrada CLI para o monitoramento contínuo de desenvolvimento (Watch Mode).
 */

import { Command, } from "@cliffy/command";
import { carregarConfigWatch, } from "./config.ts";
import { watchEngine, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";

/**
 * Executa o CLI do orquestrador de desenvolvimento watch.
 */
export function watchCli() {
  return new Command()
    .name("watch",)
    .description("BuildIt Watch Mode (esbuild context & rebuild contínuo)",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Arquivo de configuração", {
      default: "watch.jsonc",
      env: { prefix: "WATCH_", },
    },)
    .option("-b, --base-dir [dir:string]", "Diretório Base", {
      default: "./",
      env: true,
    },)
    .option("-d, --deno-config [file:string]", "Configuração do Deno", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .arguments("[targets...:string]", ["Alvos de monitoramento",],)
    .action(async function (options, ...args): Promise<void> {
      const baseDir = options.baseDir as string || ".";
      const configPath = options.appConfig as string;
      const loaded = await carregarConfigWatch(configPath, baseDir,);
      const configs = loaded.targets;

      const DENO_JSONC_PATH = options.denoConfig as string || "deno.jsonc";

      console.log(
        "\n🚀 Iniciando Orquestrador Watch BuildIt (esbuild context)",
      );

      try {
        await watchEngine({
          config: configs,
          targets: args.length > 0 ? args : undefined,
          baseDir,
          denoJsoncPath: DENO_JSONC_PATH,
        },);
      } catch (error) {
        console.error("\n🛑 Pipeline de watch falhou:", error,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  const cli = watchCli();
  await cli.parse(Deno.args,);
}
