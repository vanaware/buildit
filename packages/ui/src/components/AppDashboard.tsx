import { version as APP_VERSION, } from "@vanaware/buildit";
import {
  applyPreset,
  cleanDistEnabled,
  isSimulating,
  minifyEnabled,
  runSimulator,
  selectedTool,
  simLogs,
  sourcemapEnabled,
  targetName,
} from "../stores/app.ts";

export const AppDashboard = () => {
  return (
    <div class="grid padding">
      {/* Coluna de Controle */}
      <div class="s12 m4 l3">
        <article class="border no-padding">
          <div class="padding primary-container">
            <h6 class="no-margin">
              Build Config
            </h6>
            <div class="small-text">
              Orquestrador @vanaware/buildit
            </div>
          </div>
          <div class="padding">
            <p class="bold">
              Alvo do Build
            </p>
            <div class="field border label max">
              <select
                value={targetName.value}
                onInput={(e,) =>
                  targetName.value = (e.target as HTMLSelectElement).value}>
                <option value="ui">
                  Frontend (packages/ui)
                </option>
                <option value="server">
                  Servidor (packages/server)
                </option>
                <option value="utils">
                  Utilitários (packages/utils)
                </option>
              </select>
              <label>
                Target
              </label>
            </div>

            <p class="bold space">
              Predefinições Rápidas
            </p>
            <div class="row wrap gap">
              <button class="chip primary" onClick={() => applyPreset("prod",)}>
                <i>
                  rocket_launch
                </i>
                <span>
                  Produção
                </span>
              </button>
              <button
                class="chip secondary"
                onClick={() => applyPreset("dev",)}>
                <i>
                  handyman
                </i>
                <span>
                  Dev Rápido
                </span>
              </button>
              <button
                class="chip tertiary"
                onClick={() => applyPreset("export",)}>
                <i>
                  description
                </i>
                <span>
                  Snapshot IA
                </span>
              </button>
            </div>

            <div class="divider margin">
            </div>

            <div class="row middle space">
              <div class="max">
                <div class="bold">
                  Minificar
                </div>
                <div class="small-text">
                  Otimizar bundle final
                </div>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  checked={minifyEnabled.value}
                  onInput={(e,) =>
                    minifyEnabled.value =
                      (e.target as HTMLInputElement).checked} />
                <span>
                </span>
              </label>
            </div>

            <div class="row middle space margin">
              <div class="max">
                <div class="bold">
                  Source Maps
                </div>
                <div class="small-text">
                  Habilitar depuração
                </div>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  checked={sourcemapEnabled.value}
                  onInput={(e,) =>
                    sourcemapEnabled.value =
                      (e.target as HTMLInputElement).checked} />
                <span>
                </span>
              </label>
            </div>

            <div class="space">
            </div>
            <button
              class="extend extra primary large"
              onClick={runSimulator}
              disabled={isSimulating.value}>
              {isSimulating.value ?
                (
                  <progress class="circle small white-text">
                  </progress>
                ) :
                (
                  <i>
                    play_arrow
                  </i>
                )}
              <span>
                Executar Build
              </span>
            </button>
          </div>
        </article>
      </div>

      {/* Coluna do Console / Demo */}
      <div class="s12 m8 l9">
        <article class="border no-padding fill height-max">
          <div class="padding surface-container-highest row middle">
            <i class="primary-text">
              terminal
            </i>
            <h6 class="max no-margin margin-left">
              Build Console
            </h6>
            <div class="chip outline">
              v{APP_VERSION}
            </div>
          </div>

          <div
            class="padding black white-text font-monospace small-text scroll overflow-auto"
            style="height: 400px; line-height: 1.6;">
            {simLogs.value.map((log, i,) => (
              <div
                key={i}
                class={log.includes("✅",)
                  ? "green-text"
                  : log.includes("❌",)
                  ? "red-text"
                  : ""}>
                {log}
              </div>
            ))}
            {isSimulating.value && (
              <div class="blink row middle gap">
                <progress class="circle small">
                </progress>
                <span>
                  Processando pipeline...
                </span>
              </div>
            )}
          </div>

          <div class="padding row gap scroll overflow-auto">
            <div class="chip outline">
              <i>
                bolt
              </i>
              <span>
                esbuild (Native)
              </span>
            </div>
            <div class="chip outline">
              <i>
                package
              </i>
              <span>
                Deno.bundle
              </span>
            </div>
            <div class="chip outline">
              <i>
                visibility
              </i>
              <span>
                Watch Engine
              </span>
            </div>
            <div class="chip outline">
              <i>
                smart_toy
              </i>
              <span>
                AI Export
              </span>
            </div>
            <div class="chip outline">
              <i>
                shield_check
              </i>
              <span>
                SemVer Sanitizer
              </span>
            </div>
          </div>
        </article>

        <div class="space">
        </div>

        <div class="row gap">
          <article class="s12 m6 l4 border padding">
            <div class="row middle gap">
              <i class="primary-text circle surface-variant">
                javascript
              </i>
              <div>
                <div class="bold">
                  JS/TS Bundling
                </div>
                <div class="small-text">
                  Suporte nativo a JSX/Preact
                </div>
              </div>
            </div>
          </article>
          <article class="s12 m6 l4 border padding">
            <div class="row middle gap">
              <i class="secondary-text circle surface-variant">
                sync
              </i>
              <div>
                <div class="bold">
                  Version Sync
                </div>
                <div class="small-text">
                  Sincronização entre pacotes
                </div>
              </div>
            </div>
          </article>
          <article class="s12 m12 l4 border padding">
            <div class="row middle gap">
              <i class="tertiary-text circle surface-variant">
                folder_zip
              </i>
              <div>
                <div class="bold">
                  Zero External Dep
                </div>
                <div class="small-text">
                  Executa puro no Deno 2.x
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
