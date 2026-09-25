import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, assertRejects, } from "@std/assert";
import { sanitizeVersionFile, } from "../../src/version/sanitize/engine.ts";
import { sanitizeVersionCli, } from "../../src/version/sanitize/cli.ts";
import { join, } from "@std/path";

describe("sanitize-version - Motor e CLI", () => {
  describe("sanitizeVersionFile", () => {
    it("não altera arquivo que já possui versão semver válida", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "version": "1.2.3"\n}',);

      const res = await sanitizeVersionFile({ filePath, silencioso: true, },);
      assertEquals(res.rawVersion, "1.2.3",);
      assertEquals(res.sanitizedVersion, "1.2.3",);
      assertEquals(res.updated, false,);

      const content = await Deno.readTextFile(filePath,);
      assertEquals(content, '{\n  "version": "1.2.3"\n}',);
      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("sanitiza versão com hash no arquivo", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        filePath,
        '{\n  "name": "teste",\n  "version": "0.3.14#muesu7z0",\n  "license": "MIT"\n}',
      );

      const res = await sanitizeVersionFile({ filePath, silencioso: true, },);
      assertEquals(res.rawVersion, "0.3.14#muesu7z0",);
      assertEquals(res.sanitizedVersion, "0.3.14",);
      assertEquals(res.updated, true,);

      const updated = await Deno.readTextFile(filePath,);
      assert(updated.includes('"version": "0.3.14"',),);
      assert(!updated.includes("#muesu7z0",),);
      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("injeta version: 0.0.0 quando o campo version estiver ausente", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "name": "sem-versao"\n}',);

      const res = await sanitizeVersionFile({ filePath, silencioso: true, },);
      assertEquals(res.rawVersion, "0.0.0",);
      assertEquals(res.sanitizedVersion, "0.0.0",);
      assertEquals(res.updated, false,);

      const updated = await Deno.readTextFile(filePath,);
      assert(updated.includes('"version": "0.0.0"',),);
      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("falha quando arquivo explícito não existe", async () => {
      await assertRejects(
        () =>
          sanitizeVersionFile({
            filePath: "/caminho/ficticio/deno.jsonc",
            silencioso: true,
          },),
        Error,
        "não encontrado",
      );
    });
  });

  describe("sanitizeVersionCli", () => {
    it("instancia o comando Cliffy com definições corretas", () => {
      const cmd = sanitizeVersionCli();
      assertEquals(cmd.getName(), "sanitize-version",);
    });
  });
});
