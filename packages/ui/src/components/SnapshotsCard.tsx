import { activeTab, selectedTool, } from "../stores/app.ts";

export const SnapshotsCard = () => {
  const snapshots = [
    {
      file: "snapshots/ui.md",
      title: "UI Context",
      badge: "Preact & BeerCSS",
      target: "ui",
      icon: "devices",
      desc: "Todo o código-fonte da interface de usuário, componentes, stores e manifest.",
    },
    {
      file: "snapshots/server.md",
      title: "Server & Deploy",
      badge: "Deno.serve & CI/CD",
      target: "server",
      icon: "dns",
      desc: "Servidor estático, scripts de inicialização, configuração Docker e workflows.",
    },
    {
      file: "snapshots/utils.md",
      title: "Core Engines & Tests",
      badge: "@vanaware/buildit",
      target: "utils",
      icon: "handyman",
      desc: "Motores de orquestração, suíte de 37 testes BDD e interfaces TypeScript.",
    },
    {
      file: "snapshots/docs.md",
      title: "Technical Docs",
      badge: "Markdown Specs",
      target: "docs",
      icon: "menu_book",
      desc: "Arquitetura, guias de publicação JSR, plano de tarefas e especificações de API.",
    },
  ];

  return (
    <div class="space-y">
      {/* 🌟 Cabeçalho do Exportador */}
      <div class="grid">
        <div class="s12">
          <article class="border round surface-container-low padding">
            <div class="row middle">
              <div class="circle tertiary-container middle center-align">
                <i class="tertiary-text extra">auto_stories</i>
              </div>
              <div class="max margin-left">
                <div class="row middle no-space">
                  <h5 class="no-margin bold">Exportador de Contexto para Inteligência Artificial</h5>
                  <span class="chip small tertiary-container margin-left">LLM-Ready</span>
                </div>
                <div class="small-text secondary-text">
                  Consolidação limpa e estruturada de repositórios em Markdown para Claude, Gemini e GPT
                </div>
              </div>
              <button
                type="button"
                class="primary round wave small none s-inline-flex"
                onClick={() => {
                  selectedTool.value = "export";
                  activeTab.value = "interactive";
                }}
              >
                <i>tune</i>
                <span>Simular Snapshot</span>
              </button>
            </div>

            <div class="space"></div>

            <p class="secondary-text medium-line">
              Desenvolvedores que utilizam assistentes de código e LLMs precisam constantemente
              fornecer contexto preciso de seus repositórios sem poluição de arquivos binários, dependências ou
              arquivos gerados. O utilitário <code>export</code> varre os arquivos permitidos, aplica filtros de segurança
              anti-loop e estrutura um documento Markdown unificado e limpo.
            </p>
          </article>
        </div>
      </div>

      <div class="space"></div>

      {/* 📑 Alvos e Instruções CLI */}
      <div class="grid">
        <div class="s12 m6">
          <article class="border round surface-container-low padding">
            <div class="row middle no-space">
              <i class="primary-text">bookmarks</i>
              <h6 class="no-margin bold margin-left">Snapshots Automatizados</h6>
            </div>
            <div class="space"></div>

            <nav class="list">
              {snapshots.map((s, idx) => (
                <div
                  key={idx}
                  class={`row top padding border round ${idx < snapshots.length - 1 ? "margin-bottom" : ""} surface-container`}
                >
                  <div class="circle surface-container-highest middle center-align">
                    <i class="primary-text">{s.icon}</i>
                  </div>
                  <div class="max margin-left">
                    <div class="row middle no-space">
                      <strong class="medium-text">{s.file}</strong>
                      <span class="chip small margin-left">{s.badge}</span>
                    </div>
                    <div class="small-text secondary-text margin-top-xs">{s.desc}</div>
                  </div>
                </div>
              ))}
            </nav>
          </article>
        </div>

        <div class="s12 m6">
          <article class="border round surface-container-low padding">
            <div class="row middle no-space">
              <i class="primary-text">terminal</i>
              <h6 class="no-margin bold margin-left">Comandos no Terminal</h6>
            </div>
            <div class="space"></div>
            <p class="small-text secondary-text">
              Execute a tarefa central ou isole alvos individuais conforme a necessidade da análise:
            </p>
            <pre class="scroll surface-container-highest round padding"><code>{`# Exporta todos os modos marcados como padrão (default: true):
deno task export

# Exporta apenas o contexto da UI:
deno run --allow-read --allow-write ./export.ts ui

# Exporta apenas motores e testes:
deno run --allow-read --allow-write ./export.ts utils

# Exporta documentação técnica:
deno run --allow-read --allow-write ./export.ts docs`}</code></pre>

            <div class="space"></div>
            <div class="divider"></div>
            <div class="space"></div>

            <div class="row middle no-space">
              <i class="tertiary-text">security</i>
              <h6 class="no-margin bold margin-left">Proteções Embutidas</h6>
            </div>
            <div class="space"></div>
            <ul class="small-text secondary-text no-margin medium-line">
              <li><strong>Proteção Anti-Loop:</strong> Impede recursividade ao excluir a própria pasta de saída de snapshots.</li>
              <li><strong>Filtro de Extensões:</strong> Restringe a captura apenas a formatos textuais relevantes (.ts, .tsx, .json, .md, .html).</li>
              <li><strong>Inclusão Seletiva:</strong> Permite especificar arquivos de raiz individuais (deno.json, manifest.json).</li>
            </ul>

            <div class="space"></div>
            <nav class="row right-align">
              <button
                type="button"
                class="primary round wave"
                onClick={() => {
                  selectedTool.value = "export";
                  activeTab.value = "interactive";
                }}
              >
                <i>play_arrow</i>
                <span>Testar Exportação no Simulador</span>
              </button>
            </nav>
          </article>
        </div>
      </div>
    </div>
  );
};


