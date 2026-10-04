import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { parseArgs, } from "../../src/tools/cli-flags.ts";
import { resolveTargetOrder, } from "../../src/tools/targets.ts";
import type { GlobalTargetConfig, } from "../../src/tools/interfaces.ts";

describe("parseArgs and resolveTargetOrder", () => {
  const config: GlobalTargetConfig = {
    ui: {
      entryPoints: ["main.tsx",],
      srcdir: "src",
      distdir: "dist",
      default: true,
    },
    sw: {
      entryPoints: ["sw.ts",],
      srcdir: "src",
      distdir: "dist",
      default: false,
    },
    worker: {
      entryPoints: ["worker.ts",],
      srcdir: "src",
      distdir: "dist",
      default: true,
    },
  };

  it("parseArgs should extract rawTargets and detect noversion", () => {
    const res = parseArgs(["noversion", "ui",],);
    assertEquals(res.targets, ["ui",],);
    assertEquals(res.globalNoVersion, true,);
  });

  it("resolveTargetOrder should use default targets if none are specified", () => {
    const { targets, } = parseArgs([],);
    const resolved = resolveTargetOrder(config, targets,);
    assertEquals(resolved, ["ui", "worker",],);
  });

  it("resolveTargetOrder should respect config order regardless of args order", () => {
    const { targets, } = parseArgs(["sw", "ui",],);
    const resolved = resolveTargetOrder(config, targets,);
    assertEquals(resolved, ["ui", "sw",],);
  });
});
