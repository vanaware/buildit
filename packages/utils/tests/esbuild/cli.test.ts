/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { parseArgs, } from "../../src/tools/cli-flags.ts";

describe("parseArgs", () => {
  it("deve retornar alvos vazios e noversion false quando sem argumentos", () => {
    const result = parseArgs([],);
    assertEquals(result.targets, [],);
    assertEquals(result.globalNoVersion, false,);
  });

  it("deve extrair alvos informados sem noversion", () => {
    const result = parseArgs(["ui", "admin",],);
    assertEquals(result.targets, ["ui", "admin",],);
    assertEquals(result.globalNoVersion, false,);
  });

  it("deve detectar flag noversion isolada nos argumentos posicionais", () => {
    const result = parseArgs(["noversion",],);
    assertEquals(result.targets, [],);
    assertEquals(result.globalNoVersion, true,);
  });

  it("deve combinar alvos específicos e filtrar a flag noversion", () => {
    const result = parseArgs(["ui", "noversion",],);
    assertEquals(result.targets, ["ui",],);
    assertEquals(result.globalNoVersion, true,);
  });

  it("deve respeitar a opção noversion do Cliffy", () => {
    const result = parseArgs(["ui",], { noversion: true, },);
    assertEquals(result.targets, ["ui",],);
    assertEquals(result.globalNoVersion, true,);
  });
});
