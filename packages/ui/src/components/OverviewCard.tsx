import { activeTab, } from "../stores/app.ts";

export const OverviewCard = () => {
  return (
    <div class="space-y">
      {/* 🚀 4 Destaques Principais */}
      <div class="grid">
        <div class="s12 m6 l3">
          <article class="border round surface-container-low padding">
            <div class="row middle no-space">
              <div class="circle primary-container middle center-align">
                <i class="primary-text">bolt</i>
              </div>
              <div class="max margin-left">
                <span class="chip small primary-container">esbuild</span>
                <div class="bold margin-top-xs">Motor esbuild</div>
              </div>
            </div>
            <p class="small-text secondary-text margin-top">
              Empacotamento ultra-rápido com <code>@deno/esbuild-plugin</code>, suporte a watch mode e injeção de assets.
            </p>
          </article>
        </div>

        <div class="s12 m6 l3">
          <article class="border round surface-container-low padding">
            <div class="row middle no-space">
              <div class="circle secondary-container middle center-align">
                <i class="secondary-text">memory</i>
              </div>
              <div class="max margin-left">
                <span class="chip small secondary-container">Deno 2 Nativo</span>
                <div class="bold margin-top-xs">Deno.bundle</div>
              </div>
            </div>
            <p class="small-text secondary-text margin-top">
              Empacotador autônomo baseado na API nativa <code>Deno.bundle</code>, sem dependência de binários externos.
            </p>
          </article>
        </div>

        <div class="s12 m6 l3">
          <article class="border round surface-container-low padding">
            <div class="row middle no-space">
              <div class="circle tertiary-container middle center-align">
                <i class="tertiary-text">auto_stories</i>
              </div>
              <div class="max margin-left">
                <span class="chip small tertiary-container">LLM Context</span>
                <div class="bold margin-top-xs">Exportador IA</div>
              </div>
            </div>
            <p class="small-text secondary-text margin-top">
              Consolida repositórios em Markdown estruturado para alimentar prompts de IA com filtros anti-ruído.
            </p>
          </article>
        </div>

        <div class="s12 m6 l3">
          <article class="border round surface-container-low padding">
            <div class="row middle no-space">
              <div class="circle surface-container-highest middle center-align">
                <i class="primary-text">verified</i>
              </div>
              <div class="max margin-left">
                <span class="chip small surface-container-high">JSR & BDD</span>
                <div class="bold margin-top-xs">Qualidade Total</div>
              </div>
            </div>
            <p class="small-text secondary-text margin-top">
              37 suítes de testes BDD rigorosos, 100% tipado e compatível com publicação de bibliotecas no JSR.
            </p>
          </article>
        </div>
      </div>

      <div class="space"></div>

      {/* 📦 Biblioteca & Monorepo */}
      <div class="grid">
        <div class="s12 m6">
          <article class="border round surface-container-low padding">
            <div class="row middle">
              <i class="primary-text extra">inventory_2</i>
              <div class="max">
                <h5 class="no-margin bold">@vanaware/buildit</h5>
                <div class="small-text secondary-text">
                  Biblioteca reutilizável em <code>packages/utils</code>
                </div>
              </div>
              <span class="chip small primary-container">JSR Published</span>
            </div>

            <div class="space"></div>

            <p class="secondary-text">
              Instale ou importe os motores diretamente em qualquer projeto Deno 2:
            </p>

            <pre class="scroll surface-container-highest round padding"><code>deno add jsr:@vanaware/buildit</code></pre>

            <div class="space"></div>
            <h6 class="no-margin bold">Subcaminhos e Módulos</h6>
            <div class="space"></div>

            <nav class="list">
              <div class="row middle padding border round margin-bottom surface-container">
                <i class="primary-text">tune</i>
                <div class="max margin-left">
                  <strong>@vanaware/buildit</strong>
                  <div class="small-text secondary-text">Ponto de entrada central com tipos e interfaces</div>
                </div>
                <span class="chip small">Core</span>
              </div>
              <div class="row middle padding border round margin-bottom surface-container">
                <i class="primary-text">bolt</i>
                <div class="max margin-left">
                  <strong>@vanaware/buildit/build</strong>
                  <div class="small-text secondary-text">Pipeline de compilação esbuild e Deno.bundle</div>
                </div>
                <span class="chip small">Bundler</span>
              </div>
              <div class="row middle padding border round margin-bottom surface-container">
                <i class="primary-text">share</i>
                <div class="max margin-left">
                  <strong>@vanaware/buildit/export</strong>
                  <div class="small-text secondary-text">Gerador de snapshots de contexto para modelos de IA</div>
                </div>
                <span class="chip small">LLM</span>
              </div>
              <div class="row middle padding border round surface-container">
                <i class="primary-text">settings</i>
                <div class="max margin-left">
                  <strong>@vanaware/buildit/config</strong>
                  <div class="small-text secondary-text">Gerenciador de versão semântica e flags CLI</div>
                </div>
                <span class="chip small">Version</span>
              </div>
            </nav>

            <div class="space"></div>
            <nav class="row wrap">
              <button
                type="button"
                class="primary round wave"
                onClick={() => (activeTab.value = "interactive")}
              >
                <i>play_arrow</i>
                <span>Testar no Simulador</span>
              </button>
              <button
                type="button"
                class="border round wave"
                onClick={() => (activeTab.value = "cli")}
              >
                <i>menu_book</i>
                <span>Ver Comandos CLI</span>
              </button>
            </nav>
          </article>
        </div>

        <div class="s12 m6">
          <article class="border round surface-container-low padding">
            <div class="row middle">
              <i class="tertiary-text extra">account_tree</i>
              <div class="max">
                <h5 class="no-margin bold">Estrutura do Workspace</h5>
                <div class="small-text secondary-text">Monorepo multi-pacotes sob Deno 2.x</div>
              </div>
              <span class="chip small tertiary-container">Deno Workspace</span>
            </div>

            <div class="space"></div>

            <nav class="list">
              <div class="row top padding border round margin-bottom surface-container">
                <i class="tertiary-text">folder</i>
                <div class="max margin-left">
                  <div class="row middle no-space">
                    <strong>packages/utils</strong>
                    <span class="chip small margin-left primary-container">@vanaware/buildit</span>
                  </div>
                  <div class="small-text secondary-text margin-top-xs">
                    Pacote publicado no JSR com os 3 motores, interfaces TypeScript e 37 suítes de testes BDD.
                  </div>
                </div>
              </div>

              <div class="row top padding border round margin-bottom surface-container">
                <i class="tertiary-text">folder</i>
                <div class="max margin-left">
                  <div class="row middle no-space">
                    <strong>packages/server</strong>
                    <span class="chip small margin-left secondary-container">@buildit/server</span>
                  </div>
                  <div class="small-text secondary-text margin-top-xs">
                    Servidor HTTP estático nativo utilizando <code>Deno.serve</code> servindo arquivos compilados na porta 3000.
                  </div>
                </div>
              </div>

              <div class="row top padding border round margin-bottom surface-container">
                <i class="tertiary-text">folder</i>
                <div class="max margin-left">
                  <div class="row middle no-space">
                    <strong>packages/ui</strong>
                    <span class="chip small margin-left tertiary-container">@buildit/ui</span>
                  </div>
                  <div class="small-text secondary-text margin-top-xs">
                    Dashboard reativo construído com Preact, Signals e componentes semânticos Material Design 3 via BeerCSS.
                  </div>
                </div>
              </div>
            </nav>

            <div class="space"></div>
            <h6 class="no-margin bold">Comandos Rápidos no Terminal</h6>
            <div class="space"></div>

            <div class="row wrap">
              <span class="chip border"><i class="small">bolt</i>deno task build</span>
              <span class="chip border"><i class="small">memory</i>deno task build:deno</span>
              <span class="chip border"><i class="small">share</i>deno task export</span>
              <span class="chip border"><i class="small">check_circle</i>deno task test</span>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};


