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
    <header
      class="surface-container-low border bottom responsive max"
      style="max-width: 100vw; width: 100%; box-sizing: border-box; overflow-x: hidden;">
      <nav
        class="responsive wrap"
        style="max-width: 100%; width: 100%; min-width: 0; box-sizing: border-box;">
        <div class="circle primary-container center-align">
          <i class="primary-text">
            build
          </i>
        </div>
        <div class="max wrap" style="min-width: 0; min-inline-size: 0;">
          <div class="row wrap" style="align-items: center; gap: 0.5rem;">
            <h5 class="no-margin bold">
              BuildIt
            </h5>
            <span
              class="chip small primary-container no-margin"
              style="max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
              title={`v${APP_VERSION}`}>
              v{APP_VERSION}
            </span>
            <span class="chip small tertiary-container m l no-margin">
              Deno 2.x
            </span>
            <span class="chip small secondary-container l no-margin">
              JSR
            </span>
          </div>
          <div
            class="small-text secondary-text wrap"
            style="overflow-wrap: anywhere; word-break: normal;">
            Orquestrador de Compilação &amp; Exportador de Contexto IA
          </div>
        </div>

        <button
          type="button"
          class="circle transparent wave no-margin"
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
      <nav
        class="tabs left-align responsive scroll"
        style="max-width: 100%; width: 100%; min-width: 0; box-sizing: border-box;">
        {tabs.map((tab,) => (
          <a
            key={tab.key}
            class={activeTab.value === tab.key ? "active" : ""}
            onClick={() => activeTab.value = tab.key}
            style="cursor: pointer; white-space: nowrap; flex-shrink: 0;">
            <i>
              {tab.icon}
            </i>
            <span>
              {tab.label}
            </span>
          </a>
        ))}
      </nav>
    </header>
  );
};
