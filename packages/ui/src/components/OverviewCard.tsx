export const OverviewCard = () => {
  return (
    <div class="grid">
      <div class="s12 m6">
        <article class="border round surface-container-low">
          <div class="row middle">
            <i class="primary-text extra">inventory_2</i>
            <div class="max">
              <h5>@vanaware/buildit</h5>
              <p class="small-text secondary-text">
                Biblioteca central de orquestração localizada em <code>packages/utils</code>
              </p>
            </div>
          </div>
          <p>
            O <strong>BuildIt</strong> padroniza o ciclo de vida de projetos Deno e Web modernos,
            fornecendo automação para empacotamento, controle de versão semântico com hash e
            consolidação estruturada de código para análise por modelos de IA.
          </p>
          <div class="divider"></div>
          <h6>Módulos Exportados:</h6>
          <ul class="list">
            <li>
              <i>check</i>
              <span><code>@vanaware/buildit</code> — Entrada principal e interfaces compartilhadas</span>
            </li>
            <li>
              <i>check</i>
              <span><code>@vanaware/buildit/build</code> — Pipeline esbuild & Deno.bundle</span>
            </li>
            <li>
              <i>check</i>
              <span><code>@vanaware/buildit/export</code> — Consolidador de contexto em Markdown</span>
            </li>
            <li>
              <i>check</i>
              <span><code>@vanaware/buildit/config</code> — Constantes e regras padrão</span>
            </li>
          </ul>
        </article>
      </div>

      <div class="s12 m6">
        <article class="border round surface-container-low">
          <div class="row middle">
            <i class="tertiary-text extra">account_tree</i>
            <div class="max">
              <h5>Estrutura do Workspace</h5>
              <p class="small-text secondary-text">Monorepo Deno 2.x com gerenciamento nativo</p>
            </div>
          </div>

          <div class="space"></div>

          <article class="border small-round padding margin-bottom">
            <strong>📁 packages/utils (@vanaware/buildit)</strong>
            <p class="small-text no-margin">
              Núcleo com as 3 CLIs: denobuild, esbuild e exportador de contexto com testes unitários em BDD.
            </p>
          </article>

          <article class="border small-round padding margin-bottom">
            <strong>📁 packages/server (@buildit/server)</strong>
            <p class="small-text no-margin">
              Servidor estático de alta performance baseado em <code>Deno.serve</code> servindo em <code>0.0.0.0:3000</code>.
            </p>
          </article>

          <article class="border small-round padding">
            <strong>📁 packages/ui (@buildit/ui)</strong>
            <p class="small-text no-margin">
              Aplicação de demonstração interativa construída puramente com Preact, BeerCSS e Signals.
            </p>
          </article>
        </article>
      </div>
    </div>
  );
};
