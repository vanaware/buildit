import { assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { resolveTargetOrder, } from "../../src/tools/targets.ts";

describe("resolveTargetOrder", () => {
  const config = {
    first: { default: true, },
    second: { default: true, },
    third: { default: false, },
    fourth: { default: true, },
  };

  it("should return all targets with default !== false in the exact order of the configuration", () => {
    const ordered = resolveTargetOrder(config,);
    assertEquals(ordered, ["first", "second", "fourth",],);
  });

  it("should preserve the configuration order even if targets are passed out of order", () => {
    const ordered = resolveTargetOrder(config, [
      "fourth",
      "first",
      "third",
    ],);
    assertEquals(ordered, ["first", "third", "fourth",],);
  });

  it("should support requested targets in uppercase or lowercase", () => {
    const ordered = resolveTargetOrder(config, ["FOURTH", "First",],);
    assertEquals(ordered, ["first", "fourth",],);
  });

  it("should ignore requested non-existent targets keeping valid ones sorted", () => {
    const ordered = resolveTargetOrder(config, [
      "nonexistent",
      "second",
      "first",
    ],);
    assertEquals(ordered, ["first", "second",],);
  });
});
