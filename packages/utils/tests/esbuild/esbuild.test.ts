/**
 * @file esbuild.test.ts
 * @description BDD unit tests for esbuild configuration logic and utilities.
 */

import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, } from "@std/assert";
import { formatVersion, parseVersion, } from "../../src/tools/version.ts";
import { isSafePath, resolveOutputPaths, } from "../../src/tools/paths.ts";
import { ESBUILD_CONFIG_EXAMPLE, } from "../../src/esbuild/config.ts";

describe("esbuild - versioning", () => {
  it("should parse semantic version with hash", () => {
    const v = parseVersion("1.2.3#hash",);
    assertEquals(v.major, 1,);
    assertEquals(v.minor, 2,);
    assertEquals(v.patch, 3,);
  });

  it("should format version correctly", () => {
    const v = formatVersion(0, 3, 8, "test",);
    assertEquals(v, "0.3.8#test",);
  });
});

describe("esbuild - paths", () => {
  it("should validate safe paths", () => {
    assert(isSafePath("dist/output.js",),);
    assert(!isSafePath("../secret.js",),);
    assert(!isSafePath("/etc/passwd",),);
  });

  it("should resolve output paths correctly", () => {
    const config = {
      outfile: "bundle.js",
      distdir: "dist",
      entryPoints: ["main.ts",],
    };
    const resolved = resolveOutputPaths(config,);
    assertEquals(resolved.outfile, "dist/bundle.js",);
  });
});

describe("esbuild - config", () => {
  it("should have a valid configuration example", () => {
    assert(ESBUILD_CONFIG_EXAMPLE.ui !== undefined,);
    assertEquals(ESBUILD_CONFIG_EXAMPLE.ui!.default, true,);
  });
});
