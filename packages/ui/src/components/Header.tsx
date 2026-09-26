import { activeTab, TabKey, themeMode, toggleTheme, } from "../stores/app.ts";
import { APP_VERSION, } from "../version.ts";

export const Header = () => {
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview", label: "Visão Geral", icon: "dashboard", },
    { key: "tools", label: "Ferramentas", icon: "construction", },
    { key: "cli", label: "CLI & Scripts", icon: "terminal", },
    { key: "configs", label: "Configurações", icon: "tune", },
    { key: "api", label: "API Deno", icon: "code", },
  ];

  return (
    <header class="surface-container-low border bottom small-padding">
      <nav class="responsive">
        <div class="circle primary-container middle center-align">
          <i class="primary-text">
            build
          </i>
        </div>
        <div class="max">
          <div class="row middle wrap">
            <h5 class="no-margin bold">
              BuildIt
            </h5>
            <span class="chip small primary-container">
              v{APP_VERSION}
            </span>
            <span class="chip small tertiary-container m l">
              Deno 2.x
            </span>
            <span class="chip small secondary-container l">
              JSR
            </span>
          </div>
          <div class="small-text secondary-text">
            Orquestrador de Compilação &amp; Exportador de Contexto IA
          </div>
        </div>

        <button
          type="button"
          class="circle transparent wave"
          onClick={toggleTheme}
          title={themeMode.value === "dark"
            ? "Mudar para tema claro"
            : "Mudar para tema escuro"}>
          <i>
            {themeMode.value === "dark" ? "light_mode" : "dark_mode"}
          </i>
        </button>
      </nav>

      {/* Abas de navegação responsivas */}
      <nav class="tabs scroll">
        {tabs.map((tab) => (
          <a
            key={tab.key}
            class={activeTab.value === tab.key ? "active" : ""}
            onClick={() => activeTab.value = tab.key}
            style="cursor: pointer;">
            <i>{tab.icon}</i>
            <span>{tab.label}</span>
          </a>
        ))}
      </nav>
    </header>
  );
};
