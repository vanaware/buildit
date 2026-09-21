import {
  bundleSimCount,
  cleanDistEnabled,
  clearLogs,
  isSimulating,
  minifyEnabled,
  runSimulator,
  selectedTool,
  simLogs,
  sourcemapEnabled,
  targetName,
  totalLogsCount,
  type ToolKey,
} from "../stores/app.ts";

export const SimulatorCard = () => {
  return (
    <div class="grid">
      <div class="s12 m5">
        <article class="border round surface-container-low padding">
          <div class="row middle">
            <i class="primary-text extra">tune</i>
            <div class="max">
              <h5 class="no-margin">Simulador de Build</h5>
              <div class="small-text secondary-text">
                Parâmetros reativos controlados via Signals
              </div>
            </div>
          </div>

          <div class="space"></div>

          <div class="field label border round">
            <select
              value={selectedTool.value}
              onChange={(e,) =>
                (selectedTool.value = (e.target as HTMLSelectElement).value as ToolKey)
              }
            >
              <option value="esbuild">esbuild (Orquestrador oficial)</option>
              <option value="denobuild">denobuild (Deno.bundle nativo)</option>
              <option value="export">export (Snapshot Markdown)</option>
            </select>
            <label>Ferramenta / CLI</label>
          </div>

          <div class="field label border round">
            <select
              value={targetName.value}
              onChange={(e,) =>
                (targetName.value = (e.target as HTMLSelectElement).value)
              }
            >
              <option value="ui">ui (packages/ui)</option>
              <option value="server">server (packages/server)</option>
              <option value="utils">utils (packages/utils)</option>
            </select>
            <label>Alvo (Target)</label>
          </div>

          <div class="space"></div>

          <nav class="list">
            <label class="checkbox">
              <input
                type="checkbox"
                checked={minifyEnabled.value}
                onChange={(e,) =>
                  (minifyEnabled.value = (e.target as HTMLInputElement).checked)
                }
              />
              <span>Minificar saída (minify)</span>
            </label>

            <label class="checkbox">
              <input
                type="checkbox"
                checked={sourcemapEnabled.value}
                onChange={(e,) =>
                  (sourcemapEnabled.value = (e.target as HTMLInputElement).checked)
                }
              />
              <span>Gerar Sourcemaps (sourcemap)</span>
            </label>

            <label class="checkbox">
              <input
                type="checkbox"
                checked={cleanDistEnabled.value}
                onChange={(e,) =>
                  (cleanDistEnabled.value = (e.target as HTMLInputElement).checked)
                }
              />
              <span>Limpar diretório de saída (clean)</span>
            </label>
          </nav>

          <div class="space"></div>

          <nav class="row">
            <button
              type="button"
              class="primary round"
              disabled={isSimulating.value}
              onClick={runSimulator}
            >
              <i>play_arrow</i>
              <span>{isSimulating.value ? "Executando..." : "Executar Build"}</span>
            </button>
            <button
              type="button"
              class="border round"
              onClick={clearLogs}
            >
              <i>delete_sweep</i>
              <span>Limpar Logs</span>
            </button>
          </nav>

          <div class="space"></div>
          <div class="divider"></div>
          <div class="space"></div>

          <div class="row middle no-space">
            <i class="small-text secondary-text">history</i>
            <span class="small-text secondary-text margin-left">
              Execuções nesta sessão: <strong>{bundleSimCount.value}</strong>
            </span>
          </div>
        </article>
      </div>

      <div class="s12 m7">
        <article class="border round surface-container-low padding">
          <div class="row middle">
            <i class="primary-text">terminal</i>
            <h6 class="max no-margin">Console de Execução</h6>
            <span class="chip small surface-container-highest">
              {totalLogsCount.value} linhas
            </span>
          </div>
          <div class="space"></div>
          <pre class="scroll surface-container-highest round padding"><code>{simLogs.value.join("\n",)}</code></pre>
        </article>
      </div>
    </div>
  );
};

