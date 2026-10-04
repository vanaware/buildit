/**
 * @module @vanaware/buildit/esbuild/cli
 * @description CLI entry point for the build orchestrator based on esbuild.
 */

import { Command, } from "@cliffy/command";
import { loadEsbuildConfig, } from "./config.ts";
import { esBuild, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";
import { parseArgs, } from "../tools/cli-flags.ts";

/**
 * Executes the esbuild-based build orchestrator CLI.
 */
export function esBuildCli(): Command<any> {
  return new Command()
    .name("esbuild",)
    .description("BuildIt esbuild Orchestrator",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Configuration file", {
      env: { prefix: "ESBUILD_", },
    },)
    .option("-b, --base-dir [dir:string]", "Base Directory", {
      default: "./",
      env: true,
    },)
    .option("-d, --deno-config [file:string]", "Deno Configuration", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .option(
      "-n, --noversion",
      "Disable automatic version increment",
      {
        default: false,
      },
    )
    .arguments("[targets...:string]", ["Build targets",],)
    .action(async function (options, ...args): Promise<void> {
      const startTime = performance.now();
      const baseDir = options.baseDir as string || ".";
      const configPath = options.appConfig as string;
      const loaded = await loadEsbuildConfig(configPath, baseDir,);
      const configs = loaded.targets;

      const { targets, globalNoVersion, } = parseArgs(
        args,
        { noversion: Boolean(options.noversion,), },
      );

      const DENO_JSONC_PATH = options.denoConfig as string || "deno.jsonc";

      console.log(
        "\n🚀 Starting BuildIt Build Orchestrator (native esbuild + @deno/esbuild-plugin)",
      );
      console.log(`🔒 Noversion: ${globalNoVersion}\n`,);

      try {
        await esBuild({
          config: configs,
          targets: targets.length > 0 ? targets : undefined,
          noversion: globalNoVersion,
          versionPaths: loaded.versionPaths,
          forcepackagesversion: loaded.forcepackagesversion,
          defineVersionString: loaded.defineVersionString,
          denoJsoncPath: DENO_JSONC_PATH,
          baseDir,
          silent: false,
        },);

        console.log(`\n${"=".repeat(60,)}`,);
        console.log(`🎉 ESBUILD ORCHESTRATION COMPLETED SUCCESSFULLY!`,);
        console.log(`${"=".repeat(60,)}`,);
      } catch (error) {
        console.error("\n🛑 Build pipeline failed:", error,);
        Deno.exit(1,);
      } finally {
        const elapsed = (performance.now() - startTime).toFixed(0,);
        console.log(`\n⏱️ Total time: ${elapsed}ms\n`,);
      }
    },);
}

if (import.meta.main) {
  const cli = esBuildCli();
  await cli.parse(Deno.args,);
}
