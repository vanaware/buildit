/**
 * @module @vanaware/buildit/export/cli
 * @description Ponto de entrada para execução do exportador de contexto via linha de comando (CLI).
 */
import { readProjectVersion, } from "../tools/version.ts";
import { exportEngine, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";

import { Command, } from "@cliffy/command";

/**
 * Executa o CLI do exportador de contexto a partir dos argumentos da linha de comando.
 */
export function exportCli() {
  return new Command()
    .name("export",)
    .description("BuildIt Context Exporter",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Arquivo de configuração", {
      default: "export.jsonc",
      env: { prefix: "EXPORT_", },
    },)
    .option("--base-dir [file]", "Diretório Base", {
      default: "./",
      env: true,
    },)
    .option("--deno-config [file:string]", "Configuração do Deno", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .arguments("[modos...:string]", ["Modos de exportação",],)
    .action(async function (options, ...args): Promise<void> {
      const startTime = performance.now();
      console.log("\n🚀 Iniciando Exportação de Contexto BuildIt",);
      try {
        await exportEngine({
          modos: args,
          caminhoConfig: options.appConfig as string,
          versaoApp: await readProjectVersion(),
        },);

        const elapsed = (performance.now() - startTime).toFixed(0,);
        console.log(`\n${"=".repeat(60,)}`,);
        console.log(`🎉 EXPORTAÇÃO CONCLUÍDA COM SUCESSO!`,);
        console.log(`⏱️ Tempo total: ${elapsed}ms`,);
        console.log(`${"=".repeat(60,)}\n`,);
      } catch (error) {
        console.error("\n🛑 Pipeline de exportação falhou:", error,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  const cli = exportCli();
  await cli.parse(Deno.args,);
}
