import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, assertRejects, } from "@std/assert";
import { tagVersionEngine, } from "../../src/version/tag/engine.ts";
import { tagVersionCli, } from "../../src/version/tag/cli.ts";
import { join, } from "@std/path";

describe("tag-version - Motor e CLI", () => {
  describe("tagVersionEngine", () => {
    it("deriva a tag vMAJOR.MINOR corretamente em modo dryRun", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        filePath,
        '{\n  "version": "0.3.14#abc1234"\n}',
      );

      const res = await tagVersionEngine({
        file: filePath,
        dryRun: true,
        silencioso: true,
      },);

      assertEquals(res.tagName, "v0.3",);
      assertEquals(res.rawVersion, "0.3.14#abc1234",);
      assertEquals(res.sanitizedVersion, "0.3.14",);
      assertEquals(res.message, "Versão v0.3",);
      assertEquals(res.committed, false,);
      assertEquals(res.tagged, false,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("respeita mensagem de commit personalizada", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "version": "1.2.9"\n}',);

      const res = await tagVersionEngine({
        file: filePath,
        message: "Release 1.2 oficial",
        dryRun: true,
        silencioso: true,
      },);

      assertEquals(res.tagName, "v1.2",);
      assertEquals(res.message, "Release 1.2 oficial",);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("executa sanitização em disco quando sanitize é true", async () => {
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
        silencioso: true,
      },);

      assertEquals(res.tagName, "v0.3",);
      const diskContent = await Deno.readTextFile(filePath,);
      assert(diskContent.includes('"version": "0.3.14"',),);
      assert(!diskContent.includes("#muesu7z0",),);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("rejeita quando campo version está ausente", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "name": "sem-versao"\n}',);

      await assertRejects(
        () =>
          tagVersionEngine({
            file: filePath,
            dryRun: true,
            silencioso: true,
          },),
        Error,
        "ausente",
      );

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });

  describe("tagVersionCli", () => {
    it("instancia o comando Cliffy com definições corretas", () => {
      const cmd = tagVersionCli();
      assertEquals(cmd.getName(), "tag-version",);
    });
  });
});
