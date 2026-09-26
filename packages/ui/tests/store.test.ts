/**
 * @file store.test.ts
 * @description Testes unitários para os signals e ações do store da UI.
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
  it("deve alternar abas ativas reativamente", () => {
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

  it("deve alternar ferramentas selecionadas reativamente", () => {
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

  it("deve alternar modo de tema claro/escuro", () => {
    themeMode.value = "dark";
    toggleTheme();
    assertEquals(themeMode.value, "light",);
    toggleTheme();
    assertEquals(themeMode.value, "dark",);
  });

  it("deve filtrar comandos CLI com base no searchQuery computado", () => {
    searchQuery.value = "";
    assertEquals(filteredCliCommands.value.length, CLI_COMMANDS.length,);

    searchQuery.value = "watch";
    const watchCmds = filteredCliCommands.value;
    assertEquals(watchCmds.length > 0, true,);
    assertEquals(watchCmds.every((c) =>
      c.title.toLowerCase().includes("watch",) ||
      c.command.toLowerCase().includes("watch",) ||
      c.description.toLowerCase().includes("watch",) ||
      c.tag.toLowerCase().includes("watch",)
    ), true,);

    searchQuery.value = "termo_completamente_inexistente_12345";
    assertEquals(filteredCliCommands.value.length, 0,);

    searchQuery.value = "";
  });

  it("deve alternar arquivos de configuração selecionados", () => {
    selectedConfig.value = "esbuild.jsonc";
    assertEquals(selectedConfig.value, "esbuild.jsonc",);

    selectedConfig.value = "export.jsonc";
    assertEquals(selectedConfig.value, "export.jsonc",);
  });

  it("deve atualizar copiedId via copyToClipboard", async () => {
    copiedId.value = null;
    await copyToClipboard("deno run -A jsr:@vanaware/buildit/cli/esbuild", "test-cmd",);
    assertEquals(copiedId.value, "test-cmd",);
  });

  it("deve conter metadados consistentes de ferramentas", () => {
    assertEquals(TOOLS.length, 5,);
    const ids = TOOLS.map((t) => t.id,);
    assertEquals(ids.includes("esbuild",), true,);
    assertEquals(ids.includes("denobuild",), true,);
    assertEquals(ids.includes("watch",), true,);
    assertEquals(ids.includes("export",), true,);
    assertEquals(ids.includes("versioning",), true,);
  });
});
