/// <reference lib="deno.ns" />

import { assertRejects, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, } from "@std/assert";
import { loadWatchConfig, } from "../../src/watch/config.ts";

describe("watch/config", () => {
  it("throws error if config file does not exist", async () => {
    await assertRejects(
      () => loadWatchConfig("non-existent.jsonc",),
      Error,
      'Configuration file "watch.jsonc" not found',
    );
  });

  it("loads configurations from the real project watch.jsonc", async () => {
    const config = await loadWatchConfig("watch.jsonc", ".",);
    const ui = config.targets["ui"];
    assert(ui !== undefined,);
    assertEquals(ui.format, "esm",);
    assertEquals(ui.entryPoints, ["main.tsx",],);
  });
});
