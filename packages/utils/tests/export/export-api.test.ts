import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { exportEngine, } from "../../src/export/engine.ts";

describe("exportEngine programmatic API", () => {
  it("should accept configuration based on includes/excludes and perform streaming to disk", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    await Deno.mkdir(srcDir, { recursive: true, },);

    // Create deno.jsonc with custom project version
    const denoJsonc = join(tempDir, "deno.jsonc",);
    await Deno.writeTextFile(
      denoJsonc,
      JSON.stringify({ version: "0.9.5", },),
    );

    // Create test files
    await Deno.writeTextFile(
      join(srcDir, "sample.ts",),
      'export const hello = "world";',
    );
    await Deno.writeTextFile(join(srcDir, "ignore.test.ts",), "test",);

    const inMemoryConfig = {
      testMode: {
        outputFile: "snapshots/test-out.md",
        includes: ["src/**/*.{ts,tsx}",],
        excludes: ["**/*.test.ts",],
        includeVersion: true,
        customInstruction: "Test snapshot for AI",
        default: true,
      },
    };

    const results = await exportEngine({
      config: inMemoryConfig,
      modes: ["testMode",],
      baseDir: tempDir,
      denoJsoncPath: denoJsonc,
      silent: true,
    },);

    assertEquals(results.length, 1,);
    assertEquals(results[0]?.mode, "testMode",);
    assertEquals(results[0]?.files, 1,);
    assertEquals((results[0]?.bytes ?? 0) > 0, true,);

    const snapshotContent = await Deno.readTextFile(
      join(tempDir, "snapshots", "test-out.md",),
    );
    assertEquals(snapshotContent.includes("[v0.9.5]",), true,);
    assertEquals(
      snapshotContent.includes("Test snapshot for AI",),
      true,
    );
    assertEquals(
      snapshotContent.includes('export const hello = "world";',),
      true,
    );
    assertEquals(snapshotContent.includes("ignore.test.ts",), false,);

    await Deno.remove(tempDir, { recursive: true, },);
  });

  it("should export successfully using includes and globs", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    await Deno.mkdir(srcDir, { recursive: true, },);

    await Deno.writeTextFile(
      join(srcDir, "index.ts",),
      'console.log("direct config");',
    );

    // Add deno.jsonc to avoid required version error
    const denoJsonc = join(tempDir, "deno.jsonc",);
    await Deno.writeTextFile(
      denoJsonc,
      JSON.stringify({ version: "1.0.0", },),
    );

    const results = await exportEngine({
      config: {
        direct: {
          outputFile: "direct.md",
          includes: ["src/**/*.{ts,tsx}",],
          includeVersion: false,
          customInstruction: "Direct test",
        },
      },
      modes: ["direct",],
      baseDir: tempDir,
      denoJsoncPath: denoJsonc,
      silent: true,
    },);

    assertEquals(results.length, 1,);
    assertEquals(results[0]?.mode, "direct",);
    assertEquals(results[0]?.files, 1,);

    const snapshot = await Deno.readTextFile(join(tempDir, "direct.md",),);
    assertEquals(snapshot.includes('console.log("direct config");',), true,);

    await Deno.remove(tempDir, { recursive: true, },);
  });

  it("should substitute customized defineVersionString in instructions and header", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    await Deno.mkdir(srcDir, { recursive: true, },);

    await Deno.writeTextFile(
      join(srcDir, "index.ts",),
      'console.log("version replacement");',
    );

    const denoJsonc = join(tempDir, "deno.jsonc",);
    await Deno.writeTextFile(
      denoJsonc,
      JSON.stringify({ version: "2.5.0", },),
    );

    const results = await exportEngine({
      config: {
        versionTest: {
          outputFile: "version-out.md",
          includes: ["src/**/*.ts",],
          customInstruction: "App version: MY_CUSTOM_VER",
          header: "Header with MY_CUSTOM_VER",
        },
      },
      defineVersionString: "MY_CUSTOM_VER",
      modes: ["versionTest",],
      baseDir: tempDir,
      denoJsoncPath: denoJsonc,
      silent: true,
    },);

    assertEquals(results.length, 1,);
    const snapshot = await Deno.readTextFile(join(tempDir, "version-out.md",),);
    assertEquals(snapshot.includes("App version: 2.5.0",), true,);
    assertEquals(snapshot.includes("Header with 2.5.0",), true,);

    await Deno.remove(tempDir, { recursive: true, },);
  });
});
