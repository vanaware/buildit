import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { parseArgs, } from "../../src/tools/cli-flags.ts";
import { resolverOrdemTargets, } from "../../src/tools/targets.ts";

describe("esbuild API & CLI flags integration", () => {
  it("deve integrar flags CLI com parseArgs e resolverOrdemTargets", () => {
    const config = {
      ui: {
        entryPoints: ["main.tsx",],
        srcdir: "src",
        distdir: "dist",
      },
    };

    const rawArgs = ["ui", "noversion",];
    const parsed = parseArgs(rawArgs,);
    const resolvedTargets = resolverOrdemTargets(config, parsed.targets,);

    assertEquals(resolvedTargets, ["ui",],);
    assertEquals(parsed.globalNoVersion, true,);
  });
});
