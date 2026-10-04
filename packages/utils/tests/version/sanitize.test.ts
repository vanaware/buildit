import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, assertRejects, } from "@std/assert";
import { sanitizeVersionFile, } from "../../src/version/sanitize/engine.ts";
import { sanitizeVersionCli, } from "../../src/version/sanitize/cli.ts";
import { join, } from "@std/path";

describe("sanitize-version - Engine and CLI", () => {
  describe("sanitizeVersionFile", () => {
    it("does not change file that already has a valid semver version", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "version": "1.2.3"\n}',);

      const res = await sanitizeVersionFile({ filePath, silent: true, },);
      assertEquals(res.rawVersion, "1.2.3",);
      assertEquals(res.sanitizedVersion, "1.2.3",);
      assertEquals(res.updated, false,);

      const content = await Deno.readTextFile(filePath,);
      assertEquals(content, '{\n  "version": "1.2.3"\n}',);
      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("sanitizes version with hash in the file", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        filePath,
        '{\n  "name": "test",\n  "version": "0.3.14#muesu7z0",\n  "license": "MIT"\n}',
      );

      const res = await sanitizeVersionFile({ filePath, silent: true, },);
      assertEquals(res.rawVersion, "0.3.14#muesu7z0",);
      assertEquals(res.sanitizedVersion, "0.3.14",);
      assertEquals(res.updated, true,);

      const updated = await Deno.readTextFile(filePath,);
      assert(updated.includes('"version": "0.3.14"',),);
      assert(!updated.includes("#muesu7z0",),);
      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("injects version: 0.0.0 when the version field is missing", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "name": "no-version"\n}',);

      const res = await sanitizeVersionFile({ filePath, silent: true, },);
      assertEquals(res.rawVersion, "0.0.0",);
      assertEquals(res.sanitizedVersion, "0.0.0",);
      assertEquals(res.updated, false,);

      const updated = await Deno.readTextFile(filePath,);
      assert(updated.includes('"version": "0.0.0"',),);
      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("fails when explicit file does not exist", async () => {
      await assertRejects(
        () =>
          sanitizeVersionFile({
            filePath: "/fictional/path/deno.jsonc",
            silent: true,
          },),
        Error,
        "not found",
      );
    });
  });

  describe("sanitizeVersionCli", () => {
    it("instantiates Cliffy command with correct definitions", () => {
      const cmd = sanitizeVersionCli();
      assertEquals(cmd.getName(), "sanitize-version",);
    });
  });
});
