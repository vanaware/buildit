import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { parseArgs, } from "../../src/tools/cli-flags.ts";
import { resolveTargetOrder, } from "../../src/tools/targets.ts";

describe("esbuild API & CLI flags integration", () => {
  it("should integrate CLI flags with parseArgs and resolveTargetOrder", () => {
    const config = {
      ui: {
        entryPoints: ["main.tsx",],
        srcdir: "src",
        distdir: "dist",
      },
    };

    const rawArgs = ["ui", "noversion",];
    const parsed = parseArgs(rawArgs,);
    const resolvedTargets = resolveTargetOrder(config, parsed.targets,);

    assertEquals(resolvedTargets, ["ui",],);
    assertEquals(parsed.globalNoVersion, true,);
  });
});
