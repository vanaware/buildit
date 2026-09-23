import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { parseArgs } from "../../src/tools/cli-flags.ts";
import { GlobalTargetConfig } from "../../src/tools/interfaces.ts";

describe("parseArgs", () => {
  const config: GlobalTargetConfig = {
    ui: {
      mode: "build",
      entryPoints: ["main.tsx"],
      srcdir: "src",
      distdir: "dist",
      default: true,
    },
    sw: {
      mode: "build",
      entryPoints: ["sw.ts"],
      srcdir: "src",
      distdir: "dist",
      default: false,
    },
    watch: {
      mode: "watch",
      entryPoints: ["main.tsx"],
      srcdir: "src",
      distdir: "dist",
    }
  };

  it("deve usar alvos padrão se nenhum for especificado", () => {
    const res = parseArgs([], config);
    assertEquals(res.targets, ["ui"]);
    assertEquals(res.globalNoVersion, false);
  });

  it("deve identificar a flag noversion", () => {
    const res = parseArgs(["noversion"], config);
    assertEquals(res.globalNoVersion, true);
  });

  it("deve filtrar alvos solicitados", () => {
    const res = parseArgs(["ui", "sw"], config);
    assertEquals(res.targets, ["ui", "sw"]);
  });

  it("deve identificar modo watch", () => {
    const res = parseArgs(["watch"], config);
    assertEquals(res.watchTarget, "watch");
    assertEquals(res.targets, []);
  });

  it("deve respeitar a ordem do config independente da ordem dos args", () => {
    const res = parseArgs(["sw", "ui"], config);
    assertEquals(res.targets, ["ui", "sw"]);
  });
});
