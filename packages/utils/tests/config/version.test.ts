import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertThrows, } from "@std/assert";
import { join, } from "@std/path";
import {
  ensureVersionFile,
  ensureVersionFiles,
  formatVersion,
  incrementProjectVersion,
  parseVersion,
  readProjectVersion,
  updateProjectVersion,
} from "../../src/tools/version.ts";

describe("version utils", () => {
  describe("parseVersion and formatVersion", () => {
    it("should parse valid semantic versions", () => {
      const parsed = parseVersion("1.2.3#abc",);
      assertEquals(parsed, { major: 1, minor: 2, patch: 3, },);
    });

    it("should format components into semantic format", () => {
      const formatted = formatVersion(1, 2, 4, "hash123",);
      assertEquals(formatted, "1.2.4#hash123",);
    });

    it("should reject invalid versions", () => {
      assertThrows(() => {
        parseVersion("invalid",);
      },);
    });
  });

  describe("readProjectVersion", () => {
    it("should read version from root deno.jsonc", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        denoJsonc,
        JSON.stringify({ version: "0.5.0", },),
      );

      const ver = await readProjectVersion(denoJsonc,);
      assertEquals(ver, "0.5.0",);

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });

  describe("ensureVersionFile and ensureVersionFiles", () => {
    it("should create file with __APP_VERSION__ template if not existing", async () => {
      const tempDir = await Deno.makeTempDir();
      const targetPath = join(tempDir, "pkg", "version.ts",);

      const created = await ensureVersionFile(targetPath,);
      assertEquals(created, true,);

      const content = await Deno.readTextFile(targetPath,);
      assertEquals(content.includes("__APP_VERSION__",), true,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("should NOT overwrite file if it already exists", async () => {
      const tempDir = await Deno.makeTempDir();
      const targetPath = join(tempDir, "version.ts",);

      await Deno.writeTextFile(targetPath, "// custom version file content",);

      const created = await ensureVersionFile(targetPath,);
      assertEquals(created, false,);

      const content = await Deno.readTextFile(targetPath,);
      assertEquals(content, "// custom version file content",);

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });

  describe("updateProjectVersion and versionPaths", () => {
    it("should respect noversion option and ensure versionPaths", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        denoJsonc,
        JSON.stringify({ version: "1.0.0", },),
      );

      const ver = await updateProjectVersion({
        denoJsonPath: denoJsonc,
        noversion: true,
        versionPaths: [join(tempDir, "version.ts",),],
      },);

      assertEquals(ver, "1.0.0",);
      const generated = await Deno.readTextFile(join(tempDir, "version.ts",),);
      assertEquals(generated.includes("__APP_VERSION__",), true,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("should increment version and create multiple versionPaths if not existing", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        denoJsonc,
        JSON.stringify({ version: "1.0.0", },),
      );

      const path1 = join(tempDir, "pkg1", "version.ts",);
      const path2 = join(tempDir, "pkg2",); // directory

      const ver = await updateProjectVersion({
        denoJsonPath: denoJsonc,
        noversion: false,
        buildHash: "fixedhash",
        versionPaths: [path1, path2,],
      },);

      assertEquals(ver, "1.0.1#fixedhash",);

      const file1 = await Deno.readTextFile(path1,);
      const file2 = await Deno.readTextFile(join(path2, "version.ts",),);

      assertEquals(file1.includes("__APP_VERSION__",), true,);
      assertEquals(file2.includes("__APP_VERSION__",), true,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("should propagate version to workspaces when forcepackagesversion is true", async () => {
      const tempDir = await Deno.makeTempDir();
      const rootJson = join(tempDir, "deno.jsonc",);
      const subpkgDir = join(tempDir, "packages", "sub",);
      await Deno.mkdir(subpkgDir, { recursive: true, },);

      await Deno.writeTextFile(
        rootJson,
        JSON.stringify({
          version: "2.0.0",
          workspace: ["./packages/sub",],
        },),
      );

      const subJson = join(subpkgDir, "deno.jsonc",);
      await Deno.writeTextFile(
        subJson,
        JSON.stringify({ name: "sub", version: "2.0.0", },),
      );

      const ver = await updateProjectVersion({
        denoJsonPath: rootJson,
        noversion: false,
        buildHash: "testws",
        forcepackagesversion: true,
        versionPaths: [],
      },);

      assertEquals(ver, "2.0.1#testws",);

      const subContent = await Deno.readTextFile(subJson,);
      assertEquals(subContent.includes("2.0.1#testws",), true,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("should respect customized defineVersionString when creating version.ts", async () => {
      const tempDir = await Deno.makeTempDir();
      const targetPath = join(tempDir, "version.ts",);

      await ensureVersionFile(targetPath, tempDir, "__CUSTOM_VERSION__",);
      const content = await Deno.readTextFile(targetPath,);

      assertEquals(content.includes("__CUSTOM_VERSION__",), true,);
      assertEquals(content.includes("__APP_VERSION__",), false,);

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });

  describe("incrementProjectVersion", () => {
    it("should read from deno.jsonc file, increment patch + 1 and save", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        denoJsonc,
        JSON.stringify({ name: "my-pkg", version: "1.2.3", }, null, 2,),
      );

      const newVer = await incrementProjectVersion({
        denoJsonPath: denoJsonc,
        buildHash: "hash999",
      },);

      assertEquals(newVer, "1.2.4#hash999",);

      const saved = await Deno.readTextFile(denoJsonc,);
      assertEquals(JSON.parse(saved,).version, "1.2.4#hash999",);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("should respect explicitly provided currentVersion and update deno.json", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJson = join(tempDir, "deno.json",);
      await Deno.writeTextFile(
        denoJson,
        JSON.stringify({ name: "my-pkg", version: "0.1.0", }, null, 2,),
      );

      const newVer = await incrementProjectVersion({
        baseDir: tempDir,
        denoJsonPath: denoJson,
        currentVersion: "3.4.5",
        buildHash: "xyz",
      },);

      assertEquals(newVer, "3.4.6#xyz",);

      const saved = await Deno.readTextFile(denoJson,);
      assertEquals(JSON.parse(saved,).version, "3.4.6#xyz",);

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });
});
