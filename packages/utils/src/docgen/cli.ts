/**
 * @module @vanaware/buildit/docgen/cli
 * @description Entry point for executing the documentation generator via CLI.
 */

import { Command, } from "@cliffy/command";
import { APP_VERSION, } from "../version.ts";
import { runDocgen, } from "./engine.ts";
import { loadDocgenConfig, } from "./config.ts";

/**
 * Executes the DocGen CLI.
 */
export function docgenCli(): Command<any> {
  return new Command()
    .name("docgen",)
    .description("BuildIt Documentation Generator",)
    .version(APP_VERSION,)
    .option("-c, --config [file:string]", "Configuration file (default: docgen.jsonc)",)
    .option("-o, --out-dir [dir:string]", "Output directory",)
    .option("-b, --base-dir [dir:string]", "Base directory", { default: "./", },)
    .option("--docsify [enabled:boolean]", "Enable Docsify site generation",)
    .option("--docsify-title [title:string]", "Docsify site title",)
    .option("--check-threshold [threshold:number]", "Minimum coverage threshold to pass",)
    .action(async (options,) => {
      const startTime = performance.now();
      const baseDir = options.baseDir as string || ".";

      // Load config from file
      const fileConfig = await loadDocgenConfig(options.config as string, baseDir,);

      // Merge CLI options with file config
      const mergedOptions = {
        ...fileConfig,
        outDir: (options.outDir as string) || fileConfig.outDir || "docs",
        baseDir,
      };

      // Override with explicit CLI flags
      if (options.docsify !== undefined) {
        if (!mergedOptions.docsify) mergedOptions.docsify = { enabled: false, title: "" };
        mergedOptions.docsify.enabled = options.docsify as boolean;
      }
      if (options.docsifyTitle !== undefined) {
        if (!mergedOptions.docsify) mergedOptions.docsify = { enabled: false, title: "" };
        mergedOptions.docsify.title = options.docsifyTitle as string;
      }
      if (options.checkThreshold !== undefined) {
        mergedOptions.checkThreshold = options.checkThreshold as number;
      }

      if (!mergedOptions.outDir) {
        console.error("🛑 Error: Missing output directory. Use --out-dir or define it in docgen.jsonc",);
        Deno.exit(1,);
      }

      try {
        const result = await runDocgen(mergedOptions as any,);

        const elapsed = (performance.now() - startTime).toFixed(0,);
        console.log(`\n${"=".repeat(60,)}`,);
        console.log(`🎉 DOCUMENTATION GENERATED SUCCESSFULLY!`,);
        console.log(`📂 Output: ${mergedOptions.outDir}`,);
        console.log(`📝 Files: ${result.generated.length}`,);
        console.log(`📊 Coverage: ${result.stats.coverage.percentage}%`,);
        console.log(`⏱️ Total time: ${elapsed}ms`,);
        console.log(`${"=".repeat(60,)}\n`,);
      } catch (error) {
        console.error("\n🛑 Documentation generation failed:", error instanceof Error ? error.message : error,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  const cli = docgenCli();
  await cli.parse(Deno.args,);
}
