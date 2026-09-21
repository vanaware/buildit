import { activeTab, themeMode, toggleTheme, } from "../stores/app.ts";
import { APP_VERSION, } from "@vanaware/buildit/version";

export const Header = () => {
  return (
    <header class="surface-container-low border bottom">
      <nav class="responsive">
        <div class="circle primary-container middle center-align">
          <i class="primary-text">construction</i>
        </div>
        <div class="max">
          <div class="row middle no-space">
            <h5 class="no-margin bold">BuildIt</h5>
            <span class="chip small primary-container margin-left">v{APP_VERSION}</span>
            <span class="chip small tertiary-container margin-left none s-inline-block">Deno 2.x</span>
            <span class="chip small secondary-container margin-left none m-inline-block">JSR</span>
          </div>
          <div class="small-text secondary-text">
            Orquestrador de Compilação &amp; Exportador de Contexto IA para Deno
          </div>
        </div>
        <button
          type="button"
          class="border round wave small none s-inline-flex"
          onClick={() => (activeTab.value = "cli")}
        >
          <i>menu_book</i>
          <span>Docs &amp; CLI</span>
        </button>
        <button
          type="button"
          class="circle transparent wave"
          onClick={toggleTheme}
          title={themeMode.value === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
        >
          <i>{themeMode.value === "dark" ? "light_mode" : "dark_mode"}</i>
        </button>
      </nav>
    </header>
  );
};

