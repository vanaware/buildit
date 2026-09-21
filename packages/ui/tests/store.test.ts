/**
 * @file store.test.ts
 * @description Testes unitários para os signals e ações do store da UI.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import {
  activeTab,
  addLog,
  clearLogs,
  simLogs,
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
