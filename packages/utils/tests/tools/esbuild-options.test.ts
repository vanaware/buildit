/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";

import {
  applyAssetDefine,
  buildBannerFooter,
  buildVersionedDefine,
  copyOptionalProps,
  DEFAULT_VERSION_DEFINE,
  injectVersionPlaceholders,
  resolveDefineVersionKey,
} from "../../src/tools/esbuild-options.ts";

describe("esbuild-options helpers", () => {
  describe("resolveDefineVersionKey", () => {
    it("falls back to the default identifier", () => {
      assertEquals(resolveDefineVersionKey({},), DEFAULT_VERSION_DEFINE,);
    });

    it("prefers the per-target defineVersionString", () => {
      assertEquals(
        resolveDefineVersionKey({ defineVersionString: "__VER__", },),
        "__VER__",
      );
    });

    it("prefers the explicit argument over the config value", () => {
      assertEquals(
        resolveDefineVersionKey({ defineVersionString: "__VER__", }, "__EX__",),
        "__EX__",
      );
    });
  });

  describe("buildVersionedDefine", () => {
    it("merges custom defines and injects the version constant", () => {
      const defines = buildVersionedDefine(
        { define: { DEBUG: "true", }, },
        "1.2.3",
        "__APP_VERSION__",
      );
      assertEquals(defines, {
        DEBUG: "true",
        __APP_VERSION__: '"v1.2.3"',
      },);
    });

    it("reserves the custom key for the version", () => {
      const defines = buildVersionedDefine({}, "0.5.3", "__VER__",);
      assertEquals(defines.__VER__, '"v0.5.3"',);
    });
  });

  describe("applyAssetDefine", () => {
    it("injects the asset list when configured", async () => {
      const finalDefine: Record<string, string> = {};
      const listAssetsFn = (_distDir: string,) =>
        Promise.resolve(["./a.js", "./b.css",],);
      await applyAssetDefine(
        finalDefine,
        { defineAssetsString: "__ASSETS__", distdir: "dist", },
        listAssetsFn,
      );
      assertEquals(
        finalDefine.__ASSETS__,
        JSON.stringify(["./a.js", "./b.css",],),
      );
    });

    it("does nothing without defineAssetsString", async () => {
      const finalDefine: Record<string, string> = {};
      await applyAssetDefine(
        finalDefine,
        { distdir: "dist", },
        () => Promise.resolve([],),
      );
      assertEquals(finalDefine, {},);
    });

    it("does nothing without a listAssetsFn", async () => {
      const finalDefine: Record<string, string> = {};
      await applyAssetDefine(
        finalDefine,
        { defineAssetsString: "__ASSETS__", distdir: "dist", },
        undefined,
      );
      assertEquals(finalDefine, {},);
    });
  });

  describe("injectVersionPlaceholders", () => {
    it("replaces the default placeholder", () => {
      assertEquals(
        injectVersionPlaceholders("build __APP_VERSION__ done", "9.9.9", "K",),
        "build 9.9.9 done",
      );
    });

    it("replaces the custom define key as well", () => {
      assertEquals(
        injectVersionPlaceholders(
          "__VER__ and __APP_VERSION__",
          "1.0.0",
          "__VER__",
        ),
        "1.0.0 and 1.0.0",
      );
    });
  });

  describe("buildBannerFooter", () => {
    it("returns undefined for an undefined source", () => {
      assertEquals(
        buildBannerFooter(undefined, "1.0.0", "__APP_VERSION__",),
        undefined,
      );
    });

    it("returns undefined when no js/css fragment exists", () => {
      assertEquals(
        buildBannerFooter({}, "1.0.0", "__APP_VERSION__",),
        undefined,
      );
    });

    it("injects versions into js and css fragments", () => {
      assertEquals(
        buildBannerFooter(
          { js: "/*! __APP_VERSION__ */", css: "/* __VER__ */", },
          "2.0.0",
          "__VER__",
        ),
        { js: "/*! 2.0.0 */", css: "/* 2.0.0 */", },
      );
    });
  });

  describe("copyOptionalProps", () => {
    it("copies only defined whitelisted properties", () => {
      const source = { a: 1, b: undefined, c: 3, d: 4, };
      const target: Record<string, unknown> = {};
      copyOptionalProps(source, target, ["a", "b", "c",],);
      assertEquals(target, { a: 1, c: 3, },);
    });
  });
});
