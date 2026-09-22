import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { join } from "@std/path";
import { parseArgs, parseCommonCliFlags } from "../../src/tools/cli-flags.ts";

describe("esbuild API & CLI flags integration", () => {
  it("deve integrar flags CLI com parseArgs", () => {
    const flags = parseCommonCliFlags(["ui", "--noversion", "-c", "custom.jsonc"]);
    assertEquals(flags.noversion, true);
    assertEquals(flags.configPath, "custom.jsonc");
    assertEquals(flags.positional, ["ui"]);

    const config = {
      ui: {
        mode: "build" as const,
        entryPoints: ["main.tsx"],
        srcdir: "src",
        distdir: "dist",
      },
    };

    const rawArgs = [
      ...flags.positional,
      ...(flags.noversion ? ["noversion"] : []),
    ];
    const parsed = parseArgs(rawArgs, config);

    assertEquals(parsed.targets, ["ui"]);
    assertEquals(parsed.globalNoVersion, true);
  });
});
