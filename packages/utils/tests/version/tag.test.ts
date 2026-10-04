import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, assertRejects, } from "@std/assert";
import { tagVersionEngine, } from "../../src/version/tag/engine.ts";
import { tagVersionCli, } from "../../src/version/tag/cli.ts";
import { join, } from "@std/path";

describe("tag-version - Engine and CLI", () => {
  describe("tagVersionEngine", () => {
    it("derives the vMAJOR.MINOR tag correctly in dryRun mode", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        filePath,
        '{\n  "version": "0.3.14#abc1234"\n}',
      );

      const res = await tagVersionEngine({
        file: filePath,
        dryRun: true,
        silent: true,
      },);

      assertEquals(res.tagName, "v0.3",);
      assertEquals(res.rawVersion, "0.3.14#abc1234",);
      assertEquals(res.sanitizedVersion, "0.3.14",);
      assertEquals(res.message, "Version v0.3",);
      assertEquals(res.committed, false,);
      assertEquals(res.tagged, false,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("respects custom commit message", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "version": "1.2.9"\n}',);

      const res = await tagVersionEngine({
        file: filePath,
        message: "Official Release 1.2",
        dryRun: true,
        silent: true,
      },);

      assertEquals(res.tagName, "v1.2",);
      assertEquals(res.message, "Official Release 1.2",);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("performs on-disk sanitization when sanitize is true", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        filePath,
        '{\n  "version": "0.3.14#muesu7z0"\n}',
      );

      const res = await tagVersionEngine({
        file: filePath,
        sanitize: true,
        dryRun: true,
        silent: true,
      },);

      assertEquals(res.tagName, "v0.3",);
      const diskContent = await Deno.readTextFile(filePath,);
      assert(diskContent.includes('"version": "0.3.14"',),);
      assert(!diskContent.includes("#muesu7z0",),);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("rejects when version field is missing", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "name": "no-version"\n}',);

      await assertRejects(
        () =>
          tagVersionEngine({
            file: filePath,
            dryRun: true,
            silent: true,
          },),
        Error,
        'Required "version" field not found',
      );

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });

  describe("tagVersionCli", () => {
    it("instantiates the Cliffy command with correct definitions", () => {
      const cmd = tagVersionCli();
      assertEquals(cmd.getName(), "tag-version",);
    });
  });
});
