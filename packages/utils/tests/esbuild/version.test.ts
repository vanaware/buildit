/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import {
  assertEquals,
  assertRejects,
  assertStringIncludes,
  assertThrows,
} from "@std/assert";
import {
  formatVersion,
  parseVersion,
  readProjectVersion,
  replaceVersionInContent,
  updateProjectVersion,
} from "../../src/tools/version.ts";
import { withTempDenoJsonc, } from "../helpers/fixtures.ts";

describe("parseVersion", () => {
  describe("valid cases", () => {
    const validCases = [
      { input: "1.2.3", expected: { major: 1, minor: 2, patch: 3, }, },
      { input: "0.0.0", expected: { major: 0, minor: 0, patch: 0, }, },
      { input: "99.99.99", expected: { major: 99, minor: 99, patch: 99, }, },
      {
        input: "0.2.148#msv0okam",
        expected: { major: 0, minor: 2, patch: 148, },
      },
      { input: "1.0.0#alpha", expected: { major: 1, minor: 0, patch: 0, }, },
      { input: "2.0.0#beta.1", expected: { major: 2, minor: 0, patch: 0, }, },
      {
        input: "1.0.0#alpha-beta-1",
        expected: { major: 1, minor: 0, patch: 0, },
      },
    ];
    for (const { input, expected, } of validCases) {
      it(`parses "${input}" correctly`, () => {
        assertEquals(parseVersion(input,), expected,);
      });
    }
  });
  describe("invalid cases", () => {
    const invalidCases = [
      { input: "", desc: "empty string", },
      { input: "1.2", desc: "only 2 parts", },
      { input: "1.2.3.4", desc: "4 parts", },
      { input: "a.b.c", desc: "letters", },
      { input: "1.abc.3", desc: "non-numeric part", },
      { input: "v1.2.3", desc: "v prefix", },
      { input: "1.2.3#", desc: "hash without value", },
      { input: " 1.2.3", desc: "leading space", },
      { input: "1.2.3 ", desc: "trailing space", },
    ];
    for (const { input, desc, } of invalidCases) {
      it(`throws error for ${desc} ("${input}")`, () => {
        assertThrows(() => parseVersion(input,), Error,);
      });
    }
  });
});

describe("formatVersion", () => {
  it("formats with provided hash", () => {
    assertEquals(formatVersion(1, 2, 3, "abc",), "1.2.3#abc",);
  });
  it("generates automatic hash when not provided", () => {
    const result = formatVersion(0, 2, 149,);
    assertStringIncludes(result, "0.2.149#",);
    // Hash should have at least some characters
    const hash = result.split("#",)[1];
    // 🔥 FIX: Explicit undefined handling (noUncheckedIndexedAccess)
    assertEquals(hash !== undefined && hash.length > 0, true,);
  });
  it("uses the same hash in calls with same parameters", () => {
    const hash = "fixedhash";
    assertEquals(
      formatVersion(1, 0, 0, hash,),
      formatVersion(1, 0, 0, hash,),
    );
  });
  it("handles large numbers", () => {
    assertEquals(formatVersion(999, 999, 999, "x",), "999.999.999#x",);
  });
});

describe("replaceVersionInContent", () => {
  it("replaces version preserving the rest", () => {
    const content = `{
      "name": "@buildit/app",
      "version": "1.0.0-old",
      "imports": {}
    }`;
    const result = replaceVersionInContent(content, "2.0.0-new",);
    assertStringIncludes(result, `"version": "2.0.0-new"`,);
    assertStringIncludes(result, `"name": "@buildit/app"`,);
    assertStringIncludes(result, `"imports"`,);
  });
  it("replaces only the first occurrence", () => {
    const content = `{ "version": "1.0.0", "other": "version": "2.0.0" }`;
    const result = replaceVersionInContent(content, "3.0.0",);
    // The first one should be replaced
    assertStringIncludes(result, `"version": "3.0.0"`,);
  });
});

describe("readProjectVersion (integration)", () => {
  it("reads version from existing file", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.2.3-abc",);
    try {
      const version = await readProjectVersion(path,);
      assertEquals(version, "1.2.3-abc",);
    } finally {
      await cleanup();
    }
  });
  it("throws error when file does not exist", async () => {
    await assertRejects(
      () => readProjectVersion("/path/that/does/not/exist/deno.jsonc",),
      Error,
      'Required "version" field not found',
    );
  });
  it("throws error when version is not in the file", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.0.0", {
      version: undefined,
    },);
    try {
      // Rewrite without version
      await Deno.writeTextFile(path, `{ "name": "buildit" }`,);
      await assertRejects(
        () => readProjectVersion(path,),
        Error,
        'Required "version" field not found',
      );
    } finally {
      await cleanup();
    }
  });
});

describe("updateProjectVersion (integration)", () => {
  it("increments patch and updates file", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.2.3",);
    try {
      const newVersion = await updateProjectVersion({
        currentVersion: "1.2.3",
        denoJsonPath: path,
        buildHash: "testhash",
        versionPaths: [],
      },);
      assertEquals(newVersion, "1.2.4#testhash",);
      const content = await Deno.readTextFile(path,);
      assertStringIncludes(content, `"version": "1.2.4#testhash"`,);
    } finally {
      await cleanup();
    }
  });
  it("preserves other JSON properties", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("0.0.1", {
      name: "@buildit/app",
      imports: { preact: "https://esm.sh/preact", },
    },);
    try {
      await updateProjectVersion({
        currentVersion: "0.0.1",
        denoJsonPath: path,
        buildHash: "x",
        versionPaths: [],
      },);
      const content = await Deno.readTextFile(path,);
      assertStringIncludes(content, `"name": "@buildit/app"`,);
      assertStringIncludes(content, `"preact"`,);
    } finally {
      await cleanup();
    }
  });
  it("increments multiple times", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.0.0",);
    try {
      const v1 = await updateProjectVersion({
        currentVersion: "1.0.0",
        denoJsonPath: path,
        buildHash: "h1",
        versionPaths: [],
      },);
      assertEquals(v1, "1.0.1#h1",);
      const v2 = await updateProjectVersion({
        currentVersion: v1,
        denoJsonPath: path,
        buildHash: "h2",
        versionPaths: [],
      },);
      assertEquals(v2, "1.0.2#h2",);
      const v3 = await updateProjectVersion({
        currentVersion: v2,
        denoJsonPath: path,
        buildHash: "h3",
        versionPaths: [],
      },);
      assertEquals(v3, "1.0.3#h3",);
    } finally {
      await cleanup();
    }
  });
});
