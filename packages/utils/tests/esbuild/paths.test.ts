/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { isSafePath, } from "../../src/tools/paths.ts";

describe("isSafePath", () => {
  describe("safe paths", () => {
    const safePaths = [
      "arquivo.js",
      "pasta/arquivo.js",
      "pasta/subpasta/arquivo.js",
      ".",
      "file-with-dash.js",
      "file_with_underscore.js",
      "file.name.with.dots.js",
      "UPPERCASE.js",
      "123.js",
      "path/to/file",
    ];

    for (const path of safePaths) {
      it(`accepts "${path}"`, () => {
        assertEquals(isSafePath(path,), true,);
      });
    }
  });

  describe("blocked paths (path traversal)", () => {
    const traversalPaths = [
      "..",
      "../file.js",
      "pasta/../file.js",
      "a/b/c/../../file.js",
      "../../../etc/passwd",
      "foo..bar",
      "file..js",
    ];

    for (const path of traversalPaths) {
      it(`blocks "${path}"`, () => {
        assertEquals(isSafePath(path,), false,);
      });
    }
  });

  describe("blocked paths (Unix absolute)", () => {
    const absolutePaths = [
      "/etc/passwd",
      "/home/user",
      "/var/log/system.log",
      "/tmp/test",
    ];

    for (const path of absolutePaths) {
      it(`blocks "${path}"`, () => {
        assertEquals(isSafePath(path,), false,);
      });
    }
  });

  describe("edge cases", () => {
    it("empty string is considered safe (neither traversal nor absolute)", () => {
      assertEquals(isSafePath("",), true,);
    });

    it("path with whitespace only is safe", () => {
      assertEquals(isSafePath("   ",), true,);
    });

    it("path with special characters is safe", () => {
      assertEquals(isSafePath("file@name.js",), true,);
      assertEquals(isSafePath("file+name.js",), true,);
    });
  });
});
