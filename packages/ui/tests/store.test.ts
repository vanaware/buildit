/**
 * @file store.test.ts
 * @description Unit tests for UI store signals and actions.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import {
  activeTab,
  CLI_COMMANDS,
  copiedId,
  copyToClipboard,
  filteredCliCommands,
  searchQuery,
  selectedConfig,
  selectedTool,
  themeMode,
  toggleTheme,
  TOOLS,
} from "../src/stores/app.ts";

describe("UI Store - Signals & Actions", () => {
  it("should switch active tabs reactively", () => {
    activeTab.value = "overview";
    assertEquals(activeTab.value, "overview",);

    activeTab.value = "tools";
    assertEquals(activeTab.value, "tools",);

    activeTab.value = "cli";
    assertEquals(activeTab.value, "cli",);

    activeTab.value = "configs";
    assertEquals(activeTab.value, "configs",);

    activeTab.value = "api";
    assertEquals(activeTab.value, "api",);
  });

  it("should switch selected tools reactively", () => {
    selectedTool.value = "esbuild";
    assertEquals(selectedTool.value, "esbuild",);

    selectedTool.value = "watch";
    assertEquals(selectedTool.value, "watch",);

    selectedTool.value = "export";
    assertEquals(selectedTool.value, "export",);

    selectedTool.value = "denobuild";
    assertEquals(selectedTool.value, "denobuild",);

    selectedTool.value = "versioning";
    assertEquals(selectedTool.value, "versioning",);
  });

  it("should toggle light/dark theme mode", () => {
    themeMode.value = "dark";
    toggleTheme();
    assertEquals(themeMode.value, "light",);
    toggleTheme();
    assertEquals(themeMode.value, "dark",);
  });

  it("should filter CLI commands based on computed searchQuery", () => {
    searchQuery.value = "";
    assertEquals(filteredCliCommands.value.length, CLI_COMMANDS.length,);

    searchQuery.value = "watch";
    const watchCmds = filteredCliCommands.value;
    assertEquals(watchCmds.length > 0, true,);
    assertEquals(
      watchCmds.every((c,) =>
        c.title.toLowerCase().includes("watch",) ||
        c.command.toLowerCase().includes("watch",) ||
        c.description.toLowerCase().includes("watch",) ||
        c.tag.toLowerCase().includes("watch",)
      ),
      true,
    );

    searchQuery.value = "completely_nonexistent_search_term_12345";
    assertEquals(filteredCliCommands.value.length, 0,);

    searchQuery.value = "";
  });

  it("should switch selected configuration files", () => {
    selectedConfig.value = "esbuild.jsonc";
    assertEquals(selectedConfig.value, "esbuild.jsonc",);

    selectedConfig.value = "export.jsonc";
    assertEquals(selectedConfig.value, "export.jsonc",);
  });

  it("should update copiedId via copyToClipboard", async () => {
    copiedId.value = null;
    await copyToClipboard(
      "deno run -A jsr:@vanaware/buildit/cli/esbuild",
      "test-cmd",
    );
    assertEquals(copiedId.value, "test-cmd",);
  });

  it("should contain consistent tool metadata", () => {
    assertEquals(TOOLS.length, 5,);
    const ids = TOOLS.map((t,) => t.id);
    assertEquals(ids.includes("esbuild",), true,);
    assertEquals(ids.includes("denobuild",), true,);
    assertEquals(ids.includes("watch",), true,);
    assertEquals(ids.includes("export",), true,);
    assertEquals(ids.includes("versioning",), true,);
  });
});
