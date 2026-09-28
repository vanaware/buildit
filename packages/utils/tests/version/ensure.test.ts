/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import { join, } from "@std/path";
import { ensureVersionFile, } from "../../src/tools/version.ts";

describe("ensureVersionFile", () => {
  it("deve criar arquivo .ts por padrão com template TypeScript", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const filePath = join(tempDir, "version.ts",);
      const created = await ensureVersionFile(filePath,);
      
      assertEquals(created, true,);
      const content = await Deno.readTextFile(filePath,);
      assertStringIncludes(content, "declare const __APP_VERSION__: string;",);
      assertStringIncludes(content, "@type {string}",);
      assertStringIncludes(content, "export const APP_VERSION: string =",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("deve criar arquivo .js com template JavaScript", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const filePath = join(tempDir, "version.js",);
      const created = await ensureVersionFile(filePath,);
      
      assertEquals(created, true,);
      const content = await Deno.readTextFile(filePath,);
      // Não deve ter tipos nem declare const
      assertEquals(content.includes("declare const",), false,);
      assertEquals(content.includes(": string",), false,);
      assertStringIncludes(content, "@type {string}",);
      assertStringIncludes(content, "export const APP_VERSION = typeof __APP_VERSION__ !== \"undefined\"",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("deve criar version.ts ao receber um diretório", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const created = await ensureVersionFile(tempDir,);
      
      assertEquals(created, true,);
      const filePath = join(tempDir, "version.ts",);
      const content = await Deno.readTextFile(filePath,);
      assertStringIncludes(content, "declare const __APP_VERSION__: string;",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("deve respeitar defineVersionString customizado", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const filePath = join(tempDir, "version.js",);
      await ensureVersionFile(filePath, ".", "MY_CUSTOM_VERSION",);
      
      const content = await Deno.readTextFile(filePath,);
      assertStringIncludes(content, "typeof MY_CUSTOM_VERSION !== \"undefined\"",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});
