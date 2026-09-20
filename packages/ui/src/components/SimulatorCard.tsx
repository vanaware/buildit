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
          <h5>Painel de Simulação</h5>
          <p class="small-text secondary-text">
            Experimente os parâmetros reativos do BuildIt controlados via Preact Signals.
          </p>

          <div class="field label border">
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

          <div class="field label border">
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

          <div class="space"></div>

          <nav>
            <button
              type="button"
              class="primary"
              disabled={isSimulating.value}
              onClick={runSimulator}
            >
              <i>play_arrow</i>
              <span>{isSimulating.value ? "Executando..." : "Executar Build"}</span>
            </button>
            <button
              type="button"
              class="transparent"
              onClick={clearLogs}
            >
              <i>delete_sweep</i>
              <span>Limpar Logs</span>
            </button>
          </nav>

          <div class="divider"></div>
          <p class="small-text secondary-text">
            Execuções nesta sessão: <strong>{bundleSimCount.value}</strong>
          </p>
        </article>
      </div>

      <div class="s12 m7">
        <article class="border round surface-container-low padding">
          <div class="row middle">
            <i class="secondary-text">terminal</i>
            <h6 class="max no-margin">Console de Execução ({totalLogsCount.value} linhas)</h6>
          </div>
          <div class="space"></div>
          <pre style="max-height: 420px; overflow-y: auto;">
            <code>{simLogs.value.join("\n",)}</code>
          </pre>
        </article>
      </div>
    </div>
  );
};
