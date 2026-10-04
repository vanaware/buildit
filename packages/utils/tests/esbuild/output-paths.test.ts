/// <reference lib="deno.ns" />
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, assertThrows, } from "@std/assert";
import { resolveOutputPaths, } from "../../src/tools/paths.ts";
import { validateTargetConfig, } from "../../src/tools/validate.ts";
import type { TargetConfig, } from "../../src/tools/interfaces.ts";

describe("validateTargetConfig", () => {
  describe("required distdir", () => {
    it("throws error when copyFiles exists but distdir does not", () => {
      const config: TargetConfig = {
        srcdir: "src",
        copyFiles: [{ basedir: "public", },],
        entryPoints: ["app.tsx",],
      };
      assertThrows(
        () => validateTargetConfig("ui", config,),
        Error,
        "'distdir'",
      );
    });
    it("throws error when outfile does not exist and distdir does not", () => {
      const config: TargetConfig = {
        srcdir: "src",
        entryPoints: ["app.tsx",],
      };
      assertThrows(
        () => validateTargetConfig("ui", config,),
        Error,
        "'distdir'",
      );
    });
    it("DOES NOT throw error when outfile exists but distdir does not", () => {
      const config: TargetConfig = {
        srcdir: "src",
        outfile: "/absolute/path/app.js",
        entryPoints: ["app.tsx",],
      };
      // Should not throw
      validateTargetConfig("ui", config,);
    });
    it("DOES NOT throw error when distdir exists", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "dist",
        entryPoints: ["app.tsx",],
      };
      validateTargetConfig("ui", config,);
    });
  });

  describe("educational error messages", () => {
    it("lists all reasons when multiple conditions fail", () => {
      const config: TargetConfig = {
        srcdir: "src",
        copyFiles: [{ basedir: "public", },],
        entryPoints: ["app.tsx",],
      };
      try {
        validateTargetConfig("ui", config,);
      } catch (e) {
        const msg = (e as Error).message;
        assertStringIncludes(msg, "'copyFiles' is configured",);
        assertStringIncludes(msg, "'outfile' is not configured",);
      }
    });
  });
});

describe("resolveOutputPaths", () => {
  describe("outfile relative to distdir", () => {
    it("performs join when both exist", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "monorepo/server/build/dist",
        outfile: "app.js",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, "monorepo/server/build/dist/app.js",);
      assertEquals(result.outdir, undefined,);
    });
    it("performs join with subdirectories", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "dist",
        outfile: "js/app.js",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, "dist/js/app.js",);
    });
  });

  describe("absolute outfile (without distdir)", () => {
    it("keeps outfile as is when distdir does not exist", () => {
      const config: TargetConfig = {
        srcdir: "src",
        outfile: "/absolute/path/app.js",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, "/absolute/path/app.js",);
      assertEquals(result.outdir, undefined,);
    });
  });

  describe("distdir as outdir (without outfile)", () => {
    it("uses distdir as outdir when outfile does not exist", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "dist",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outdir, "dist",);
      assertEquals(result.outfile, undefined,);
    });
  });

  describe("none configured", () => {
    it("returns empty object", () => {
      const config: TargetConfig = {
        srcdir: "src",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, undefined,);
      assertEquals(result.outdir, undefined,);
    });
  });
});
