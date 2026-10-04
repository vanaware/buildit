/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import { join, } from "@std/path";
import { ensureVersionFile, } from "../../src/tools/version.ts";

describe("ensureVersionFile", () => {
  it("should create .ts file by default with TypeScript template", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const filePath = join(tempDir, "version.ts",);
      const created = await ensureVersionFile(filePath,);

      assertEquals(created, true,);
      const content = await Deno.readTextFile(filePath,);
      assertStringIncludes(content, "// @ts-ignore",);
      assertStringIncludes(content, "@type {string}",);
      assertStringIncludes(content, "export const APP_VERSION: string =",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should create .js file with JavaScript template", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const filePath = join(tempDir, "version.js",);
      const created = await ensureVersionFile(filePath,);

      assertEquals(created, true,);
      const content = await Deno.readTextFile(filePath,);
      // Should not have types or declare const
      assertEquals(content.includes("declare const",), false,);
      assertEquals(content.includes(": string",), false,);
      assertStringIncludes(content, "@type {string}",);
      assertStringIncludes(
        content,
        'export const APP_VERSION = typeof __APP_VERSION__ !== "undefined"',
      );
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should create version.ts when receiving a directory", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const created = await ensureVersionFile(tempDir,);

      assertEquals(created, true,);
      const filePath = join(tempDir, "version.ts",);
      const content = await Deno.readTextFile(filePath,);
      assertStringIncludes(content, "// @ts-ignore",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should respect customized defineVersionString", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const filePath = join(tempDir, "version.js",);
      await ensureVersionFile(filePath, ".", "MY_CUSTOM_VERSION",);

      const content = await Deno.readTextFile(filePath,);
      assertStringIncludes(
        content,
        'typeof MY_CUSTOM_VERSION !== "undefined"',
      );
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});
