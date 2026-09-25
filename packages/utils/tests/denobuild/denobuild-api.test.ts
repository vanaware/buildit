import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { denoBuild, } from "../../src/denobuild/engine.ts";

describe("denoBuild programmatic API", () => {
  it("deve aceitar objeto DenoBundleGlobalConfig em memória diretamente", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    const distDir = join(tempDir, "dist",);
    await Deno.mkdir(srcDir, { recursive: true, },);

    // Cria entrypoint
    await Deno.writeTextFile(
      join(srcDir, "main.ts",),
      'export const version = "test";',
    );

    const config = {
      app: {
        mode: "build" as const,
        entryPoints: ["main.ts",],
        srcdir: srcDir,
        distdir: distDir,
        platform: "browser" as const,
        format: "esm" as const,
      },
    };

    const results = await denoBuild({
      config,
      targets: ["app",],
      baseDir: tempDir,
      noversion: true,
      silencioso: true,
    },);

    assertEquals(results.length, 1,);
    assertEquals(results[0]?.target, "app",);
    assertEquals(results[0]?.success, true,);

    await Deno.remove(tempDir, { recursive: true, },);
  });
});
