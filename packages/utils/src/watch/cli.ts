/**
 * @module @vanaware/buildit/watch/cli
 * @description CLI entry point for continuous monitoring and rebuilding (Watch).
 */

import { Command, } from "@cliffy/command";
import { loadWatchConfig, } from "./config.ts";
import { watchEngine, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";

/**
 * Creates the CLI command instance for watch mode.
 */
export function watchCli(): Command<any> {
  return new Command()
    .name("watch",)
    .description("BuildIt Watch Orchestrator (Continuous Development)",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Configuration file", {
      env: { prefix: "WATCH_", },
    },)
    .option("-b, --base-dir [dir:string]", "Base Directory", {
      default: "./",
      env: true,
    },)
    .option("-d, --deno-config [file:string]", "Deno Configuration", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .arguments("[target:string]",)
    .action(async function (options, target?: string,): Promise<void> {
      const baseDir = (options.baseDir as string) || ".";
      const configPath = options.appConfig as string;
      const loaded = await loadWatchConfig(configPath, baseDir,);
      const configs = loaded.targets;

      const denoConfigPath = (options.denoConfig as string) || "deno.jsonc";

      console.log(
        "\n👀 Starting BuildIt Watch Orchestrator (esbuild context + @deno/esbuild-plugin)",
      );

      try {
        const handles = await watchEngine({
          config: configs,
          target: target || undefined,
          baseDir,
          versionPaths: loaded.versionPaths,
          defineVersionString: loaded.defineVersionString,
          denoJsoncPath: denoConfigPath,
          silent: false,
        },);

        if (handles.length === 0) {
          console.log("ℹ️ No active watch processes.",);
          return;
        }

        console.log("\n💡 Press Ctrl+C to terminate monitoring.\n",);

        // Graceful termination signal handling
        const onSignal = async () => {
          console.log("\n🛑 Terminating watch mode...",);
          for (const handle of handles) {
            await handle.close();
          }
          Deno.exit(0,);
        };

        try {
          Deno.addSignalListener("SIGINT", onSignal,);
          Deno.addSignalListener("SIGTERM", onSignal,);
        } catch {
          // Ignore if runtime doesn't support SignalListener
        }

        // Keep process alive
        await new Promise(() => {},);
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : String(error,);
        console.error(`\n🛑 Watch initialization failed:\n${message}`,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  await watchCli().parse(Deno.args,);
}
