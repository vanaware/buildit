/**
 * @file denobuild.test.ts
 * @description BDD unit tests for denobuild configuration logic and utilities.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { buildBundleOptions, } from "../../src/denobuild/bundle.ts";
import { applyDefines, } from "../../src/tools/paths.ts";
import { DENOBUILD_CONFIG_EXAMPLE, } from "../../src/denobuild/config.ts";
import { withFileStructure, } from "../helpers/fixtures.ts";

describe("denobuild - applyDefines", () => {
  it("should replace simple identifiers", () => {
    const code = "const version = __APP_VERSION__;";
    const defines = { "__APP_VERSION__": '"1.2.3"', };
    const result = applyDefines(code, defines,);
    assertEquals(result, 'const version = "1.2.3";',);
  });

  it("should replace multiple identifiers", () => {
    const code = "if (__DEBUG__) console.log(__MSG__);";
    const defines = { "__DEBUG__": "true", "__MSG__": '"hello"', };
    const result = applyDefines(code, defines,);
    assertEquals(result, 'if (true) console.log("hello");',);
  });

  it("should handle special characters in keys", () => {
    const code = "process.env.NODE_ENV";
    const defines = { "process.env.NODE_ENV": '"production"', };
    const result = applyDefines(code, defines,);
    assertEquals(result, '"production"',);
  });
});

describe("denobuild - buildBundleOptions", () => {
  it("should generate basic options from configuration", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "src/main.tsx": "export const test = 1;",
    },);
    try {
      const config = {
        ...DENOBUILD_CONFIG_EXAMPLE.ui!,
        srcdir: join(dir, "src",),
      };
      const options = buildBundleOptions(config,);

      assertEquals(options.minify, false,);
      assertEquals(options.platform, "browser",);
      assertEquals(options.format, "esm",);
      assertEquals(options.write, false,);
    } finally {
      await cleanup();
    }
  });
});
