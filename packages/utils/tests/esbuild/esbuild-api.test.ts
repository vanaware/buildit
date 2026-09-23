import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { parseArgs } from "../../src/tools/cli-flags.ts";

describe("esbuild API & CLI flags integration", () => {
  it("deve integrar flags CLI com parseArgs", () => {
    const config = {
      ui: {
        mode: "build" as const,
        entryPoints: ["main.tsx"],
        srcdir: "src",
        distdir: "dist",
      },
    };

    const rawArgs = ["ui", "noversion"];
    const parsed = parseArgs(rawArgs, config);

    assertEquals(parsed.targets, ["ui"]);
    assertEquals(parsed.globalNoVersion, true);
  });
});
