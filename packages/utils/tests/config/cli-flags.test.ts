import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { parseArgs, } from "../../src/tools/cli-flags.ts";
import { GlobalTargetConfig, } from "../../src/tools/interfaces.ts";

describe("parseArgs", () => {
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

  it("deve usar alvos padrão se nenhum for especificado", () => {
    const res = parseArgs([], config,);
    assertEquals(res.targets, ["ui", "worker",],);
    assertEquals(res.globalNoVersion, false,);
  });

  it("deve identificar a flag noversion", () => {
    const res = parseArgs(["noversion",], config,);
    assertEquals(res.globalNoVersion, true,);
  });

  it("deve filtrar alvos solicitados", () => {
    const res = parseArgs(["ui", "sw",], config,);
    assertEquals(res.targets, ["ui", "sw",],);
  });

  it("deve respeitar a ordem do config independente da ordem dos args", () => {
    const res = parseArgs(["sw", "ui",], config,);
    assertEquals(res.targets, ["ui", "sw",],);
  });
});
