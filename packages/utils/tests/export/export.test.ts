/**
 * @file export.test.ts
 * @description BDD unit tests for filtering logic, expandGlob, and context exporter execution.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { EXPORT_CONFIG_EXAMPLE, } from "../../src/export/config.ts";
import { shouldIncludeFile, } from "../../src/export/formatter.ts";
import { collectFilesForExport, } from "../../src/export/engine.ts";
import type { ExportConfig, } from "../../src/tools/interfaces.ts";

describe("shouldIncludeFile", () => {
  it("should BLOCK any file inside exports/ or snapshots/ folder", () => {
    const config = EXPORT_CONFIG_EXAMPLE.ui!;
    assertEquals(shouldIncludeFile("exports/ui.md", config,), false,);
    assertEquals(shouldIncludeFile("snapshots/server.md", config,), false,);
    assertEquals(
      shouldIncludeFile("exports/.github/workflows/test.yml", config,),
      false,
    );
  });

  it("should ALLOW paths matching includes pattern", () => {
    const config: ExportConfig = {
      outputFile: "snapshots/custom.md",
      includes: [
        "packages/server/{src,docs}/**/*.{ts,md}",
        ".github/workflows/**/*.{yaml,yml}",
      ],
      excludes: ["**/*.test.ts",],
    };

    assertEquals(
      shouldIncludeFile("packages/server/src/main.ts", config,),
      true,
    );
    assertEquals(
      shouldIncludeFile("packages/server/docs/architecture.md", config,),
      true,
    );
    assertEquals(
      shouldIncludeFile(".github/workflows/deploy.yml", config,),
      true,
    );
  });

  it("should BLOCK paths matching excludes pattern", () => {
    const config: ExportConfig = {
      outputFile: "snapshots/custom.md",
      includes: ["packages/server/src/**/*.{ts,tsx}",],
      excludes: ["**/*.test.ts", "**/dist/**",],
    };

    assertEquals(
      shouldIncludeFile("packages/server/src/main.ts", config,),
      true,
    );
    assertEquals(
      shouldIncludeFile("packages/server/src/main.test.ts", config,),
      false,
    );
    assertEquals(
      shouldIncludeFile("packages/server/src/dist/bundle.ts", config,),
      false,
    );
  });

  it("should BLOCK files outside includes patterns", () => {
    const config: ExportConfig = {
      outputFile: "snapshots/custom.md",
      includes: ["packages/server/src/**/*.{ts,tsx}",],
    };

    assertEquals(
      shouldIncludeFile("packages/ui/src/app.tsx", config,),
      false,
    );
    assertEquals(
      shouldIncludeFile("docs/readme.md", config,),
      false,
    );
  });
});

describe("collectFilesForExport (expandGlob)", () => {
  it("should collect files using brace expansion and respect excludes in sorted order", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    const testDir = join(tempDir, "tests",);
    await Deno.mkdir(srcDir, { recursive: true, },);
    await Deno.mkdir(testDir, { recursive: true, },);

    await Deno.writeTextFile(join(srcDir, "index.ts",), "console.log(1);",);
    await Deno.writeTextFile(
      join(srcDir, "app.tsx",),
      "export default () => {};",
    );
    await Deno.writeTextFile(join(srcDir, "helper.test.ts",), "test",);
    await Deno.writeTextFile(join(testDir, "suite.test.ts",), "test",);

    const config: ExportConfig = {
      outputFile: "snapshots/out.md",
      includes: [
        "src/**/*.{ts,tsx}",
      ],
      excludes: [
        "**/*.test.ts",
      ],
    };

    const files = await collectFilesForExport(config, tempDir,);

    assertEquals(files, [
      "src/app.tsx",
      "src/index.ts",
    ],);

    await Deno.remove(tempDir, { recursive: true, },);
  });
});
