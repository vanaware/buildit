/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { resolveTargetOrder, } from "../../src/tools/targets.ts";

describe("resolveTargetOrder", () => {
  const config = {
    server: { default: true, },
    ui: { default: true, },
    sw: { default: true, },
    admin: { default: false, },
    docs: { default: false, },
  };

  it("returns default targets in exact definition order when none are requested", () => {
    const targets = resolveTargetOrder(config,);
    assertEquals(targets, ["server", "ui", "sw",],);
  });

  it("ensures config order even if caller passes inverted or disordered targets", () => {
    // Passed ["docs", "ui", "server"] -> should resolve to ["server", "ui", "docs"]
    const targets = resolveTargetOrder(config, ["docs", "ui", "server",],);
    assertEquals(targets, ["server", "ui", "docs",],);
  });

  it("handles case-insensitivity preserving original config keys", () => {
    const targets = resolveTargetOrder(config, ["SW", "SERVER",],);
    assertEquals(targets, ["server", "sw",],);
  });

  it("allows including targets with default: false when explicitly requested", () => {
    const targets = resolveTargetOrder(config, ["admin",],);
    assertEquals(targets, ["admin",],);
  });

  it("returns empty if requested targets do not exist in config", () => {
    const targets = resolveTargetOrder(config, ["nonexistent", "ghost",],);
    assertEquals(targets, [],);
  });

  it("returns empty array when config is empty", () => {
    const targets = resolveTargetOrder({}, ["ui",],);
    assertEquals(targets, [],);
  });
});
