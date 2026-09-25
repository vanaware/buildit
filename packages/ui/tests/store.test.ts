/**
 * @file store.test.ts
 * @description Testes unitários para os signals e ações do store da UI.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import {
  activeTab,
  addLog,
  applyPreset,
  cleanDistEnabled,
  clearLogs,
  minifyEnabled,
  selectedTool,
  simLogs,
  sourcemapEnabled,
  themeMode,
  toggleTheme,
  totalLogsCount,
} from "../src/stores/app.ts";

describe("UI Store - Signals & Actions", () => {
  it("deve alternar abas ativas reativamente", () => {
    activeTab.value = "overview";
    assertEquals(activeTab.value, "overview",);

    activeTab.value = "cli";
    assertEquals(activeTab.value, "cli",);

    activeTab.value = "snapshots";
    assertEquals(activeTab.value, "snapshots",);
  });

  it("deve alternar modo de tema claro/escuro", () => {
    themeMode.value = "dark";
    toggleTheme();
    assertEquals(themeMode.value, "light",);
    toggleTheme();
    assertEquals(themeMode.value, "dark",);
  });

  it("deve aplicar predefinições de build corretamente", () => {
    applyPreset("prod",);
    assertEquals(selectedTool.value, "esbuild",);
    assertEquals(minifyEnabled.value, true,);
    assertEquals(sourcemapEnabled.value, true,);
    assertEquals(cleanDistEnabled.value, true,);

    applyPreset("dev",);
    assertEquals(selectedTool.value, "esbuild",);
    assertEquals(minifyEnabled.value, false,);
    assertEquals(sourcemapEnabled.value, true,);
    assertEquals(cleanDistEnabled.value, false,);

    applyPreset("export",);
    assertEquals(selectedTool.value, "export",);
    assertEquals(minifyEnabled.value, false,);
    assertEquals(sourcemapEnabled.value, false,);
    assertEquals(cleanDistEnabled.value, false,);
  });

  it("deve adicionar e limpar logs no console de simulação", () => {
    clearLogs();
    assertEquals(simLogs.value.length, 0,);
    assertEquals(totalLogsCount.value, 0,);

    addLog("Evento de teste",);
    assertEquals(totalLogsCount.value, 1,);
    assertEquals(simLogs.value[0]?.includes("Evento de teste",), true,);

    clearLogs();
    assertEquals(totalLogsCount.value, 0,);
  });
});
