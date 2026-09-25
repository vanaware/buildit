/**
 * @module @vanaware/buildit/watch/cli
 * @description Ponto de entrada CLI para o monitoramento e recarregamento contínuo (Watch).
 */

import { Command, } from "@cliffy/command";
import { carregarConfigWatch, } from "./config.ts";
import { watchEngine, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";

/**
 * Cria a instância do comando CLI para o modo watch.
 */
// deno-lint-ignore no-explicit-any
export function watchCli(): Command<any, any, any, any, any, any, any, any> {
  return new Command()
    .name("watch",)
    .description("BuildIt Watch Orchestrator (Desenvolvimento Contínuo)",)
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
    .arguments("[target:string]",)
    .action(async function (options, target?: string,): Promise<void> {
      const baseDir = (options.baseDir as string) || ".";
      const configPath = options.appConfig as string;
      const loaded = await carregarConfigWatch(configPath, baseDir,);
      const configs = loaded.targets;

      const denoConfigPath = (options.denoConfig as string) || "deno.jsonc";

      console.log(
        "\n👀 Iniciando Orquestrador de Watch BuildIt (esbuild context + @deno/esbuild-plugin)",
      );

      try {
        const handles = await watchEngine({
          config: configs,
          target: target || undefined,
          baseDir,
          denoJsoncPath: denoConfigPath,
          silencioso: false,
        },);

        if (handles.length === 0) {
          console.log("ℹ️ Nenhum processo watch ativo.",);
          return;
        }

        console.log("\n💡 Pressione Ctrl+C para encerrar o monitoramento.\n",);

        // Tratamento gracioso de sinais de encerramento
        const onSignal = async () => {
          console.log("\n🛑 Encerrando modo watch...",);
          for (const handle of handles) {
            await handle.close();
          }
          Deno.exit(0,);
        };

        try {
          Deno.addSignalListener("SIGINT", onSignal,);
          Deno.addSignalListener("SIGTERM", onSignal,);
        } catch {
          // Ignora se o runtime não suportar SignalListener
        }

        // Manter o processo vivo
        await new Promise(() => {},);
      } catch (error) {
        const mensagem = error instanceof Error
          ? error.message
          : String(error,);
        console.error(`\n🛑 Falha na inicialização do Watch:\n${mensagem}`,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  await watchCli().parse(Deno.args,);
}
