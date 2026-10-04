/**
 * @module @vanaware/buildit/denobuild/cli
 * @description CLI entry point for the denobuild orchestrator based on Deno.bundle API.
 */

import { Command, } from "@cliffy/command";
import { readProjectVersion, } from "../tools/version.ts";
import { loadDenoBuildConfig, } from "./config.ts";
import { denoBuild, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";
import { parseArgs, } from "../tools/cli-flags.ts";

/**
 * Executes the Deno.bundle-based build orchestrator CLI.
 */
export function denoBuildCli(): Command<any> {
  return new Command()
    .name("denobuild",)
    .description("BuildIt Deno.bundle Orchestrator",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Configuration file", {
      env: { prefix: "DENOBUILD_", },
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
      const loaded = await loadDenoBuildConfig(configPath, baseDir,);
      const configs = loaded.targets;

      const { targets, globalNoVersion, } = parseArgs(
        args,
        { noversion: Boolean(options.noversion,), },
      );

      console.log(
        "\n🚀 Starting BuildIt Build Orchestrator (denobuild / Deno.bundle API)",
      );
      console.log(`   📦 Engine: Deno.bundle (native, --unstable-bundle)`,);
      console.log(`🔒 Noversion: ${globalNoVersion}\n`,);

      try {
        await denoBuild({
          config: configs,
          targets: targets.length > 0 ? targets : undefined,
          baseDir,
          noversion: globalNoVersion,
          versionPaths: loaded.versionPaths,
          forcepackagesversion: loaded.forcepackagesversion,
          defineVersionString: loaded.defineVersionString,
          denoJsoncPath: options.denoConfig as string,
        },);

        console.log(`\n${"=".repeat(60,)}`,);
        console.log(`🎉 DENOBUILD ORCHESTRATION COMPLETED SUCCESSFULLY!`,);
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
  const cli = denoBuildCli();
  await cli.parse(Deno.args,);
}
