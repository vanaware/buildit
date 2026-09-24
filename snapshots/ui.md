> **INSTRUÇÃO PARA A IA:** 
> O texto abaixo contém os arquivos de CÓDIGO FONTE principais da aplicação exemplo (UI).
> O projeto é o **BuildIt [v0.3.31#mudxvcks] ** estruturado em módulos. 
> Cada arquivo começa com um título indicando seu caminho relativo exato (ex: `## Arquivo: src/main.ts`).
> Sempre que sugerir alterações, indique claramente qual arquivo deve ser modificado com base nesses caminhos e forneça o novo código completo do arquivo.

---

# Contexto Exportado do Projeto BuildIt [v0.3.31#mudxvcks] - Modo: UI

Gerado automaticamente em: 2026-09-24T00:25:49.916Z

---

## Arquivo: `packages/ui/deno.jsonc`

```json
{
  "name": "@buildit/ui",
  "publish": false,

  // ----------------------------------------------------------------------
  // 🔧 Compiler Options — AJUSTADO PARA DENO 2.x
  // ----------------------------------------------------------------------
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "dom.asynciterable",
      "esnext"
    ],
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  },

  // 📦 Gerenciamento de Dependências
  "imports": {
    // Preact Core — versão fixa e canônica
    "preact": "https://esm.sh/preact@10.29.8",
    "preact/": "https://esm.sh/preact@10.29.8/",
    "preact/jsx-runtime": "https://esm.sh/preact@10.29.8/jsx-runtime",

    // Signals — mapeados explicitamente para evitar npm
    "@preact/signals": "https://esm.sh/@preact/signals@2.11.2?deps=preact@10.29.8",
    "@preact/signals-core": "https://esm.sh/@preact/signals-core@1.14.4"
  },

  // 🛠️ Scripts de Automação
  "tasks": {
    "test": "deno test --allow-env --allow-net tests/",
    "check": "deno check src/**/*.{ts,tsx} tests/**/*.ts",
    "tests": "deno task check && deno task test"
  },
  "exclude": ["public/"],
  "exports": "./src/main.tsx"
}

```

---

## Arquivo: `packages/ui/public/manifest.json`

```json
{
  "name": "BuildIt PWA",
  "short_name": "BuildIt",
  "description": "BuildIt Offline PWA Demo",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#1a1c19",
  "theme_color": "#9edeb6",
  "icons": [
    {
      "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%239edeb6'/><text x='50' y='68' font-size='50' font-family='system-ui, sans-serif' font-weight='bold' text-anchor='middle' fill='%231a1c19'>L</text></svg>",
      "sizes": "192x192 512x512",
      "type": "image/svg+xml"
    }
  ]
}

```

---

## Arquivo: `packages/ui/src/components/Header.tsx`

```tsx
import { activeTab, themeMode, toggleTheme, } from "../stores/app.ts";
import { version as APP_VERSION, } from "@vanaware/buildit";

export const Header = () => {
  return (
    <header class="surface-container-low border bottom">
      <nav class="responsive">
        <div class="circle primary-container middle center-align">
          <i class="primary-text">
            construction
          </i>
        </div>
        <div class="max">
          <div class="row middle no-space">
            <h5 class="no-margin bold">
              BuildIt
            </h5>
            <span class="chip small primary-container margin-left">
              v{APP_VERSION}
            </span>
            <span class="chip small tertiary-container margin-left none s-inline-block">
              Deno 2.x
            </span>
            <span class="chip small secondary-container margin-left none m-inline-block">
              JSR
            </span>
          </div>
          <div class="small-text secondary-text">
            Orquestrador de Compilação &amp; Exportador de Contexto IA para Deno
          </div>
        </div>
        <button
          type="button"
          class="border round wave small none s-inline-flex"
          onClick={() => (activeTab.value = "cli")}>
          <i>
            menu_book
          </i>
          <span>
            Docs &amp; CLI
          </span>
        </button>
        <button
          type="button"
          class="circle transparent wave"
          onClick={toggleTheme}
          title={themeMode.value === "dark"
            ? "Ativar tema claro"
            : "Ativar tema escuro"}>
          <i>
            {themeMode.value === "dark" ? "light_mode" : "dark_mode"}
          </i>
        </button>
      </nav>
    </header>
  );
};

```

---

## Arquivo: `packages/ui/src/components/Navigation.tsx`

```tsx
import { activeTab, type TabKey, } from "../stores/app.ts";

export const Navigation = () => {
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview", label: "Visão Geral", icon: "dashboard", },
    { key: "cli", label: "Ferramentas & CLI", icon: "terminal", },
    { key: "interactive", label: "Simulador Interativo", icon: "play_circle", },
    { key: "snapshots", label: "Exportador de Contexto", icon: "share", },
  ];

  return (
    <nav class="tabs center-align border bottom margin-bottom scroll">
      {tabs.map((tab,) => (
        <a
          key={tab.key}
          class={activeTab.value === tab.key ? "active" : ""}
          onClick={() => (activeTab.value = tab.key)}
        >
          <i>{tab.icon}</i>
          <span>{tab.label}</span>
        </a>
      ))}
    </nav>
  );
};


```

---

## Arquivo: `packages/ui/src/components/OverviewCard.tsx`

```tsx
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



```

---

## Arquivo: `packages/ui/src/components/SimulatorCard.tsx`

```tsx
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



```

---

## Arquivo: `packages/ui/src/components/SnapshotsCard.tsx`

```tsx
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



```

---

## Arquivo: `packages/ui/src/components/ToolDetails.tsx`

```tsx
import { activeTab, selectedTool, type ToolKey, } from "../stores/app.ts";

export const ToolDetails = () => {
  const tools: {
    key: ToolKey;
    icon: string;
    title: string;
    badge: string;
    subtitle: string;
    description: string;
    specs: { label: string; value: string }[];
    command: string;
    configFile: string;
    config: string;
  }[] = [
    {
      key: "esbuild",
      icon: "bolt",
      title: "esbuild Pipeline",
      badge: "Velocidade Extrema",
      subtitle: "Empacotamento de alta velocidade para navegadores e web apps",
      description:
        "Orquestrador avançado que conecta esbuild ao @deno/esbuild-plugin. Suporta múltiplos alvos em paralelo, watch mode contínuo, injeção de versão semântica e resolução de dependências remotas do ecossistema Deno.",
      specs: [
        { label: "Plugin Deno", value: "@deno/esbuild-plugin" },
        { label: "Modos", value: "build / watch" },
        { label: "Assets", value: "Cópia automática" },
        { label: "Versão", value: "Injeção no manifest.json" },
      ],
      command: "deno task build\n# ou com argumentos de controle:\ndeno run -A ./esbuild.ts [alvo] [noversion] [watch]",
      configFile: "esbuild.jsonc",
      config: `// Configuração declarativa de alvos esbuild (esbuild.jsonc)
{
  "$schema": "https://deno.land/x/buildit/schemas/esbuild.json",
  "targets": {
    "ui": {
      "srcdir": "packages/ui/src",
      "distdir": "packages/server/build/dist",
      "entryPoints": ["main.tsx"],
      "bundle": true,
      "format": "esm",
      "minify": true,
      "sourcemap": "linked",
      "clean": true
    }
  }
}`,
    },
    {
      key: "denobuild",
      icon: "memory",
      title: "denobuild Engine",
      badge: "Zero Dependências",
      subtitle: "Empacotador autônomo baseado na API nativa Deno.bundle (--unstable-bundle)",
      description:
        "Motor de compilação que emprega a nova API Deno.bundle nativa do Deno 2.x. Ideal para empacotar bibliotecas, Workers e scripts autônomos sem requerer binários compilados externos ou ferramentas de terceiros.",
      specs: [
        { label: "Motor", value: "Deno.bundle nativo" },
        { label: "Flag Deno", value: "--unstable-bundle" },
        { label: "Code Splitting", value: "Suporte ESM" },
        { label: "Dependências", value: "Nenhuma (Zero deps)" },
      ],
      command: "deno task build:deno\n# ou execução direta:\ndeno run --unstable-bundle -A ./build.ts [alvo]",
      configFile: "denobuild.jsonc",
      config: `// Configuração declarativa denobuild (denobuild.jsonc)
{
  "$schema": "https://deno.land/x/buildit/schemas/denobuild.json",
  "targets": {
    "ui": {
      "entryPoints": ["main.tsx"],
      "format": "esm",
      "packages": "bundle",
      "inlineImports": true,
      "minify": true
    }
  }
}`,
    },
    {
      key: "export",
      icon: "auto_stories",
      title: "Context Exporter",
      badge: "IA & Documentação",
      subtitle: "Consolidação de código-fonte estruturada para LLMs e revisões",
      description:
        "Consolidador inteligente de código-fonte e documentação em arquivos Markdown estruturados. Inclui proteção contra loops de pastas de saída, filtros por extensão, inclusão seletiva de arquivos raiz e cabeçalhos explicativos para agentes de Inteligência Artificial.",
      specs: [
        { label: "Formato", value: "Markdown consolidado" },
        { label: "Filtros", value: "Anti-loop & Extensões" },
        { label: "Cabeçalho", value: "Instruções customizadas" },
        { label: "Saída", value: "snapshots/*.md" },
      ],
      command: "deno task export\n# ou com seleção de alvos específicos:\ndeno run --allow-read --allow-write ./export.ts [ui|docs|server|utils]",
      configFile: "export.jsonc",
      config: `// Configuração declarativa export.jsonc
{
  "$schema": "https://deno.land/x/buildit/schemas/export.json",
  "modos": {
    "ui": {
      "arquivoSaida": "snapshots/ui.md",
      "pastaBase": "./packages/ui/",
      "subpastasPermitidas": ["src", "public", "tests"],
      "arquivosRaizPermitidos": ["deno.json", "deno.jsonc"],
      "extensoesPermitidas": [".ts", ".tsx", ".html", ".json"],
      "incluiVersao": true,
      "default": true
    }
  }
}`,
    },
  ];

  return (
    <div>
      {/* 🧭 Seletor de Ferramenta */}
      <nav class="row wrap margin-bottom">
        {tools.map((t,) => (
          <button
            key={t.key}
            type="button"
            class={`round wave ${selectedTool.value === t.key ? "primary" : "border"}`}
            onClick={() => (selectedTool.value = t.key)}
          >
            <i>{t.icon}</i>
            <span class="bold">{t.title}</span>
            <span class="chip small margin-left none s-inline-block">{t.badge}</span>
          </button>
        ))}
      </nav>

      {/* 📋 Detalhes da Ferramenta Ativa */}
      {tools
        .filter((t,) => t.key === selectedTool.value)
        .map((t,) => (
          <article key={t.key} class="border round surface-container-low padding">
            <div class="row middle">
              <div class="circle primary-container middle center-align">
                <i class="primary-text extra">{t.icon}</i>
              </div>
              <div class="max margin-left">
                <div class="row middle no-space">
                  <h5 class="no-margin bold">{t.title}</h5>
                  <span class="chip small primary-container margin-left">{t.configFile}</span>
                </div>
                <div class="small-text secondary-text">{t.subtitle}</div>
              </div>
              <button
                type="button"
                class="primary round wave small none s-inline-flex"
                onClick={() => {
                  selectedTool.value = t.key;
                  activeTab.value = "interactive";
                }}
              >
                <i>play_arrow</i>
                <span>Simular</span>
              </button>
            </div>

            <div class="space"></div>

            <p class="secondary-text medium-line">{t.description}</p>

            <div class="space"></div>

            {/* 🏷️ Especificações e Capacidades */}
            <div class="grid">
              {t.specs.map((s, idx) => (
                <div key={idx} class="s6 m3">
                  <div class="padding border round surface-container center-align">
                    <div class="small-text secondary-text">{s.label}</div>
                    <div class="bold margin-top-xs">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div class="space"></div>
            <div class="divider"></div>
            <div class="space"></div>

            {/* 💻 Comandos e Configurações */}
            <div class="grid">
              <div class="s12 m6">
                <div class="row middle no-space">
                  <i class="primary-text">terminal</i>
                  <h6 class="no-margin bold margin-left">Comandos no Terminal</h6>
                </div>
                <div class="space"></div>
                <pre class="scroll surface-container-highest round padding"><code>{t.command}</code></pre>
              </div>

              <div class="s12 m6">
                <div class="row middle no-space">
                  <i class="primary-text">description</i>
                  <h6 class="no-margin bold margin-left">Configuração ({t.configFile})</h6>
                </div>
                <div class="space"></div>
                <pre class="scroll surface-container-highest round padding"><code>{t.config}</code></pre>
              </div>
            </div>

            <div class="space"></div>
            <nav class="row right-align">
              <button
                type="button"
                class="primary round wave"
                onClick={() => {
                  selectedTool.value = t.key;
                  activeTab.value = "interactive";
                }}
              >
                <i>tune</i>
                <span>Abrir no Simulador de Build</span>
              </button>
            </nav>
          </article>
        ))}
    </div>
  );
};



```

---

## Arquivo: `packages/ui/src/index.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>BuildIt</title>
    <meta name="description" content="Build orchestration, bundling and AI context export utilities for Deno & Web projects.">
    <meta property="og:title" content="BuildIt">
    <meta property="og:description" content="Build orchestration, bundling and AI context export utilities for Deno & Web projects.">

    <!-- Web App Manifest -->
    <link rel="manifest" href="./manifest.json">

    <!-- Favicon gerado nativamente via SVG in-line -->
    <link rel="icon" type="image/svg+xml"
      href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%239edeb6'/><text x='50' y='68' font-size='50' font-family='system-ui, sans-serif' font-weight='bold' text-anchor='middle' fill='%231a1c19'>L</text></svg>">

    <!-- BeerCSS e Material Symbols -->
    <link
      href="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.css"
      rel="stylesheet" />
    <script type="module"
      src="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.js"></script>
    <script type="module"
      src="https://cdn.jsdelivr.net/npm/material-dynamic-colors@1.1.2/dist/cdn/material-dynamic-colors.min.js"></script>
  </head>
  <body class="dark">
    <a id="iframe-warning" class="banner yellow-container row middle center-align padding" target="_blank" rel="noopener" style="display: none; position: relative; z-index: 1000; border-radius: 8px; margin: 24px 8px 8px 8px; padding-top: 12px; padding-bottom: 12px; min-height: 56px; box-sizing: border-box; overflow: visible;">
      <i style="vertical-align: middle;">info</i>
      <div class="max center-align" style="padding: 0 8px; line-height: 1.4; white-space: nowrap;">
        <span>Clique para nova aba.</span>
      </div>
      <i style="vertical-align: middle;">open_in_new</i>
    </a>

    <script>
    (function() {
      try {
        if (window.self !== window.top) {
          document.addEventListener("DOMContentLoaded", () => {
            const banner = document.getElementById("iframe-warning");
            if (banner) {
              banner.href = window.location.href;
              banner.style.display = "flex";
            }
          });
        }
      } catch (e) {
        // Fallback for cross-origin errors if top is blocked
        console.warn("Iframe detection error:", e);
      }
    })();
    </script>

    <div id="app">
      <main class="responsive center-align">
        <div class="space"></div>
        <h5>Carregando aplicação...</h5>
        <progress class="circle"></progress>
      </main>
    </div>

    <!-- Arquivo gerado pelo esbuild -->
    <script type="module" src="./main.js?v=3"></script>
  </body>
</html>

```

---

## Arquivo: `packages/ui/src/main.tsx`

```tsx
import { render, } from "preact";
import { activeTab, } from "./stores/app.ts";
import { Header, } from "./components/Header.tsx";
import { Navigation, } from "./components/Navigation.tsx";
import { OverviewCard, } from "./components/OverviewCard.tsx";
import { ToolDetails, } from "./components/ToolDetails.tsx";
import { SimulatorCard, } from "./components/SimulatorCard.tsx";
import { SnapshotsCard, } from "./components/SnapshotsCard.tsx";

const App = () => {
  return (
    <div>
      <Header />
      <main class="responsive">
        <div class="space"></div>
        <Navigation />

        {activeTab.value === "overview" && <OverviewCard />}
        {activeTab.value === "cli" && <ToolDetails />}
        {activeTab.value === "interactive" && <SimulatorCard />}
        {activeTab.value === "snapshots" && <SnapshotsCard />}

        <div class="large-space"></div>
        <footer class="responsive center-align">
          <div class="divider"></div>
          <div class="space"></div>
          <p class="small-text secondary-text no-margin">
            BuildIt &bull; Deno &amp; Web Toolkit &bull; Construído com Preact, Signals e BeerCSS
          </p>
        </footer>
      </main>
    </div>
  );
};

render(<App />, document.getElementById("app",)!,);


```

---

## Arquivo: `packages/ui/src/stores/app.ts`

```ts
import { computed, signal, } from "@preact/signals";

export type TabKey = "overview" | "cli" | "interactive" | "snapshots";
export type ToolKey = "esbuild" | "denobuild" | "export";

export const activeTab = signal<TabKey>("overview",);
export const themeMode = signal<"dark" | "light">("dark",);
export const selectedTool = signal<ToolKey>("esbuild",);

export const targetName = signal<string>("ui",);
export const minifyEnabled = signal<boolean>(false,);
export const sourcemapEnabled = signal<boolean>(true,);
export const cleanDistEnabled = signal<boolean>(true,);

export const bundleSimCount = signal<number>(0,);
export const isSimulating = signal<boolean>(false,);
export const simLogs = signal<string[]>([
  "🚀 BuildIt Workspace Initialized.",
  "📦 Packages active: server, ui, utils (@vanaware/buildit)",
  "💡 Ready to orchestrate builds and context exports.",
],);

export const totalLogsCount = computed(() => simLogs.value.length,);

export const addLog = (msg: string,) => {
  const timestamp = new Date().toLocaleTimeString();
  simLogs.value = [...simLogs.value, `[${timestamp}] ${msg}`,];
};

export const applyPreset = (preset: "prod" | "dev" | "export",) => {
  if (preset === "prod") {
    selectedTool.value = "esbuild";
    targetName.value = "ui";
    minifyEnabled.value = true;
    sourcemapEnabled.value = true;
    cleanDistEnabled.value = true;
    addLog("⚡ Predefinição 'Produção' aplicada (esbuild, minify, sourcemap, clean).",);
  } else if (preset === "dev") {
    selectedTool.value = "esbuild";
    targetName.value = "ui";
    minifyEnabled.value = false;
    sourcemapEnabled.value = true;
    cleanDistEnabled.value = false;
    addLog("🛠️ Predefinição 'Dev Rápido' aplicada (esbuild, unminified, sourcemap).",);
  } else {
    selectedTool.value = "export";
    targetName.value = "ui";
    minifyEnabled.value = false;
    sourcemapEnabled.value = false;
    cleanDistEnabled.value = false;
    addLog("📝 Predefinição 'Snapshot IA' aplicada (exportador de contexto).",);
  }
};

export const clearLogs = () => {
  simLogs.value = [];
};

export const toggleTheme = () => {
  const next = themeMode.value === "dark" ? "light" : "dark";
  themeMode.value = next;
  if (typeof document !== "undefined") {
    document.body.className = next;
  }
};

export const runSimulator = async () => {
  if (isSimulating.value) return;
  isSimulating.value = true;
  bundleSimCount.value += 1;

  const target = targetName.value;
  const tool = selectedTool.value;

  addLog(`--- Iniciando execução de ${tool} para o alvo: ${target} ---`,);

  if (cleanDistEnabled.value) {
    addLog(`🧹 Limpando diretório de distribuição em packages/server/build/dist...`,);
  }

  await new Promise((r,) => setTimeout(r, 400,));

  if (tool === "esbuild") {
    addLog(
      `🔨 Compilando via esbuild com @deno/esbuild-plugin (minify: ${minifyEnabled.value}, sourcemap: ${sourcemapEnabled.value})...`,
    );
    await new Promise((r,) => setTimeout(r, 350,));
    addLog(`📄 Copiando assets estáticos e injetando versão em manifest.json...`,);
    await new Promise((r,) => setTimeout(r, 300,));
    addLog(`✅ Alvo [${target}] gerado com sucesso: dist/${target === "ui" ? "main.js" : target + ".js"}`,);
  } else if (tool === "denobuild") {
    addLog(`📦 Empacotando com Deno.bundle API nativo (--unstable-bundle)...`,);
    await new Promise((r,) => setTimeout(r, 450,));
    addLog(`✅ Bundle autônomo gerado sem dependências de bundlers externos!`,);
  } else {
    addLog(`🔍 Varrendo workspace e filtrando arquivos por extensões permitidas...`,);
    await new Promise((r,) => setTimeout(r, 350,));
    addLog(`📝 Gerando snapshot em markdown formatado para contexto de IA: snapshots/${target}.md`,);
  }

  addLog(`🎉 Pipeline finalizada com êxito! (Build #${bundleSimCount.value})`,);
  isSimulating.value = false;
};

```

---

## Arquivo: `packages/ui/tests/store.test.ts`

```ts
/**
 * @file store.test.ts
 * @description Testes unitários para os signals e ações do store da UI.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import {
  activeTab,
  addLog,
  applyPreset,
  cleanDistEnabled,
  clearLogs,
  minifyEnabled,
  selectedTool,
  simLogs,
  sourcemapEnabled,
  themeMode,
  toggleTheme,
  totalLogsCount,
} from "../src/stores/app.ts";

describe("UI Store - Signals & Actions", () => {
  it("deve alternar abas ativas reativamente", () => {
    activeTab.value = "overview";
    assertEquals(activeTab.value, "overview",);

    activeTab.value = "cli";
    assertEquals(activeTab.value, "cli",);

    activeTab.value = "snapshots";
    assertEquals(activeTab.value, "snapshots",);
  });

  it("deve alternar modo de tema claro/escuro", () => {
    themeMode.value = "dark";
    toggleTheme();
    assertEquals(themeMode.value, "light",);
    toggleTheme();
    assertEquals(themeMode.value, "dark",);
  });

  it("deve aplicar predefinições de build corretamente", () => {
    applyPreset("prod");
    assertEquals(selectedTool.value, "esbuild");
    assertEquals(minifyEnabled.value, true);
    assertEquals(sourcemapEnabled.value, true);
    assertEquals(cleanDistEnabled.value, true);

    applyPreset("dev");
    assertEquals(selectedTool.value, "esbuild");
    assertEquals(minifyEnabled.value, false);
    assertEquals(sourcemapEnabled.value, true);
    assertEquals(cleanDistEnabled.value, false);

    applyPreset("export");
    assertEquals(selectedTool.value, "export");
    assertEquals(minifyEnabled.value, false);
    assertEquals(sourcemapEnabled.value, false);
    assertEquals(cleanDistEnabled.value, false);
  });

  it("deve adicionar e limpar logs no console de simulação", () => {
    clearLogs();
    assertEquals(simLogs.value.length, 0,);
    assertEquals(totalLogsCount.value, 0,);

    addLog("Evento de teste",);
    assertEquals(totalLogsCount.value, 1,);
    assertEquals(simLogs.value[0]?.includes("Evento de teste",), true,);

    clearLogs();
    assertEquals(totalLogsCount.value, 0,);
  });
});

```

---

