import {
  applyPreset,
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
      {/* 🎛️ Painel de Controle */}
      <div class="s12 m5">
        <article class="border round surface-container-low padding">
          <div class="row middle">
            <div class="circle primary-container middle center-align">
              <i class="primary-text">tune</i>
            </div>
            <div class="max margin-left">
              <h5 class="no-margin bold">Painel de Simulação</h5>
              <div class="small-text secondary-text">
                Parâmetros reativos controlados via Signals
              </div>
            </div>
          </div>

          <div class="space"></div>

          {/* ⚡ Predefinições Rápidas */}
          <div class="small-text secondary-text bold margin-bottom-xs">Predefinições Rápidas:</div>
          <nav class="row wrap margin-bottom">
            <button
              type="button"
              class="chip border wave"
              onClick={() => applyPreset("prod")}
            >
              <i>bolt</i>
              <span>Produção</span>
            </button>
            <button
              type="button"
              class="chip border wave"
              onClick={() => applyPreset("dev")}
            >
              <i>build</i>
              <span>Dev Rápido</span>
            </button>
            <button
              type="button"
              class="chip border wave"
              onClick={() => applyPreset("export")}
            >
              <i>auto_stories</i>
              <span>Snapshot IA</span>
            </button>
          </nav>

          <div class="field label prefix border round">
            <i>build</i>
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
            <label>Motor / Ferramenta</label>
          </div>

          <div class="field label prefix border round">
            <i>folder_zip</i>
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
            <label>Alvo de Compilação (Target)</label>
          </div>

          <div class="space"></div>

          {/* 🔘 Switches Material Design 3 via BeerCSS */}
          <div class="space-y">
            <div class="row middle padding border round surface-container margin-bottom">
              <i class="primary-text">compress</i>
              <div class="max margin-left">
                <div class="bold">Minificar Saída</div>
                <div class="small-text secondary-text">Ativa minificação e tree-shaking</div>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  checked={minifyEnabled.value}
                  onChange={(e,) =>
                    (minifyEnabled.value = (e.target as HTMLInputElement).checked)
                  }
                />
                <span></span>
              </label>
            </div>

            <div class="row middle padding border round surface-container margin-bottom">
              <i class="secondary-text">map</i>
              <div class="max margin-left">
                <div class="bold">Gerar Sourcemaps</div>
                <div class="small-text secondary-text">Gera arquivos .map para depuração</div>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  checked={sourcemapEnabled.value}
                  onChange={(e,) =>
                    (sourcemapEnabled.value = (e.target as HTMLInputElement).checked)
                  }
                />
                <span></span>
              </label>
            </div>

            <div class="row middle padding border round surface-container margin-bottom">
              <i class="tertiary-text">delete_sweep</i>
              <div class="max margin-left">
                <div class="bold">Limpar Diretório Dist</div>
                <div class="small-text secondary-text">Executa limpeza prévia em distdir</div>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  checked={cleanDistEnabled.value}
                  onChange={(e,) =>
                    (cleanDistEnabled.value = (e.target as HTMLInputElement).checked)
                  }
                />
                <span></span>
              </label>
            </div>
          </div>

          <div class="space"></div>

          <nav class="row wrap">
            <button
              type="button"
              class="primary round wave max"
              disabled={isSimulating.value}
              onClick={runSimulator}
            >
              {isSimulating.value ? (
                <progress class="circle small"></progress>
              ) : (
                <i>play_arrow</i>
              )}
              <span>{isSimulating.value ? "Compilando..." : "Executar Pipeline"}</span>
            </button>
            <button
              type="button"
              class="border round wave"
              onClick={clearLogs}
              title="Limpar logs do console"
            >
              <i>delete_sweep</i>
              <span>Limpar</span>
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

      {/* 💻 Janela do Console Terminal */}
      <div class="s12 m7">
        <article class="border round surface-container-low padding">
          <div class="row middle">
            {/* Pontos de controle da janela */}
            <div class="row no-space margin-right">
              <span class="circle small error margin-right-xs"></span>
              <span class="circle small warning margin-right-xs"></span>
              <span class="circle small primary"></span>
            </div>
            <i class="primary-text margin-left-xs">terminal</i>
            <h6 class="max no-margin bold margin-left-xs">Console de Execução</h6>
            {isSimulating.value ? (
              <span class="chip small tertiary-container">
                <progress class="circle small"></progress>
                <span>Processando</span>
              </span>
            ) : (
              <span class="chip small primary-container">
                {totalLogsCount.value} eventos
              </span>
            )}
          </div>

          <div class="space"></div>

          <pre class="scroll surface-container-highest round padding" style="min-height: 380px;"><code>{simLogs.value.join("\n",)}</code></pre>
        </article>
      </div>
    </div>
  );
};


