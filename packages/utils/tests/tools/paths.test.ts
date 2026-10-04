import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import {
  applyDefines,
  cleanTarget,
  copyStaticFiles,
  copyTargetFiles,
  matchesGlobs,
  processFilesWithDefines,
  resolveWithBase,
} from "../../src/tools/paths.ts";

describe("paths.ts - Utilities and features", () => {
  describe("matchesGlobs", () => {
    it("should validate simple glob patterns and extensions", () => {
      assertEquals(matchesGlobs("src/main.ts", ["**/*.ts",],), true,);
      assertEquals(matchesGlobs("src/main.ts", ["**/*.js",],), false,);
      assertEquals(
        matchesGlobs("dist/app.min.js", ["*.js", "**/*.js",],),
        true,
      );
    });

    it("should support brace expansion", () => {
      assertEquals(matchesGlobs("file.jpg", ["*.{png,jpg,gif}",],), true,);
      assertEquals(matchesGlobs("file.svg", ["*.{png,jpg,gif}",],), false,);
      assertEquals(matchesGlobs("file.png", ["*.{png,jpg,gif}",],), true,);
    });
  });

  describe("resolveWithBase", () => {
    it("should join baseDir when path is relative and baseDir is different from .", () => {
      assertEquals(
        resolveWithBase("src", "packages/ui",),
        join("packages/ui", "src",),
      );
      assertEquals(resolveWithBase("dist", ".",), "dist",);
      assertEquals(resolveWithBase(undefined, "packages/ui",), undefined,);
    });

    it("should not modify already absolute paths", () => {
      const absPath = "/absolute/path";
      assertEquals(resolveWithBase(absPath, "packages/ui",), absPath,);
    });
  });

  describe("cleanTarget", () => {
    it("should clean files matching glob while respecting excludes", async () => {
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

        // file1.tmp and file2.tmp should have been deleted
        let file1Exists = true;
        try {
          await Deno.stat(join(tempDir, "file1.tmp",),);
        } catch {
          file1Exists = false;
        }
        assertEquals(file1Exists, false,);

        // keep.tmp and data.json should remain
        const keepStat = await Deno.stat(join(tempDir, "keep.tmp",),);
        assert(keepStat.isFile,);
        const dataStat = await Deno.stat(join(tempDir, "data.json",),);
        assert(dataStat.isFile,);
      } finally {
        await Deno.remove(tempDir, { recursive: true, },).catch(() => {},);
      }
    });

    it("should clean the entire directory with includes: ['*']", async () => {
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
    it("should preserve tree relative to basedir when basedir is specified", async () => {
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

        // Verify integrity of preserved tree
        const copiedIcon = await Deno.readTextFile(
          join(tempDist, "icons", "icon.png",),
        );
        assertEquals(copiedIcon, "image",);

        // Verify version injection into manifest.json
        const copiedManifest = JSON.parse(
          await Deno.readTextFile(join(tempDist, "manifest.json",),),
        );
        assertEquals(copiedManifest.version, "1.2.3",);
      } finally {
        await Deno.remove(tempSrc, { recursive: true, },).catch(() => {},);
        await Deno.remove(tempDist, { recursive: true, },).catch(() => {},);
      }
    });

    it("should copy files directly to distdir root when basedir is not provided", async () => {
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

        // When basedir is not provided, file is placed directly in distdir
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

  describe("applyDefines", () => {
    it("should substitute defined identifiers correctly", () => {
      const code =
        "const v = __APP_VERSION__; const assets = __GENERATED_ASSETS__;";
      const result = applyDefines(code, {
        "__APP_VERSION__": '"1.0.0"',
        "__GENERATED_ASSETS__": '["index.html", "app.js"]',
      },);

      assertEquals(
        result,
        'const v = "1.0.0"; const assets = ["index.html", "app.js"];',
      );
    });

    it("should support custom define keys", () => {
      const code = "const ver = MY_CUSTOM_VERSION;";
      const result = applyDefines(code, {
        "MY_CUSTOM_VERSION": '"2.5.0"',
      },);

      assertEquals(result, 'const ver = "2.5.0";',);
    });
  });

  describe("processFilesWithDefines", () => {
    it("should change file content and return processed list", async () => {
      const tempDir = await Deno.makeTempDir({
        prefix: "buildit_test_process_defines_",
      },);
      try {
        const file1 = join(tempDir, "config.js",);
        const file2 = join(tempDir, "env.txt",);
        const file3 = join(tempDir, "no-change.txt",);

        await Deno.writeTextFile(file1, "const url = __API_URL__;",);
        await Deno.writeTextFile(file2, "VERSION: __APP_VERSION__",);
        await Deno.writeTextFile(file3, "no markers here",);

        const defines = {
          "__API_URL__": '"https://api.test"',
          "__APP_VERSION__": '"1.2.3"',
        };

        const processed = await processFilesWithDefines([
          file1,
          file2,
          file3,
        ], defines,);

        // Only file1 and file2 should be in list since they were changed
        assertEquals(processed.length, 2,);
        assert(processed.includes(file1,),);
        assert(processed.includes(file2,),);
        assert(!processed.includes(file3,),);

        // Verify changed content
        const content1 = await Deno.readTextFile(file1,);
        assertEquals(content1, 'const url = "https://api.test";',);
        const content2 = await Deno.readTextFile(file2,);
        assertEquals(content2, 'VERSION: "1.2.3"',);
        const content3 = await Deno.readTextFile(file3,);
        assertEquals(content3, "no markers here",);
      } finally {
        await Deno.remove(tempDir, { recursive: true, },).catch(() => {},);
      }
    });
  });
});
