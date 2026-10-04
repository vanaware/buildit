import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { loadConfig, } from "../../src/tools/jsonc.ts";
import { join, } from "@std/path";

describe("loadConfig - Search Priorities", () => {
  it("should load explicitPath file if provided", async () => {
    const tempFile = await Deno.makeTempFile({ suffix: ".json", },);
    await Deno.writeTextFile(tempFile, JSON.stringify({ explicit: true, },),);

    try {
      const config = await loadConfig<{ explicit: boolean }>("test", tempFile,);
      assertEquals(config?.explicit, true,);
    } finally {
      await Deno.remove(tempFile,);
    }
  });

  it("should fallback to baseDir if scriptDir does not have the file", async () => {
    const tempDir = await Deno.makeTempDir();
    const configPath = join(tempDir, "test.jsonc",);
    await Deno.writeTextFile(configPath, JSON.stringify({ baseDir: true, },),);

    try {
      // Since we cannot easily change Deno.mainModule at test runtime,
      // we only check if it finds it in the passed baseDir.
      const config = await loadConfig<{ baseDir: boolean }>(
        "test",
        undefined,
        tempDir,
      );
      assertEquals(config?.baseDir, true,);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should find configuration inside scripts subfolder of baseDir", async () => {
    const tempDir = await Deno.makeTempDir();
    const scriptsDir = join(tempDir, "scripts",);
    await Deno.mkdir(scriptsDir,);
    const configPath = join(scriptsDir, "test.jsonc",);
    await Deno.writeTextFile(
      configPath,
      JSON.stringify({ inScripts: true, },),
    );

    try {
      const config = await loadConfig<{ inScripts: boolean }>(
        "test",
        undefined,
        tempDir,
      );
      assertEquals(config?.inScripts, true,);

      // Also with explicitPath relative to baseDir or scripts
      const configExplicit = await loadConfig<{ inScripts: boolean }>(
        "test",
        "test.jsonc",
        tempDir,
      );
      assertEquals(configExplicit?.inScripts, true,);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should return null if no file is found", async () => {
    const config = await loadConfig(
      "nonexistent",
      undefined,
      "/tmp/ghost-folder",
    );
    assertEquals(config, null,);
  });
});
