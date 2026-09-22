import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { parseCommonCliFlags } from "../../src/tools/cli-flags.ts";

describe("parseCommonCliFlags", () => {
  it("deve identificar a flag de ajuda (--help e -h)", () => {
    assertEquals(parseCommonCliFlags(["--help"]).showHelp, true);
    assertEquals(parseCommonCliFlags(["-h"]).showHelp, true);
    assertEquals(parseCommonCliFlags(["ui", "--help"]).showHelp, true);
  });

  it("deve identificar a flag de versão (--version, -V, -v)", () => {
    assertEquals(parseCommonCliFlags(["--version"]).showVersion, true);
    assertEquals(parseCommonCliFlags(["-V"]).showVersion, true);
    assertEquals(parseCommonCliFlags(["-v"]).showVersion, true);
  });

  it("deve identificar o caminho de configuração (-c e --config)", () => {
    const r1 = parseCommonCliFlags(["-c", "custom.jsonc", "ui"]);
    assertEquals(r1.configPath, "custom.jsonc");
    assertEquals(r1.positional, ["ui"]);

    const r2 = parseCommonCliFlags(["--config=custom2.jsonc"]);
    assertEquals(r2.configPath, "custom2.jsonc");

    const r3 = parseCommonCliFlags(["--config", "custom3.jsonc"]);
    assertEquals(r3.configPath, "custom3.jsonc");
  });

  it("deve identificar a opção noversion (--noversion, -n, noversion)", () => {
    assertEquals(parseCommonCliFlags(["--noversion"]).noversion, true);
    assertEquals(parseCommonCliFlags(["-n"]).noversion, true);
    assertEquals(parseCommonCliFlags(["noversion"]).noversion, true);
    assertEquals(parseCommonCliFlags(["NOVERSION"]).noversion, true);
  });

  it("deve identificar a opção forcepackagesversion (--forcepackagesversion, -f)", () => {
    assertEquals(parseCommonCliFlags(["--forcepackagesversion"]).forcepackagesversion, true);
    assertEquals(parseCommonCliFlags(["-f"]).forcepackagesversion, true);
    assertEquals(parseCommonCliFlags(["forcepackagesversion"]).forcepackagesversion, true);
  });

  it("deve coletar caminhos customizados de version-path", () => {
    const res = parseCommonCliFlags(["--version-path", "dist/version.ts", "--versionpath=pkg/version.ts"]);
    assertEquals(res.versionPaths, ["dist/version.ts", "pkg/version.ts"]);
  });

  it("deve separar argumentos posicionais de alvos ou modos", () => {
    const res = parseCommonCliFlags(["ui", "server", "-n", "-c", "esbuild.jsonc"]);
    assertEquals(res.positional, ["ui", "server"]);
    assertEquals(res.noversion, true);
    assertEquals(res.configPath, "esbuild.jsonc");
  });
});
