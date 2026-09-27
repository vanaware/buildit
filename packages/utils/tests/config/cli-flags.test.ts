import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { parseArgs, } from "../../src/tools/cli-flags.ts";
import { resolverOrdemTargets, } from "../../src/tools/targets.ts";
import type { GlobalTargetConfig, } from "../../src/tools/interfaces.ts";

describe("parseArgs e resolverOrdemTargets", () => {
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

  it("parseArgs deve extrair rawTargets e detectar noversion", () => {
    const res = parseArgs(["noversion", "ui",],);
    assertEquals(res.targets, ["ui",],);
    assertEquals(res.globalNoVersion, true,);
  });

  it("resolverOrdemTargets deve usar alvos padrão se nenhum for especificado", () => {
    const { targets, } = parseArgs([],);
    const resolved = resolverOrdemTargets(config, targets,);
    assertEquals(resolved, ["ui", "worker",],);
  });

  it("resolverOrdemTargets deve respeitar a ordem do config independente da ordem dos args", () => {
    const { targets, } = parseArgs(["sw", "ui",],);
    const resolved = resolverOrdemTargets(config, targets,);
    assertEquals(resolved, ["ui", "sw",],);
  });
});
