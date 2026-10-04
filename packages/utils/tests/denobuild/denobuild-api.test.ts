import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { denoBuild, } from "../../src/denobuild/engine.ts";

describe("denoBuild programmatic API", () => {
  it("should accept DenoBundleGlobalConfig object directly in memory", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    const distDir = join(tempDir, "dist",);
    await Deno.mkdir(srcDir, { recursive: true, },);

    // Create entrypoint
    await Deno.writeTextFile(
      join(srcDir, "main.ts",),
      'export const version = "test";',
    );

    const config = {
      app: {
        entryPoints: ["main.ts",],
        srcdir: srcDir,
        distdir: distDir,
        platform: "browser" as const,
        format: "esm" as const,
      },
    };

    // Add deno.jsonc to avoid required version error
    const denoJsonc = join(tempDir, "deno.jsonc",);
    await Deno.writeTextFile(
      denoJsonc,
      JSON.stringify({ version: "1.0.0", },),
    );

    const results = await denoBuild({
      config,
      targets: ["app",],
      baseDir: tempDir,
      denoJsoncPath: denoJsonc,
      noversion: true,
      silent: true,
    },);

    assertEquals(results.length, 1,);
    assertEquals(results[0]?.target, "app",);
    assertEquals(results[0]?.success, true,);

    await Deno.remove(tempDir, { recursive: true, },);
  });
});
