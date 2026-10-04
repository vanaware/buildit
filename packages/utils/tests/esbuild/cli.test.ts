/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { parseArgs, } from "../../src/tools/cli-flags.ts";

describe("parseArgs", () => {
  it("should return empty targets and noversion false when called without arguments", () => {
    const result = parseArgs([],);
    assertEquals(result.targets, [],);
    assertEquals(result.globalNoVersion, false,);
  });

  it("should extract provided targets without noversion", () => {
    const result = parseArgs(["ui", "admin",],);
    assertEquals(result.targets, ["ui", "admin",],);
    assertEquals(result.globalNoVersion, false,);
  });

  it("should detect standalone noversion flag in positional arguments", () => {
    const result = parseArgs(["noversion",],);
    assertEquals(result.targets, [],);
    assertEquals(result.globalNoVersion, true,);
  });

  it("should combine specific targets and filter out the noversion flag", () => {
    const result = parseArgs(["ui", "noversion",],);
    assertEquals(result.targets, ["ui",],);
    assertEquals(result.globalNoVersion, true,);
  });

  it("should respect Cliffy's noversion option", () => {
    const result = parseArgs(["ui",], { noversion: true, },);
    assertEquals(result.targets, ["ui",],);
    assertEquals(result.globalNoVersion, true,);
  });
});
