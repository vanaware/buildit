import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertThrows, } from "@std/assert";
import { join, } from "@std/path";
import {
  ensureVersionFile,
  ensureVersionFiles,
  formatVersion,
  parseVersion,
  readProjectVersion,
  updateProjectVersion,
} from "../../src/tools/version.ts";

describe("version utils", () => {
  describe("parseVersion e formatVersion", () => {
    it("deve parsear versões semânticas válidas", () => {
      const parsed = parseVersion("1.2.3#abc",);
      assertEquals(parsed, { major: 1, minor: 2, patch: 3, },);
    });

    it("deve formatar componentes em formato semântico", () => {
      const formatted = formatVersion(1, 2, 4, "hash123",);
      assertEquals(formatted, "1.2.4#hash123",);
    });

    it("deve rejeitar versões inválidas", () => {
      assertThrows(() => {
        parseVersion("invalid",);
      },);
    });
  });

  describe("readProjectVersion", () => {
    it("deve ler a versão do deno.jsonc raiz", async () => {
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

  describe("ensureVersionFile e ensureVersionFiles", () => {
    it("deve criar o arquivo com template __APP_VERSION__ se não existir", async () => {
      const tempDir = await Deno.makeTempDir();
      const targetPath = join(tempDir, "pkg", "version.ts",);

      const created = await ensureVersionFile(targetPath,);
      assertEquals(created, true,);

      const content = await Deno.readTextFile(targetPath,);
      assertEquals(content.includes("__APP_VERSION__",), true,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("NÃO deve sobrescrever o arquivo se já existir", async () => {
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

  describe("updateProjectVersion e versionPaths", () => {
    it("deve respeitar a opção noversion e garantir versionPaths", async () => {
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

    it("deve incrementar a versão e criar múltiplos versionPaths se não existirem", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        denoJsonc,
        JSON.stringify({ version: "1.0.0", },),
      );

      const path1 = join(tempDir, "pkg1", "version.ts",);
      const path2 = join(tempDir, "pkg2",); // diretório

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

    it("deve propagar a versão nos workspaces quando forcepackagesversion for true", async () => {
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

    it("deve respeitar defineVersionString customizado ao criar version.ts", async () => {
      const tempDir = await Deno.makeTempDir();
      const targetPath = join(tempDir, "version.ts",);

      await ensureVersionFile(targetPath, tempDir, "__CUSTOM_VERSION__",);
      const content = await Deno.readTextFile(targetPath,);

      assertEquals(content.includes("__CUSTOM_VERSION__",), true,);
      assertEquals(content.includes("__APP_VERSION__",), false,);

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });
});
