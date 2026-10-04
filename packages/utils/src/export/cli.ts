/**
 * @module @vanaware/buildit/export/cli
 * @description Entry point for executing the context exporter via command line (CLI).
 */
import { readProjectVersion, } from "../tools/version.ts";
import { exportEngine, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";
import { loadExportConfig, } from "./config.ts";
import { Command, } from "@cliffy/command";

/**
 * Executes the context exporter CLI from command line arguments.
 */
export function exportCli(): Command<any> {
  return new Command()
    .name("export",)
    .description("BuildIt Context Exporter",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Configuration file", {
      env: { prefix: "EXPORT_", },
    },)
    .option("-b, --base-dir [dir:string]", "Base Directory", {
      default: "./",
      env: true,
    },)
    .option("-d, --deno-config [file:string]", "Deno Configuration", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .arguments("[modes...:string]", ["Export modes",],)
    .action(async function (options, ...args): Promise<void> {
      const startTime = performance.now();
      const baseDir = (options.baseDir as string) || ".";
      const configResult = await loadExportConfig(
        options.appConfig as string,
        baseDir,
      );
      const modes = args.length > 0 ? (args as string[]) : undefined;

      console.log("\n🚀 Starting BuildIt Context Export",);
      try {
        await exportEngine({
          config: configResult.modes,
          modes: modes,
          baseDir,
          defineVersionString: configResult.defineVersionString,
          appVersion: await readProjectVersion(
            options.denoConfig as string,
            baseDir,
          ),
          denoJsoncPath: options.denoConfig as string,
        },);

        const elapsed = (performance.now() - startTime).toFixed(0,);
        console.log(`\n${"=".repeat(60,)}`,);
        console.log(`🎉 EXPORT COMPLETED SUCCESSFULLY!`,);
        console.log(`⏱️ Total time: ${elapsed}ms`,);
        console.log(`${"=".repeat(60,)}\n`,);
      } catch (error) {
        console.error("\n🛑 Export pipeline failed:", error,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  const cli = exportCli();
  await cli.parse(Deno.args,);
}
