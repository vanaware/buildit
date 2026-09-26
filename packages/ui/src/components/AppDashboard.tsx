import {
  activeTab,
  API_CODE_SNIPPETS,
  CLI_COMMANDS,
  CONFIG_SNIPPETS,
  copiedId,
  copyToClipboard,
  filteredCliCommands,
  searchQuery,
  selectedConfig,
  selectedTool,
  TOOLS,
} from "../stores/app.ts";
import { APP_VERSION, } from "../version.ts";

export const AppDashboard = () => {
  const currentTool = TOOLS.find((t) => t.id === selectedTool.value) ?? TOOLS[0]!;

  return (
    <div class="padding">
      {/* ================================================================== */}
      {/* ABA: VISÃO GERAL (OVERVIEW) */}
      {/* ================================================================== */}
      {activeTab.value === "overview" && (
        <section class="space-y">
          <article class="border padding surface-container-low round">
            <div class="row middle gap wrap">
              <div class="circle large primary-container center-align middle">
                <i class="primary-text extra">construction</i>
              </div>
              <div class="max">
                <h4 class="no-margin bold">BuildIt</h4>
                <p class="secondary-text no-margin">
                  Suite de utilitários em TypeScript para orquestração de compilação, bundling de alta
                  performance e exportação de contexto para Inteligência Artificial em ecossistemas Deno.
                </p>
              </div>
              <div class="row gap">
                <a
                  class="button primary"
                  onClick={() => activeTab.value = "cli"}
                  style="cursor: pointer;">
                  <i>terminal</i>
                  <span>Comandos CLI</span>
                </a>
                <a
                  class="button border"
                  onClick={() => activeTab.value = "configs"}
                  style="cursor: pointer;">
                  <i>tune</i>
                  <span>Configurações</span>
                </a>
              </div>
            </div>
          </article>

          <div class="space"></div>

          <h5 class="bold">Pilares da Biblioteca</h5>
          <div class="grid">
            {TOOLS.map((tool) => (
              <div key={tool.id} class="s12 m6 l4">
                <article
                  class="border padding fill wave"
                  style="cursor: pointer; height: 100%; display: flex; flex-direction: column;"
                  onClick={() => {
                    selectedTool.value = tool.id;
                    activeTab.value = "tools";
                  }}>
                  <div class="row middle space">
                    <i class={`${tool.colorClass} circle surface-variant`}>
                      {tool.icon}
                    </i>
                    <span class="chip small outline">{tool.badge}</span>
                  </div>
                  <div class="space"></div>
                  <h6 class="bold no-margin">{tool.name}</h6>
                  <p class="small-text secondary-text max" style="flex: 1;">
                    {tool.summary}
                  </p>
                  <div class="divider"></div>
                  <div class="row middle space no-space">
                    <span class="small-text tertiary-text font-monospace">
                      {tool.configFile}
                    </span>
                    <i class="small-text">arrow_forward</i>
                  </div>
                </article>
              </div>
            ))}
          </div>

          <div class="space"></div>

          <article class="border padding surface-container-highest">
            <h6 class="bold">Filosofia Deno &amp; Zero Bloat</h6>
            <div class="grid">
              <div class="s12 m4">
                <div class="row middle gap">
                  <i>speed</i>
                  <div>
                    <div class="bold">Sem node_modules</div>
                    <div class="small-text secondary-text">
                      Dependências resolvidas via URLs, specifiers <code>npm:</code> e <code>jsr:</code>.
                    </div>
                  </div>
                </div>
              </div>
              <div class="s12 m4">
                <div class="row middle gap">
                  <i>security</i>
                  <div>
                    <div class="bold">Fail-Fast &amp; Explícito</div>
                    <div class="small-text secondary-text">
                      Erros didáticos com exemplos de configuração em vez de fallbacks silenciosos.
                    </div>
                  </div>
                </div>
              </div>
              <div class="s12 m4">
                <div class="row middle gap">
                  <i>lock</i>
                  <div>
                    <div class="bold">Anti-Concorrência</div>
                    <div class="small-text secondary-text">
                      Mecanismo de Lock em disco (PID) para evitar rebuilds concorrentes.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* ================================================================== */}
      {/* ABA: FERRAMENTAS (TOOLS) */}
      {/* ================================================================== */}
      {activeTab.value === "tools" && (
        <section>
          <div class="row wrap gap margin-bottom">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                class={`chip ${selectedTool.value === t.id ? "primary" : "outline"}`}
                onClick={() => selectedTool.value = t.id}>
                <i>{t.icon}</i>
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          <div class="space"></div>

          <article class="border padding">
            <div class="row middle space wrap">
              <div class="row middle gap">
                <i class={`${currentTool.colorClass} circle large surface-variant`}>
                  {currentTool.icon}
                </i>
                <div>
                  <h5 class="bold no-margin">{currentTool.name}</h5>
                  <span class="chip small secondary-container">{currentTool.badge}</span>
                </div>
              </div>
              <div class="row middle gap">
                <span class="small-text secondary-text">Configuração:</span>
                <button
                  type="button"
                  class="chip small tertiary-container"
                  onClick={() => {
                    selectedConfig.value = currentTool.configFile;
                    activeTab.value = "configs";
                  }}>
                  <i>tune</i>
                  <span>{currentTool.configFile}</span>
                </button>
              </div>
            </div>

            <div class="space"></div>
            <p class="secondary-text" style="font-size: 1.05rem; line-height: 1.5;">
              {currentTool.description}
            </p>

            <div class="divider margin"></div>

            <h6 class="bold">Comando CLI Canônico</h6>
            <div class="field border middle padding surface-container-highest round row">
              <i class="primary-text">terminal</i>
              <code class="max font-monospace margin-left" style="user-select: all;">
                {currentTool.cliCommand}
              </code>
              <button
                type="button"
                class="chip small primary wave"
                onClick={() => copyToClipboard(currentTool.cliCommand, `tool-${currentTool.id}`)}>
                <i>{copiedId.value === `tool-${currentTool.id}` ? "check" : "content_copy"}</i>
                <span>{copiedId.value === `tool-${currentTool.id}` ? "Copiado!" : "Copiar"}</span>
              </button>
            </div>

            <div class="space"></div>

            <h6 class="bold">Recursos e Capacidades</h6>
            <div class="grid">
              {currentTool.features.map((feat, idx) => (
                <div key={idx} class="s12 m6">
                  <div class="row middle gap no-margin padding-bottom">
                    <i class="green-text">check_circle</i>
                    <span class="small-text">{feat}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {/* ================================================================== */}
      {/* ABA: CLI & SCRIPTS */}
      {/* ================================================================== */}
      {activeTab.value === "cli" && (
        <section>
          <div class="row middle space wrap gap">
            <div>
              <h5 class="bold no-margin">Referência de Comandos CLI</h5>
              <div class="small-text secondary-text">
                Todos os utilitários são executáveis diretamente pelo Deno via JSR ou arquivos locais.
              </div>
            </div>
            <div class="field border prefix round small max" style="max-width: 320px;">
              <i>search</i>
              <input
                type="text"
                placeholder="Filtrar comandos..."
                value={searchQuery.value}
                onInput={(e) => searchQuery.value = (e.target as HTMLInputElement).value}
              />
            </div>
          </div>

          <div class="space"></div>

          <div class="space-y">
            {filteredCliCommands.value.map((item) => (
              <article key={item.id} class="border padding surface-container-low round">
                <div class="row middle space wrap">
                  <div class="row middle gap">
                    <span class="chip small outline">{item.tag}</span>
                    <h6 class="bold no-margin">{item.title}</h6>
                  </div>
                  <button
                    type="button"
                    class="chip small primary wave"
                    onClick={() => copyToClipboard(item.command, item.id)}>
                    <i>{copiedId.value === item.id ? "check" : "content_copy"}</i>
                    <span>{copiedId.value === item.id ? "Copiado!" : "Copiar Comando"}</span>
                  </button>
                </div>

                <p class="small-text secondary-text margin-top-small no-margin-bottom">
                  {item.description}
                </p>

                <div class="field border padding surface-container-highest round margin-top-small row middle">
                  <i class="primary-text">terminal</i>
                  <code class="max font-monospace margin-left small-text" style="user-select: all;">
                    {item.command}
                  </code>
                </div>
              </article>
            ))}

            {filteredCliCommands.value.length === 0 && (
              <div class="center-align padding">
                <p class="secondary-text">Nenhum comando encontrado para o termo pesquisado.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* ABA: CONFIGURAÇÕES (.JSONC) */}
      {/* ================================================================== */}
      {activeTab.value === "configs" && (
        <section>
          <div class="row middle space wrap gap">
            <div>
              <h5 class="bold no-margin">Arquivos de Configuração (.jsonc)</h5>
              <div class="small-text secondary-text">
                O BuildIt utiliza JSON com comentários (JSONC) para uma declaração tipada e legível.
              </div>
            </div>
            <div class="row gap">
              {Object.keys(CONFIG_SNIPPETS).map((name) => (
                <button
                  key={name}
                  type="button"
                  class={`chip ${selectedConfig.value === name ? "primary" : "outline"}`}
                  onClick={() => selectedConfig.value = name}>
                  <i>tune</i>
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>

          <div class="space"></div>

          <article class="border padding surface-container-low round">
            <div class="row middle space padding-bottom">
              <div class="row middle gap">
                <i class="primary-text">description</i>
                <span class="bold font-monospace">{selectedConfig.value}</span>
              </div>
              <button
                type="button"
                class="chip small outline"
                onClick={() =>
                  copyToClipboard(CONFIG_SNIPPETS[selectedConfig.value] ?? "", selectedConfig.value)}>
                <i>{copiedId.value === selectedConfig.value ? "check" : "content_copy"}</i>
                <span>{copiedId.value === selectedConfig.value ? "Copiado!" : "Copiar JSON"}</span>
              </button>
            </div>

            <pre
              class="border padding surface-container-highest round overflow-auto font-monospace small-text"
              style="line-height: 1.5; max-height: 480px;">
              <code>{CONFIG_SNIPPETS[selectedConfig.value]}</code>
            </pre>
          </article>
        </section>
      )}

      {/* ================================================================== */}
      {/* ABA: API DENO (PROGRAMÁTICA) */}
      {/* ================================================================== */}
      {activeTab.value === "api" && (
        <section>
          <div>
            <h5 class="bold no-margin">API Programática em TypeScript</h5>
            <div class="small-text secondary-text">
              Como importar e orquestrar as ferramentas diretamente em código TypeScript/Deno.
            </div>
          </div>

          <div class="space"></div>

          <div class="grid">
            <div class="s12 l6">
              <article class="border padding surface-container-low round fill">
                <div class="row middle space padding-bottom">
                  <div class="row middle gap">
                    <i class="primary-text">bolt</i>
                    <span class="bold">Motor esbuild (esBuild)</span>
                  </div>
                  <button
                    type="button"
                    class="chip small outline"
                    onClick={() => copyToClipboard(API_CODE_SNIPPETS.esbuild, "api-esbuild")}>
                    <i>{copiedId.value === "api-esbuild" ? "check" : "content_copy"}</i>
                    <span>{copiedId.value === "api-esbuild" ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
                <pre
                  class="border padding surface-container-highest round overflow-auto font-monospace small-text"
                  style="line-height: 1.4;">
                  <code>{API_CODE_SNIPPETS.esbuild}</code>
                </pre>
              </article>
            </div>

            <div class="s12 l6">
              <article class="border padding surface-container-low round fill">
                <div class="row middle space padding-bottom">
                  <div class="row middle gap">
                    <i class="tertiary-text">visibility</i>
                    <span class="bold">Motor Watch (watchEngine)</span>
                  </div>
                  <button
                    type="button"
                    class="chip small outline"
                    onClick={() => copyToClipboard(API_CODE_SNIPPETS.watch, "api-watch")}>
                    <i>{copiedId.value === "api-watch" ? "check" : "content_copy"}</i>
                    <span>{copiedId.value === "api-watch" ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
                <pre
                  class="border padding surface-container-highest round overflow-auto font-monospace small-text"
                  style="line-height: 1.4;">
                  <code>{API_CODE_SNIPPETS.watch}</code>
                </pre>
              </article>
            </div>

            <div class="s12">
              <article class="border padding surface-container-low round">
                <div class="row middle space padding-bottom">
                  <div class="row middle gap">
                    <i class="primary-text">smart_toy</i>
                    <span class="bold">Motor de Exportação IA (exportEngine)</span>
                  </div>
                  <button
                    type="button"
                    class="chip small outline"
                    onClick={() => copyToClipboard(API_CODE_SNIPPETS.export, "api-export")}>
                    <i>{copiedId.value === "api-export" ? "check" : "content_copy"}</i>
                    <span>{copiedId.value === "api-export" ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
                <pre
                  class="border padding surface-container-highest round overflow-auto font-monospace small-text"
                  style="line-height: 1.4;">
                  <code>{API_CODE_SNIPPETS.export}</code>
                </pre>
              </article>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
