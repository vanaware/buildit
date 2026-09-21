import { themeMode, toggleTheme, } from "../stores/app.ts";

export const Header = () => {
  return (
    <header class="surface-container-low border bottom">
      <nav class="responsive">
        <button type="button" class="circle transparent">
          <i class="primary-text">build</i>
        </button>
        <div class="max">
          <div class="row middle no-space">
            <h5 class="no-margin">BuildIt</h5>
            <span class="chip small tertiary-container margin-left">v0.3.1</span>
          </div>
          <div class="small-text secondary-text">
            Build Orchestration, Bundling & Context Export Toolkit
          </div>
        </div>
        <button
          type="button"
          class="circle transparent"
          onClick={toggleTheme}
          title="Alternar tema claro/escuro"
        >
          <i>{themeMode.value === "dark" ? "light_mode" : "dark_mode"}</i>
        </button>
      </nav>
    </header>
  );
};

