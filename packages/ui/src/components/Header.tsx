import { themeMode, toggleTheme, } from "../stores/app.ts";

export const Header = () => {
  return (
    <header class="surface-container padding-bottom">
      <div class="row middle">
        <div class="max">
          <h4 class="no-margin row middle">
            <i>build</i>
            <span>BuildIt</span>
            <span class="chip small tertiary-container margin-left">v0.3.1</span>
          </h4>
          <p class="small-text secondary-text no-margin">
            Build Orchestration, Bundling & Context Export Toolkit for Deno & Preact
          </p>
        </div>
        <nav class="right-align">
          <button
            type="button"
            class="circle transparent"
            onClick={toggleTheme}
            title="Alternar tema claro/escuro"
          >
            <i>{themeMode.value === "dark" ? "light_mode" : "dark_mode"}</i>
          </button>
        </nav>
      </div>
    </header>
  );
};
