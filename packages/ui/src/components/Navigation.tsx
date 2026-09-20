import { activeTab, type TabKey, } from "../stores/app.ts";

export const Navigation = () => {
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview", label: "Visão Geral", icon: "dashboard", },
    { key: "cli", label: "Ferramentas & CLI", icon: "terminal", },
    { key: "interactive", label: "Simulador Interativo", icon: "play_circle", },
    { key: "snapshots", label: "Exportador de Contexto", icon: "share", },
  ];

  return (
    <nav class="wrap margin-bottom">
      {tabs.map((tab,) => (
        <button
          key={tab.key}
          type="button"
          class={`chip ${activeTab.value === tab.key ? "primary" : "transparent"}`}
          onClick={() => (activeTab.value = tab.key)}
        >
          <i>{tab.icon}</i>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};
