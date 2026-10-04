/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { syncWorkspaces, } from "../../src/tools/version.ts";

describe("syncWorkspaces", () => {
  it("should synchronize the existing version in root deno.jsonc to workspace packages", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const rootConfig = {
        name: "root-project",
        version: "1.2.3#xyz",
        workspace: ["./packages/pkg-a", "./packages/pkg-b",],
      };
      await Deno.writeTextFile(
        join(tempDir, "deno.jsonc",),
        JSON.stringify(rootConfig, null, 2,),
      );

      const pkgADir = join(tempDir, "packages", "pkg-a",);
      const pkgBDir = join(tempDir, "packages", "pkg-b",);
      await Deno.mkdir(pkgADir, { recursive: true, },);
      await Deno.mkdir(pkgBDir, { recursive: true, },);

      await Deno.writeTextFile(
        join(pkgADir, "deno.jsonc",),
        JSON.stringify({ name: "pkg-a", version: "0.0.1", }, null, 2,),
      );
      await Deno.writeTextFile(
        join(pkgBDir, "deno.json",),
        JSON.stringify({ name: "pkg-b", version: "0.0.2", }, null, 2,),
      );

      // Runs syncWorkspaces with only baseDir (should read version from root deno.jsonc)
      const syncedVersion = await syncWorkspaces({ baseDir: tempDir, },);
      assertEquals(syncedVersion, "1.2.3#xyz",);

      const pkgAContent = await Deno.readTextFile(
        join(pkgADir, "deno.jsonc",),
      );
      const pkgBContent = await Deno.readTextFile(join(pkgBDir, "deno.json",),);

      assertEquals(JSON.parse(pkgAContent,).version, "1.2.3#xyz",);
      assertEquals(JSON.parse(pkgBContent,).version, "1.2.3#xyz",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should accept explicit denoJsonPath and override with currentVersion if provided", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const rootConfig = {
        name: "custom-root",
        version: "1.0.0",
        workspace: ["./subpkg",],
      };
      const customConfigPath = join(tempDir, "custom-deno.jsonc",);
      await Deno.writeTextFile(
        customConfigPath,
        JSON.stringify(rootConfig, null, 2,),
      );

      const subPkgDir = join(tempDir, "subpkg",);
      await Deno.mkdir(subPkgDir, { recursive: true, },);
      await Deno.writeTextFile(
        join(subPkgDir, "deno.json",),
        JSON.stringify({ name: "subpkg", version: "0.1.0", }, null, 2,),
      );

      const syncedVersion = await syncWorkspaces({
        denoJsonPath: customConfigPath,
        currentVersion: "2.0.0",
      },);
      assertEquals(syncedVersion, "2.0.0",);

      const subPkgContent = await Deno.readTextFile(
        join(subPkgDir, "deno.json",),
      );
      assertEquals(JSON.parse(subPkgContent,).version, "2.0.0",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});
