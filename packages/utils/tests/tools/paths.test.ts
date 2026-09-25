import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import {
  cleanTarget,
  copyStaticFiles,
  copyTargetFiles,
  correspondeGlobs,
  resolveWithBase,
} from "../../src/tools/paths.ts";

describe("paths.ts - Utilitários e novas funcionalidades", () => {
  describe("correspondeGlobs", () => {
    it("deve validar padrões glob simples e extensões", () => {
      assertEquals(correspondeGlobs("src/main.ts", ["**/*.ts",],), true,);
      assertEquals(correspondeGlobs("src/main.ts", ["**/*.js",],), false,);
      assertEquals(
        correspondeGlobs("dist/app.min.js", ["*.js", "**/*.js",],),
        true,
      );
    });

    it("deve suportar brace expansion", () => {
      assertEquals(correspondeGlobs("file.jpg", ["*.{png,jpg,gif}",],), true,);
      assertEquals(correspondeGlobs("file.svg", ["*.{png,jpg,gif}",],), false,);
      assertEquals(correspondeGlobs("file.png", ["*.{png,jpg,gif}",],), true,);
    });
  });

  describe("resolveWithBase", () => {
    it("deve juntar baseDir quando o caminho for relativo e baseDir for diferente de .", () => {
      assertEquals(
        resolveWithBase("src", "packages/ui",),
        join("packages/ui", "src",),
      );
      assertEquals(resolveWithBase("dist", ".",), "dist",);
      assertEquals(resolveWithBase(undefined, "packages/ui",), undefined,);
    });

    it("não deve modificar caminhos já absolutos", () => {
      const absPath = "/absolute/path";
      assertEquals(resolveWithBase(absPath, "packages/ui",), absPath,);
    });
  });

  describe("cleanTarget", () => {
    it("deve limpar arquivos correspondentes ao glob respeitando excludes", async () => {
      const tempDir = await Deno.makeTempDir({
        prefix: "buildit_test_clean_",
      },);
      try {
        await Deno.writeTextFile(join(tempDir, "file1.tmp",), "temp 1",);
        await Deno.writeTextFile(join(tempDir, "file2.tmp",), "temp 2",);
        await Deno.writeTextFile(join(tempDir, "keep.tmp",), "keep",);
        await Deno.writeTextFile(join(tempDir, "data.json",), "data",);

        await cleanTarget(tempDir, {
          includes: ["*.tmp",],
          excludes: ["keep.tmp",],
        },);

        // file1.tmp e file2.tmp devem ter sido deletados
        let file1Exists = true;
        try {
          await Deno.stat(join(tempDir, "file1.tmp",),);
        } catch {
          file1Exists = false;
        }
        assertEquals(file1Exists, false,);

        // keep.tmp e data.json devem permanecer
        const keepStat = await Deno.stat(join(tempDir, "keep.tmp",),);
        assert(keepStat.isFile,);
        const dataStat = await Deno.stat(join(tempDir, "data.json",),);
        assert(dataStat.isFile,);
      } finally {
        await Deno.remove(tempDir, { recursive: true, },).catch(() => {},);
      }
    });

    it("deve limpar todo o diretório com includes: ['*']", async () => {
      const tempDir = await Deno.makeTempDir({
        prefix: "buildit_test_clean_all_",
      },);
      try {
        await Deno.writeTextFile(join(tempDir, "file1.txt",), "hello",);
        await Deno.mkdir(join(tempDir, "sub",),);
        await Deno.writeTextFile(join(tempDir, "sub", "file2.txt",), "world",);

        await cleanTarget(tempDir, { includes: ["*",], },);

        const entries: string[] = [];
        for await (const entry of Deno.readDir(tempDir,)) {
          entries.push(entry.name,);
        }
        assertEquals(entries.length, 0,);
      } finally {
        await Deno.remove(tempDir, { recursive: true, },).catch(() => {},);
      }
    });
  });

  describe("copyTargetFiles", () => {
    it("deve preservar árvore relativa ao basedir quando basedir for especificado", async () => {
      const tempSrc = await Deno.makeTempDir({ prefix: "buildit_test_src_", },);
      const tempDist = await Deno.makeTempDir({
        prefix: "buildit_test_dist_",
      },);

      try {
        await Deno.mkdir(join(tempSrc, "icons",), { recursive: true, },);
        await Deno.writeTextFile(join(tempSrc, "icons", "icon.png",), "image",);
        await Deno.writeTextFile(
          join(tempSrc, "manifest.json",),
          JSON.stringify({ name: "App", },),
        );

        await copyTargetFiles(
          [{ basedir: tempSrc, },],
          tempDist,
          "1.2.3",
        );

        // Verifica integridade da árvore preservada
        const copiedIcon = await Deno.readTextFile(
          join(tempDist, "icons", "icon.png",),
        );
        assertEquals(copiedIcon, "image",);

        // Verifica injeção da versão no manifest.json
        const copiedManifest = JSON.parse(
          await Deno.readTextFile(join(tempDist, "manifest.json",),),
        );
        assertEquals(copiedManifest.version, "1.2.3",);
      } finally {
        await Deno.remove(tempSrc, { recursive: true, },).catch(() => {},);
        await Deno.remove(tempDist, { recursive: true, },).catch(() => {},);
      }
    });

    it("deve copiar arquivos diretamente na raiz do distdir quando basedir não for informado", async () => {
      const tempRoot = await Deno.makeTempDir({
        prefix: "buildit_test_root_",
      },);
      const tempDist = await Deno.makeTempDir({
        prefix: "buildit_test_dist2_",
      },);

      try {
        await Deno.mkdir(join(tempRoot, "sub1", "sub2",), {
          recursive: true,
        },);
        await Deno.writeTextFile(
          join(tempRoot, "sub1", "sub2", "style.css",),
          "body{}",
        );

        await copyTargetFiles(
          [{ includes: ["sub1/sub2/*.css",], },],
          tempDist,
          "1.0.0",
          tempRoot,
        );

        // Quando basedir não é informado, arquivo é colocado diretamente no distdir
        const fileContent = await Deno.readTextFile(
          join(tempDist, "style.css",),
        );
        assertEquals(fileContent, "body{}",);
      } finally {
        await Deno.remove(tempRoot, { recursive: true, },).catch(() => {},);
        await Deno.remove(tempDist, { recursive: true, },).catch(() => {},);
      }
    });
  });
});
