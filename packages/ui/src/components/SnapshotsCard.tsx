export const SnapshotsCard = () => {
  return (
    <article class="border round surface-container-low padding">
      <div class="row middle">
        <i class="primary-text extra">description</i>
        <div class="max">
          <h4>Exportador de Contexto Inteligente</h4>
          <p class="secondary-text no-margin">
            Gere pacotes consolidados em Markdown para LLMs e revisões de código
          </p>
        </div>
      </div>

      <div class="space"></div>

      <p>
        Desenvolvedores que utilizam assistentes de código e LLMs precisam constantemente
        fornecer contexto preciso de seus repositórios. O utilitário <code>export</code> varre os
        arquivos selecionados, remove ruídos desnecessários e formata o conteúdo em um snapshot
        único, limpo e estruturado.
      </p>

      <div class="grid">
        <div class="s12 m6">
          <article class="border small-round padding surface">
            <h6>📂 Snapshots Predefinidos</h6>
            <ul class="list">
              <li>
                <i>code</i>
                <div>
                  <strong>snapshots/ui.md</strong>
                  <p class="small-text secondary-text">Todo o código-fonte da interface Preact</p>
                </div>
              </li>
              <li>
                <i>dns</i>
                <div>
                  <strong>snapshots/server.md</strong>
                  <p class="small-text secondary-text">Configurações de servidor e workflows CI/CD</p>
                </div>
              </li>
              <li>
                <i>handyman</i>
                <div>
                  <strong>snapshots/utils.md</strong>
                  <p class="small-text secondary-text">Mecanismos de build, CLIs e testes</p>
                </div>
              </li>
              <li>
                <i>menu_book</i>
                <div>
                  <strong>snapshots/docs.md</strong>
                  <p class="small-text secondary-text">Documentação técnica e diretrizes</p>
                </div>
              </li>
            </ul>
          </article>
        </div>

        <div class="s12 m6">
          <article class="border small-round padding surface">
            <h6>💡 Como Executar no Terminal</h6>
            <pre><code>{`# Exporta todos os modos marcados como default:
deno task export

# Exporta apenas o contexto da UI:
deno run --allow-read --allow-write ./export.ts ui

# Exporta apenas a documentação:
deno run --allow-read --allow-write ./export.ts docs`}</code></pre>
          </article>
        </div>
      </div>
    </article>
  );
};
