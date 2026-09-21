export const OverviewCard = () => {
  return (
    <div class="grid">
      <div class="s12 m6">
        <article class="border round surface-container-low padding">
          <div class="row middle">
            <i class="primary-text extra">inventory_2</i>
            <div class="max">
              <h5 class="no-margin">@vanaware/buildit</h5>
              <div class="small-text secondary-text">
                Biblioteca central de orquestração em <code>packages/utils</code>
              </div>
            </div>
            <span class="chip small primary-container">JSR Ready</span>
          </div>

          <div class="space"></div>

          <p class="secondary-text">
            O <strong>BuildIt</strong> padroniza o ciclo de vida de projetos Deno e Web modernos,
            fornecendo automação para empacotamento, controle de versão semântico com hash e
            consolidação estruturada de código para análise por modelos de IA.
          </p>

          <div class="divider"></div>
          <div class="space"></div>

          <h6 class="no-margin">Módulos Exportados</h6>
          <nav class="list">
            <div class="row middle no-space padding">
              <i class="primary-text">check_circle</i>
              <div class="max margin-left">
                <strong>@vanaware/buildit</strong>
                <div class="small-text secondary-text">Entrada principal e interfaces compartilhadas</div>
              </div>
            </div>
            <div class="row middle no-space padding">
              <i class="primary-text">check_circle</i>
              <div class="max margin-left">
                <strong>@vanaware/buildit/build</strong>
                <div class="small-text secondary-text">Pipeline de compilação esbuild & Deno.bundle</div>
              </div>
            </div>
            <div class="row middle no-space padding">
              <i class="primary-text">check_circle</i>
              <div class="max margin-left">
                <strong>@vanaware/buildit/export</strong>
                <div class="small-text secondary-text">Consolidador de contexto em Markdown para IAs</div>
              </div>
            </div>
            <div class="row middle no-space padding">
              <i class="primary-text">check_circle</i>
              <div class="max margin-left">
                <strong>@vanaware/buildit/config</strong>
                <div class="small-text secondary-text">Constantes de extensões e regras padrão</div>
              </div>
            </div>
          </nav>
        </article>
      </div>

      <div class="s12 m6">
        <article class="border round surface-container-low padding">
          <div class="row middle">
            <i class="tertiary-text extra">account_tree</i>
            <div class="max">
              <h5 class="no-margin">Estrutura do Workspace</h5>
              <div class="small-text secondary-text">Monorepo Deno 2.x com gerenciamento nativo</div>
            </div>
            <span class="chip small tertiary-container">Deno 2</span>
          </div>

          <div class="space"></div>

          <nav class="list">
            <div class="row top padding border round margin-bottom surface-container">
              <i class="tertiary-text">folder</i>
              <div class="max margin-left">
                <div class="row middle no-space">
                  <strong>packages/utils</strong>
                  <span class="chip small margin-left">@vanaware/buildit</span>
                </div>
                <div class="small-text secondary-text">
                  Núcleo com as 3 CLIs: denobuild, esbuild e exportador de contexto com testes unitários em BDD.
                </div>
              </div>
            </div>

            <div class="row top padding border round margin-bottom surface-container">
              <i class="tertiary-text">folder</i>
              <div class="max margin-left">
                <div class="row middle no-space">
                  <strong>packages/server</strong>
                  <span class="chip small margin-left">@buildit/server</span>
                </div>
                <div class="small-text secondary-text">
                  Servidor estático de alta performance baseado em <code>Deno.serve</code> servindo em <code>0.0.0.0:3000</code>.
                </div>
              </div>
            </div>

            <div class="row top padding border round surface-container">
              <i class="tertiary-text">folder</i>
              <div class="max margin-left">
                <div class="row middle no-space">
                  <strong>packages/ui</strong>
                  <span class="chip small margin-left">@buildit/ui</span>
                </div>
                <div class="small-text secondary-text">
                  Aplicação de demonstração construída puramente com Preact, BeerCSS e Signals reativos.
                </div>
              </div>
            </div>
          </nav>
        </article>
      </div>
    </div>
  );
};

