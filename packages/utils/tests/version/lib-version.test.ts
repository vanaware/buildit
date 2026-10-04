import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertNotEquals, } from "@std/assert";
import { findDenoFile, sanitizeVersion, } from "../../src/tools/version.ts";

describe("lib-version - TypeScript equivalent of lib-version.sh", () => {
  describe("sanitizeVersion", () => {
    it("keeps pure semver versions unchanged", () => {
      assertEquals(sanitizeVersion("1.2.3",), "1.2.3",);
      assertEquals(sanitizeVersion("0.3.14",), "0.3.14",);
      assertEquals(sanitizeVersion("10.20.30",), "10.20.30",);
    });

    it("removes 'v' prefix", () => {
      assertEquals(sanitizeVersion("v1.2.3",), "1.2.3",);
      assertEquals(sanitizeVersion("v0.3.14",), "0.3.14",);
    });

    it("removes hash suffix (#hash)", () => {
      assertEquals(sanitizeVersion("0.3.14#muesu7z0",), "0.3.14",);
      assertEquals(sanitizeVersion("v1.2.3#abc1234",), "1.2.3",);
    });

    it("removes pre-release tags (-alpha, -beta.1)", () => {
      assertEquals(sanitizeVersion("1.2.3-alpha",), "1.2.3",);
      assertEquals(sanitizeVersion("2.0.0-rc.1",), "2.0.0",);
    });

    it("removes build metadata (+build.123)", () => {
      assertEquals(sanitizeVersion("1.2.3+20130313144700",), "1.2.3",);
      assertEquals(sanitizeVersion("1.2.3-beta+exp.sha.5114f85",), "1.2.3",);
    });

    it("fills missing components with 0", () => {
      assertEquals(sanitizeVersion("1.2",), "1.2.0",);
      assertEquals(sanitizeVersion("5",), "5.0.0",);
      assertEquals(sanitizeVersion("",), "0.0.0",);
    });

    it("discards components beyond patch (e.g., 1.2.3.4.5)", () => {
      assertEquals(sanitizeVersion("1.2.3.4.5",), "1.2.3",);
    });

    it("returns 0.0.0 for invalid non-numeric strings", () => {
      assertEquals(sanitizeVersion("invalid",), "0.0.0",);
      assertEquals(sanitizeVersion("v",), "0.0.0",);
      assertEquals(sanitizeVersion("###",), "0.0.0",);
    });
  });

  describe("findDenoFile", () => {
    it("locates deno.jsonc in workspace directory", () => {
      const found = findDenoFile(".",);
      assertNotEquals(found, null,);
      assertEquals(found?.endsWith("deno.jsonc",), true,);
    });

    it("climbs directory tree from subfolders", () => {
      const startDir = import.meta.dirname ?? ".";
      const found = findDenoFile(startDir,);
      assertNotEquals(found, null,);
    });

    it("returns null for non-existent paths outside project", () => {
      const found = findDenoFile("/tmp/non-existent-dir-for-test-999",);
      assertEquals(found, null,);
    });
  });
});
