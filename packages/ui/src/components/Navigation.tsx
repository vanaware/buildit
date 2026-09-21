import { activeTab, type TabKey, } from "../stores/app.ts";

export const Navigation = () => {
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview", label: "Visão Geral", icon: "dashboard", },
    { key: "cli", label: "Ferramentas & CLI", icon: "terminal", },
    { key: "interactive", label: "Simulador Interativo", icon: "play_circle", },
    { key: "snapshots", label: "Exportador de Contexto", icon: "share", },
  ];

  return (
    <nav class="tabs center-align border bottom margin-bottom scroll">
      {tabs.map((tab,) => (
        <a
          key={tab.key}
          class={activeTab.value === tab.key ? "active" : ""}
          onClick={() => (activeTab.value = tab.key)}
        >
          <i>{tab.icon}</i>
          <span>{tab.label}</span>
        </a>
      ))}
    </nav>
  );
};

