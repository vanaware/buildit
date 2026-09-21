export const SnapshotsCard = () => {
  return (
    <div class="grid">
      <div class="s12">
        <article class="border round surface-container-low padding">
          <div class="row middle">
            <i class="primary-text extra">auto_stories</i>
            <div class="max">
              <h5 class="no-margin">Exportador de Contexto para Inteligência Artificial</h5>
              <div class="small-text secondary-text">
                Gere snapshots consolidados em Markdown para LLMs e revisões de código
              </div>
            </div>
            <span class="chip small primary-container">CLI & Lib</span>
          </div>

          <div class="space"></div>

          <p class="secondary-text">
            Desenvolvedores que utilizam assistentes de código e LLMs precisam constantemente
            fornecer contexto preciso de seus repositórios. O utilitário <code>export</code> varre os
            arquivos selecionados, remove ruídos desnecessários e formata o conteúdo em um snapshot
            único, limpo e estruturado.
          </p>
        </article>
      </div>

      <div class="s12 m6">
        <article class="border round surface-container-low padding">
          <h6 class="no-margin">Snapshots Predefinidos</h6>
          <div class="space"></div>
          <nav class="list">
            <div class="row middle padding border round margin-bottom surface-container">
              <i class="primary-text">code</i>
              <div class="max margin-left">
                <strong>snapshots/ui.md</strong>
                <div class="small-text secondary-text">Todo o código-fonte da interface Preact</div>
              </div>
            </div>
            <div class="row middle padding border round margin-bottom surface-container">
              <i class="primary-text">dns</i>
              <div class="max margin-left">
                <strong>snapshots/server.md</strong>
                <div class="small-text secondary-text">Configurações de servidor e workflows CI/CD</div>
              </div>
            </div>
            <div class="row middle padding border round margin-bottom surface-container">
              <i class="primary-text">handyman</i>
              <div class="max margin-left">
                <strong>snapshots/utils.md</strong>
                <div class="small-text secondary-text">Mecanismos de build, CLIs e testes</div>
              </div>
            </div>
            <div class="row middle padding border round surface-container">
              <i class="primary-text">menu_book</i>
              <div class="max margin-left">
                <strong>snapshots/docs.md</strong>
                <div class="small-text secondary-text">Documentação técnica e diretrizes</div>
              </div>
            </div>
          </nav>
        </article>
      </div>

      <div class="s12 m6">
        <article class="border round surface-container-low padding">
          <h6 class="no-margin">Como Executar no Terminal</h6>
          <div class="space"></div>
          <p class="small-text secondary-text">
            O utilitário aceita argumentos via CLI para rodar snapshots específicos ou todos os padrões.
          </p>
          <pre class="scroll surface-container-highest round padding"><code>{`# Exporta todos os modos marcados como default:
deno task export

# Exporta apenas o contexto da UI:
deno run --allow-read --allow-write ./export.ts ui

# Exporta apenas a documentação:
deno run --allow-read --allow-write ./export.ts docs`}</code></pre>
        </article>
      </div>
    </div>
  );
};

